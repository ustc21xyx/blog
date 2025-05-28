const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Notion OAuth configuration
const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID;
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET;
const NOTION_REDIRECT_URI = process.env.NOTION_REDIRECT_URI || 'http://localhost:3000/notion-callback';

// Get Notion OAuth authorization URL
router.get('/auth-url', auth, async (req, res) => {
  try {
    if (!NOTION_CLIENT_ID) {
      return res.status(400).json({ message: 'Notion integration not configured. Please contact administrator.' });
    }
    
    const state = req.user.userId;
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
    res.status(400).json({ message: 'Notion integration not fully configured yet' });
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    res.status(500).json({ message: 'Failed to connect to Notion' });
  }
});

// Get integration status
router.get('/status', auth, async (req, res) => {
  try {
    res.json({ isConnected: false, message: 'Notion integration coming soon!' });
  } catch (error) {
    console.error('Error getting integration status:', error);
    res.status(500).json({ message: 'Failed to get integration status' });
  }
});

// Disconnect integration
router.delete('/disconnect', auth, async (req, res) => {
  try {
    res.json({ message: 'No active Notion connection to disconnect' });
  } catch (error) {
    console.error('Error disconnecting integration:', error);
    res.status(500).json({ message: 'Failed to disconnect from Notion' });
  }
});

// Export blog posts to Notion
router.post('/export', auth, async (req, res) => {
  try {
    res.status(400).json({ message: 'Notion export feature coming soon! Please configure Notion integration first.' });
  } catch (error) {
    console.error('Error exporting to Notion:', error);
    res.status(500).json({ message: 'Failed to export to Notion' });
  }
});

// Import pages from Notion
router.post('/import', auth, async (req, res) => {
  try {
    res.status(400).json({ message: 'Notion import feature coming soon! Please configure Notion integration first.' });
  } catch (error) {
    console.error('Error importing from Notion:', error);
    res.status(500).json({ message: 'Failed to import from Notion' });
  }
});

// Get sync history
router.get('/sync-history', auth, async (req, res) => {
  try {
    res.json({ history: [] });
  } catch (error) {
    console.error('Error getting sync history:', error);
    res.status(500).json({ message: 'Failed to get sync history' });
  }
});

// Test connection
router.get('/test', auth, async (req, res) => {
  try {
    res.status(400).json({ message: 'Notion integration not configured yet' });
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({ message: 'Connection test failed' });
  }
});

module.exports = router;