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

// Helper function to clean and validate content for Notion
const cleanContentForNotion = (content) => {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  // Remove or replace problematic characters
  let cleaned = content
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/\u00A0/g, ' ') // Replace non-breaking spaces with regular spaces
    .replace(/[\uFEFF]/g, '') // Remove BOM characters
    .trim();
  
  // Ensure content doesn't exceed reasonable limits
  if (cleaned.length > 50000) {
    cleaned = cleaned.substring(0, 50000) + '\n\n[内容过长，已截断...]';
  }
  
  return cleaned;
};

// Helper function to create safe rich text blocks
const createSafeRichTextBlock = (text, maxLength = 1800) => {
  const cleanText = cleanContentForNotion(text);
  if (!cleanText) {
    return null;
  }
  
  // Truncate if too long
  const truncatedText = cleanText.length > maxLength ? 
    cleanText.substring(0, maxLength) + '...' : cleanText;
  
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: {
            content: truncatedText
          }
        }
      ]
    }
  };
};

// Helper function to create content blocks from text
const createContentBlocks = (content) => {
  const blocks = [];
  
  if (!content || typeof content !== 'string') {
    return blocks;
  }
  
  // Split content into paragraphs
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
  
  for (const paragraph of paragraphs) {
    const cleanParagraph = cleanContentForNotion(paragraph);
    
    if (cleanParagraph.length === 0) continue;
    
    // Split long paragraphs into chunks
    const chunks = splitTextIntoChunks(cleanParagraph, 1800);
    
    for (const chunk of chunks) {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: chunk
              }
            }
          ]
        }
      });
    }
  }
  
  return blocks;
};

// Helper function to split text into chunks
const splitTextIntoChunks = (text, maxLength) => {
  if (text.length <= maxLength) {
    return [text];
  }
  
  const chunks = [];
  let currentChunk = '';
  const sentences = text.split(/[。！？.!?]/);
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        // If single sentence is too long, force split
        chunks.push(sentence.substring(0, maxLength));
        currentChunk = sentence.substring(maxLength);
      }
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.filter(chunk => chunk.length > 0);
};

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

    // First, verify the workspace access
    try {
      const workspaces = await notion.search({
        filter: {
          value: 'page',
          property: 'object'
        },
        page_size: 1
      });
    } catch (error) {
      console.error('Workspace access error:', error);
      return res.status(400).json({ 
        message: '无法访问Notion工作区。请检查集成权限。',
        error: error.message 
      });
    }

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
    let errors = [];

    for (const post of posts) {
      try {
        // Clean and validate content
        const cleanTitle = cleanContentForNotion(post.title || '无标题');
        const cleanContent = cleanContentForNotion(post.content || '');
        
        // Create page properties with correct format
        const pageProperties = {
          title: {
            title: [
              {
                type: 'text',
                text: {
                  content: cleanTitle.substring(0, 2000) // Notion title limit
                }
              }
            ]
          }
        };

        // Create children blocks for content
        const children = [];
        
        // Add metadata block
        children.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: `作者: ${post.author?.displayName || post.author?.username || '未知'}`
                }
              }
            ]
          }
        });

        children.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: `发布时间: ${post.createdAt ? new Date(post.createdAt).toLocaleDateString('zh-CN') : '未知'}`
                }
              }
            ]
          }
        });

        // Add content blocks
        if (cleanContent) {
          const contentBlocks = createContentBlocks(cleanContent);
          children.push(...contentBlocks);
        }

        // Create the page with workspace as parent
        const pageData = {
          parent: {
            type: 'workspace',
            workspace: true
          },
          properties: pageProperties,
          children: children.slice(0, 100) // Notion API limit for children in create request
        };

        console.log('Creating page with data:', JSON.stringify(pageData, null, 2));

        const response = await notion.pages.create(pageData);
        
        // If there are more content blocks, add them separately
        if (children.length > 100) {
          const remainingBlocks = children.slice(100);
          for (let i = 0; i < remainingBlocks.length; i += 100) {
            const blockChunk = remainingBlocks.slice(i, i + 100);
            await notion.blocks.children.append({
              block_id: response.id,
              children: blockChunk
            });
          }
        }

        successCount++;
        console.log(`Successfully exported: ${post.title}`);
        
      } catch (error) {
        console.error(`Failed to export post "${post.title}":`, error);
        errors.push({
          title: post.title,
          error: error.message,
          code: error.code
        });
      }
    }

    // Update integration stats
    await NotionIntegration.findByIdAndUpdate(integration._id, {
      $inc: { 
        exportCount: successCount,
        lastExportAt: new Date()
      }
    });

    if (successCount === 0) {
      return res.status(400).json({
        message: '导出失败。所有文章都无法导出到Notion。',
        errors: errors
      });
    }

    res.json({
      message: `成功导出 ${successCount} 篇文章到Notion`,
      successCount,
      totalAttempted: posts.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Notion export error:', error);
    res.status(500).json({ 
      message: '导出到Notion时发生错误',
      error: error.message,
      code: error.code
    });
  }
});

