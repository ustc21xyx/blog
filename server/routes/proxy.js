const express = require('express');
const axios = require('axios');

const router = express.Router();

// 图片代理路由，解决CORS问题
router.get('/image', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // 验证URL是否为有效的图片链接
    if (!url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) && !url.includes('bgm.tv') && !url.includes('bangumi')) {
      return res.status(400).json({ error: 'Invalid image URL' });
    }

    const response = await axios.get(url, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://bgm.tv/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
      timeout: 10000
    });

    // 设置响应头
    res.set({
      'Content-Type': response.headers['content-type'] || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400', // 缓存1天
      'Access-Control-Allow-Origin': '*',
    });

    // 将图片流传递给客户端
    response.data.pipe(res);
  } catch (error) {
    console.error('Proxy image error:', error.message);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

module.exports = router;