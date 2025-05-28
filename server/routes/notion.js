const express = require('express');
const { Client } = require('@notionhq/client');
const router = express.Router();
const { auth } = require('../middleware/auth');
const NotionIntegration = require('../models/NotionIntegration');
const BlogPost = require('../models/BlogPost');

// Notion OAuth configuration
const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID;
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET;
const NOTION_REDIRECT_URI = process.env.NOTION_REDIRECT_URI || 'https://blog-alpha-self-72.vercel.app/notion-callback';

// Get Notion OAuth authorization URL
router.get('/auth-url', auth, async (req, res) => {
  try {
    if (!NOTION_CLIENT_ID) {
      return res.status(400).json({ message: 'Notion integration not configured. Please contact administrator.' });
    }
    
    const state = req.user._id.toString();
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
    const userId = req.user._id;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    if (!NOTION_CLIENT_ID || !NOTION_CLIENT_SECRET) {
      return res.status(400).json({ message: 'Notion OAuth not configured' });
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
      console.error('OAuth token error:', tokenData);
      throw new Error(tokenData.error || 'Failed to exchange code for token');
    }

    // Save or update integration
    const integration = await NotionIntegration.findOneAndUpdate(
      { userId },
      {
        accessToken: tokenData.access_token,
        workspaceId: tokenData.workspace_id,
        workspaceName: tokenData.workspace_name || 'Notion Workspace',
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
      userId: req.user._id,
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
      { userId: req.user._id },
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
    const userId = req.user._id;

    const integration = await NotionIntegration.findOne({ 
      userId,
      isActive: true 
    });

    if (!integration) {
      return res.status(400).json({ message: 'Notion integration not found. Please connect to Notion first.' });
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

    let successCount = 0;
    let failedCount = 0;

    for (const post of posts) {
      try {
        // Create a simple page in the user's workspace
        // Since we don't have a specific database, we'll create individual pages
        const page = await notion.pages.create({
          parent: {
            type: 'page_id',
            page_id: integration.workspaceId // This might need adjustment based on Notion's structure
          },
          properties: {
            title: {
              title: [
                {
                  type: 'text',
                  text: {
                    content: post.title
                  }
                }
              ]
            }
          },
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: {
                      content: post.excerpt || post.content.substring(0, 200)
                    }
                  }
                ]
              }
            },
            {
              object: 'block',
              type: 'divider',
              divider: {}
            },
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: {
                      content: post.content.substring(0, 2000) // Notion has limits
                    }
                  }
                ]
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
            notionPageId: page.id,
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

// Import pages from Notion (simplified version)
router.post('/import', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const integration = await NotionIntegration.findOne({ 
      userId,
      isActive: true 
    });

    if (!integration) {
      return res.status(400).json({ message: 'Notion integration not found. Please connect to Notion first.' });
    }

    const notion = new Client({ auth: integration.accessToken });

    // Search for pages that the bot has access to
    const searchResponse = await notion.search({
      filter: {
        value: 'page',
        property: 'object'
      },
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time'
      },
      page_size: 10
    });

    let successCount = 0;
    let failedCount = 0;

    for (const page of searchResponse.results) {
      try {
        // Get page title
        const title = page.properties?.title?.title?.[0]?.plain_text || 
                     page.properties?.Name?.title?.[0]?.plain_text ||
                     'Untitled from Notion';
        
        // Check if post already exists
        const existingPost = await BlogPost.findOne({ 
          title,
          author: userId 
        });

        if (existingPost) {
          failedCount++;
          continue;
        }

        // Get page content (simplified)
        const blocks = await notion.blocks.children.list({
          block_id: page.id,
          page_size: 50
        });

        // Convert blocks to simple text
        let content = '';
        for (const block of blocks.results) {
          if (block.type === 'paragraph' && block.paragraph?.rich_text) {
            content += block.paragraph.rich_text.map(text => text.plain_text).join('') + '\n\n';
          } else if (block.type === 'heading_1' && block.heading_1?.rich_text) {
            content += '# ' + block.heading_1.rich_text.map(text => text.plain_text).join('') + '\n\n';
          } else if (block.type === 'heading_2' && block.heading_2?.rich_text) {
            content += '## ' + block.heading_2.rich_text.map(text => text.plain_text).join('') + '\n\n';
          }
          // Add more block types as needed
        }

        // Create blog post
        const newPost = new BlogPost({
          title,
          content: content || 'Content imported from Notion',
          excerpt: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
          author: userId,
          category: 'other', // Use valid category
          tags: ['notion', 'imported'],
          isPublished: false // Import as draft first
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
      userId: req.user._id,
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
      userId: req.user._id,
      isActive: true 
    });

    if (!integration) {
      return res.status(400).json({ message: 'Notion integration not found' });
    }

    const notion = new Client({ auth: integration.accessToken });
    
    // Test connection by getting bot user info
    const botInfo = await notion.users.me();
    
    res.json({ 
      message: 'Connection successful',
      botName: botInfo.name,
      workspaceName: integration.workspaceName
    });
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({ message: error.message || 'Connection test failed' });
  }
});

module.exports = router;