// Get available Notion pages
router.get('/pages', auth, async (req, res) => {
  try {
    const integration = await NotionIntegration.findOne({ 
      userId: req.user._id,
      isActive: true 
    });

    if (!integration) {
      return res.status(400).json({ message: 'Notion integration not found' });
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
      page_size: 20
    });

    const pages = searchResponse.results.map(page => ({
      id: page.id,
      title: page.properties?.title?.title?.[0]?.plain_text || 
             page.properties?.Name?.title?.[0]?.plain_text ||
             'Untitled Page',
      lastEditedTime: page.last_edited_time,
      url: page.url
    }));

    res.json({ pages });
  } catch (error) {
    console.error('Error fetching Notion pages:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch Notion pages' });
  }
});

// Import specific page from Notion
router.post('/import', auth, async (req, res) => {
  try {
    const { pageId } = req.body;
    const userId = req.user._id;

    if (!pageId) {
      return res.status(400).json({ message: 'Page ID is required' });
    }

    const integration = await NotionIntegration.findOne({ 
      userId,
      isActive: true 
    });

    if (!integration) {
      return res.status(400).json({ message: 'Notion integration not found. Please connect to Notion first.' });
    }

    const notion = new Client({ auth: integration.accessToken });

    try {
      // Get page info with better error handling
      let page;
      try {
        page = await notion.pages.retrieve({ page_id: pageId });
      } catch (retrieveError) {
        if (retrieveError.code === 'object_not_found') {
          return res.status(404).json({
            message: 'Page not found. Make sure the page exists and your Notion integration has access to it.'
          });
        } else if (retrieveError.code === 'unauthorized') {
          return res.status(403).json({
            message: 'Access denied. Please make sure your Notion integration has been granted access to this page.'
          });
        }
        throw retrieveError;
      }
      
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
        integration.syncHistory.push({
          type: 'import',
          title: `Failed to import: ${title}`,
          status: 'failed',
          error: 'Article with this title already exists',
          metadata: {
            notionPageId: pageId
          }
        });
        await integration.save();
        return res.status(400).json({ message: 'Article with this title already exists' });
      }

      // Get page content
      const blocks = await notion.blocks.children.list({
        block_id: pageId,
        page_size: 100
      });

      // Convert blocks to markdown
      let content = '';
      for (const block of blocks.results) {
        if (block.type === 'paragraph' && block.paragraph?.rich_text) {
          content += block.paragraph.rich_text.map(text => text.plain_text).join('') + '\n\n';
        } else if (block.type === 'heading_1' && block.heading_1?.rich_text) {
          content += '# ' + block.heading_1.rich_text.map(text => text.plain_text).join('') + '\n\n';
        } else if (block.type === 'heading_2' && block.heading_2?.rich_text) {
          content += '## ' + block.heading_2.rich_text.map(text => text.plain_text).join('') + '\n\n';
        } else if (block.type === 'heading_3' && block.heading_3?.rich_text) {
          content += '### ' + block.heading_3.rich_text.map(text => text.plain_text).join('') + '\n\n';
        } else if (block.type === 'bulleted_list_item' && block.bulleted_list_item?.rich_text) {
          content += '- ' + block.bulleted_list_item.rich_text.map(text => text.plain_text).join('') + '\n';
        } else if (block.type === 'numbered_list_item' && block.numbered_list_item?.rich_text) {
          content += '1. ' + block.numbered_list_item.rich_text.map(text => text.plain_text).join('') + '\n';
        } else if (block.type === 'code' && block.code?.rich_text) {
          content += '```\n' + block.code.rich_text.map(text => text.plain_text).join('') + '\n```\n\n';
        }
      }

      // Create blog post
      const newPost = new BlogPost({
        title,
        content: content || 'Content imported from Notion',
        excerpt: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
        author: userId,
        category: 'other',
        tags: ['notion', 'imported'],
        isPublished: false // Import as draft first
      });

      await newPost.save();

      integration.syncHistory.push({
        type: 'import',
        title: `Imported: ${title}`,
        status: 'success',
        metadata: {
          notionPageId: pageId,
          blogPostId: newPost._id.toString(),
          itemCount: 1
        }
      });

      integration.lastSyncAt = new Date();
      await integration.save();

      res.json({
        message: 'Successfully imported page from Notion',
        post: newPost
      });
    } catch (error) {
      console.error(`Error importing page ${pageId}:`, error);
      
      integration.syncHistory.push({
        type: 'import',
        title: `Failed to import page`,
        status: 'failed',
        error: error.message,
        metadata: {
          notionPageId: pageId
        }
      });
      await integration.save();

      throw error;
    }
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