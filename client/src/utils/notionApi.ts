import api from './api';

export const notionApi = {
  // Get current Notion connection status
  getStatus: () => api.get('/notion/status'),
  
  // Get Notion OAuth authorization URL
  getAuthUrl: () => api.get('/notion/auth-url'),
  
  // Handle OAuth callback
  handleCallback: (code: string) => api.post('/notion/callback', { code }),
  
  // Disconnect Notion integration
  disconnect: () => api.delete('/notion/disconnect'),
  
  // Export blog posts to Notion
  exportToNotion: (postId?: string) => 
    api.post('/notion/export', postId ? { postId } : {}),
  
  // Import pages from Notion
  importFromNotion: () => api.post('/notion/import'),
  
  // Get sync history
  getSyncHistory: () => api.get('/notion/sync-history'),
  
  // Get Notion databases/pages list
  getDatabases: () => api.get('/notion/databases'),
  
  // Test Notion connection
  testConnection: () => api.get('/notion/test'),
};