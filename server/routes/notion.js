const express = require('express');
const { Client } = require('@notionhq/client');
const router = express.Router();
const auth = require('../middleware/auth');
const NotionIntegration = require('../models/NotionIntegration');
const BlogPost = require('../models/BlogPost');

// Notion OAuth configuration
const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID;
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET;
const NOTION_REDIRECT_URI = process.env.NOTION_REDIRECT_URI || 'http://localhost:3000/notion-callback';

// Get Notion OAuth authorization URL
router.get('/auth-url', auth, async (req, res) => {
  try {
    const state = req.user.userId; // Use user ID as state for security
    const authUrl = `https://api.notion.com/v1/oauth/authorize?` +
      `client_id=${NOTION_CLIENT_ID}&` +
      `response_type=code&` +
      `owner=user&` +
      `redirect_uri=${encodeURIComponent(NOTION_REDIRECT_URI)}&` +
      `state=${state}`;
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ message: 'Failed to generate authorization URL' });
  }
});

// Handle OAuth callback
router.post('/callback', auth, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.userId;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    // Exchange code for access token
    const response = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString('base64')}`
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: NOTION_REDIRECT_URI
      })
    });

    const tokenData = await response.json();

    if (!response.ok) {
      throw new Error(tokenData.error || 'Failed to exchange code for token');
    }

    // Initialize Notion client to get workspace info
    const notion = new Client({ auth: tokenData.access_token });
    
    // Get user info to extract workspace details
    const userInfo = await notion.users.me();
    
    // Save or update integration
    const integration = await NotionIntegration.findOneAndUpdate(
      { userId },
      {
        accessToken: tokenData.access_token,
        workspaceId: tokenData.workspace_id,
        workspaceName: tokenData.workspace_name || userInfo.name,
        botId: tokenData.bot_id,
        isActive: true,
        lastSyncAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({ 
      message: 'Successfully connected to Notion',
      workspaceName: integration.workspaceName
    });
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    res.status(500).json({ message: error.message || 'Failed to connect to Notion' });
  }
});

// Get integration status
router.get('/status', auth, async (req, res) => {
  try {
    const integration = await NotionIntegration.findOne({ 
      userId: req.user.userId,
      isActive: true 
    });

    if (!integration) {
      return res.json({ isConnected: false });
    }

    res.json({
      isConnected: true,
      workspaceName: integration.workspaceName,
      connectedAt: integration.createdAt,
      lastSync: integration.lastSyncAt
    });
  } catch (error) {
    console.error('Error getting integration status:', error);
    res.status(500).json({ message: 'Failed to get integration status' });
  }
});

// Disconnect integration
router.delete('/disconnect', auth, async (req, res) => {
  try {
    await NotionIntegration.findOneAndUpdate(
      { userId: req.user.userId },
      { isActive: false }
    );

    res.json({ message: 'Successfully disconnected from Notion' });
  } catch (error) {
    console.error('Error disconnecting integration:', error);
    res.status(500).json({ message: 'Failed to disconnect from Notion' });
  }
});

// Export blog posts to Notion
router.post('/export', auth, async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.userId;

    const integration = await NotionIntegration.findOne({ 
      userId,
      isActive: true 
    });

    if (!integration) {
      return res.status(400).json({ message: 'Notion integration not found' });
    }

    const notion = new Client({ auth: integration.accessToken });

    // Get blog posts to export
    const query = { author: userId, isPublished: true };
    if (postId) {
      query._id = postId;
    }
    
    const posts = await BlogPost.find(query).populate('author', 'displayName username');
    
    if (posts.length === 0) {
      return res.status(400).json({ message: 'No published posts found to export' });
    }

    // Create a database if it doesn't exist
    let databaseId = integration.databaseId;
    if (!databaseId) {
      // Create a new database for blog posts
      const database = await notion.databases.create({
        parent: { type: 'page_id', page_id: 'YOUR_PARENT_PAGE_ID' }, // This needs to be configured
        title: [{ type: 'text', text: { content: 'Blog Posts' } }],
        properties: {
          'Title': { title: {} },
          'Content': { rich_text: {} },
          'Published': { date: {} },
          'Category': { select: { options: [] } },
          'Tags': { multi_select: { options: [] } }
        }
      });
      
      databaseId = database.id;
      integration.databaseId = databaseId;
      await integration.save();
    }

    let successCount = 0;
    let failedCount = 0;

    for (const post of posts) {
      try {
        // Create page in Notion
        await notion.pages.create({
          parent: { database_id: databaseId },
          properties: {
            'Title': {
              title: [{ type: 'text', text: { content: post.title } }]
            },
            'Content': {
              rich_text: [{ type: 'text', text: { content: post.content.substring(0, 2000) } }]
            },
            'Published': {
              date: { start: post.createdAt.toISOString().split('T')[0] }
            },
            'Category': {
              select: { name: post.category || 'General' }
            }
          },
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{ type: 'text', text: { content: post.content } }]
              }
            }
          ]
        });

        successCount++;

        // Add to sync history
        integration.syncHistory.push({
          type: 'export',
          title: `Exported: ${post.title}`,
          status: 'success',
          metadata: {
            blogPostId: post._id.toString(),
            itemCount: 1
          }
        });
      } catch (error) {
        console.error(`Error exporting post ${post.title}:`, error);
        failedCount++;

        integration.syncHistory.push({
          type: 'export',
          title: `Failed to export: ${post.title}`,
          status: 'failed',
          error: error.message,
          metadata: {
            blogPostId: post._id.toString()
          }
        });
      }
    }

    integration.lastSyncAt = new Date();
    await integration.save();

    res.json({
      message: `Export completed: ${successCount} successful, ${failedCount} failed`,
      count: successCount,
      failed: failedCount
    });
  } catch (error) {
    console.error('Error exporting to Notion:', error);
    res.status(500).json({ message: error.message || 'Failed to export to Notion' });
  }
});

// Import pages from Notion
router.post('/import', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const integration = await NotionIntegration.findOne({ 
      userId,
      isActive: true 
    });

    if (!integration) {
      return res.status(400).json({ message: 'Notion integration not found' });
    }

    if (!integration.databaseId) {
      return res.status(400).json({ message: 'No Notion database configured for import' });
    }

    const notion = new Client({ auth: integration.accessToken });

    // Query database for pages
    const response = await notion.databases.query({
      database_id: integration.databaseId,
      sorts: [{ property: 'Published', direction: 'descending' }]
    });

    let successCount = 0;
    let failedCount = 0;

    for (const page of response.results) {
      try {
        const title = page.properties.Title?.title?.[0]?.text?.content || 'Untitled';
        
        // Get page content
        const blocks = await notion.blocks.children.list({
          block_id: page.id
        });

        // Convert blocks to markdown (simplified)
        let content = '';
        for (const block of blocks.results) {
          if (block.type === 'paragraph' && block.paragraph?.rich_text) {
            content += block.paragraph.rich_text.map(text => text.plain_text).join('') + '\n\n';
          }
          // Add more block type conversions as needed
        }

        // Check if post already exists
        const existingPost = await BlogPost.findOne({ 
          title,
          author: userId 
        });

        if (existingPost) {
          failedCount++;
          continue;
        }

        // Create blog post
        const newPost = new BlogPost({
          title,
          content: content || 'Content imported from Notion',
          excerpt: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
          author: userId,
          category: page.properties.Category?.select?.name || 'General',
          tags: page.properties.Tags?.multi_select?.map(tag => tag.name) || [],
          isPublished: true
        });

        await newPost.save();
        successCount++;

        integration.syncHistory.push({
          type: 'import',
          title: `Imported: ${title}`,
          status: 'success',
          metadata: {
            notionPageId: page.id,
            blogPostId: newPost._id.toString(),
            itemCount: 1
          }
        });
      } catch (error) {
        console.error(`Error importing page:`, error);
        failedCount++;

        integration.syncHistory.push({
          type: 'import',
          title: `Failed to import page`,
          status: 'failed',
          error: error.message,
          metadata: {
            notionPageId: page.id
          }
        });
      }
    }

    integration.lastSyncAt = new Date();
    await integration.save();

    res.json({
      message: `Import completed: ${successCount} successful, ${failedCount} failed`,
      count: successCount,
      failed: failedCount
    });
  } catch (error) {
    console.error('Error importing from Notion:', error);
    res.status(500).json({ message: error.message || 'Failed to import from Notion' });
  }
});

// Get sync history
router.get('/sync-history', auth, async (req, res) => {
  try {
    const integration = await NotionIntegration.findOne({ 
      userId: req.user.userId,
      isActive: true 
    });

    if (!integration) {
      return res.json({ history: [] });
    }

    // Return last 50 sync records, sorted by most recent
    const history = integration.syncHistory
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50)
      .map(record => ({
        id: record._id,
        type: record.type,
        title: record.title,
        status: record.status,
        timestamp: record.createdAt,
        error: record.error
      }));

    res.json({ history });
  } catch (error) {
    console.error('Error getting sync history:', error);
    res.status(500).json({ message: 'Failed to get sync history' });
  }
});

// Test connection
router.get('/test', auth, async (req, res) => {
  try {
    const integration = await NotionIntegration.findOne({ 
      userId: req.user.userId,
      isActive: true 
    });

    if (!integration) {
      return res.status(400).json({ message: 'Notion integration not found' });
    }

    const notion = new Client({ auth: integration.accessToken });
    
    // Test connection by getting user info
    const userInfo = await notion.users.me();
    
    res.json({ 
      message: 'Connection successful',
      user: userInfo.name 
    });
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({ message: error.message || 'Connection test failed' });
  }
});

module.exports = router;