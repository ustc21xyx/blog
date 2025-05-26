const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get user profile
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload avatar
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Generate the avatar URL (store relative path for flexibility)
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Update user's avatar in database
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Avatar uploaded successfully',
      avatarUrl,
      user: updatedUser
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Server error during avatar upload' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('displayName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('Display name must be 1-50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('favoriteAnime')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Favorite anime must be an array with maximum 20 items'),
  body('socialLinks.twitter')
    .optional()
    .isURL()
    .withMessage('Invalid Twitter URL'),
  body('socialLinks.github')
    .optional()
    .isURL()
    .withMessage('Invalid GitHub URL'),
  body('socialLinks.mal')
    .optional()
    .isURL()
    .withMessage('Invalid MyAnimeList URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      displayName,
      bio,
      avatar,
      favoriteAnime,
      socialLinks
    } = req.body;

    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (favoriteAnime !== undefined) updateData.favoriteAnime = favoriteAnime;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/password', auth, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== 管理员管理 API ==========

// 提升用户为管理员 (仅管理员)
router.put('/:userId/promote', adminAuth, async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.userId) {
      return res.status(400).json({ message: 'Cannot modify your own role' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'User is already an admin' });
    }

    user.role = 'admin';
    await user.save();

    res.json({ 
      message: `User ${user.username} has been promoted to admin`,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Promote user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 降级管理员为普通用户 (仅管理员)
router.put('/:userId/demote', adminAuth, async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.userId) {
      return res.status(400).json({ message: 'Cannot modify your own role' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'user') {
      return res.status(400).json({ message: 'User is already a regular user' });
    }

    user.role = 'user';
    await user.save();

    res.json({ 
      message: `User ${user.username} has been demoted to regular user`,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Demote user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 获取所有管理员列表 (仅管理员)
router.get('/admins', adminAuth, async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ admins });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 二次元密码升级为管理员
router.post('/upgrade-admin', auth, [
  body('upgradeCode')
    .notEmpty()
    .withMessage('Upgrade code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (req.user.role === 'admin') {
      return res.status(400).json({ message: 'You are already an admin' });
    }

    const { upgradeCode } = req.body;
    
    // 二次元梗密码列表 (与前端保持一致)
    const validCodes = [
      '欧尼酱大变态', '雅蠛蝶', '纳尼', '无路赛', '红豆泥斯国一', '八嘎呀路', '卡哇伊', '多摩', 'poi', '马达马达',
      '德丝', '达咩', '阿里嘎多', '司马塞', '哈拉绍', '莫西莫西', '一库', '猴塞雷', '萌萌哒', '傲娇', '病娇', '呆萌',
      '宅腐萌', '妹控', '萝莉控', '奥义·千年杀', '多重影分身', '瞬身术', '木叶忍者', '我要成为海贼王', '超级赛亚人',
      '龙珠', '完全体', '最终形态', '魔法少女', '变身', '守护甜心', '月野兔', '美少女战士', '初音未来', 'MIKU', '葱娘',
      '黑长直', '双马尾', '猫耳娘', '兽耳', '触手', '本子', '里番', '绅士', '肥宅快乐水', '二次元老婆', '三次元滚开',
      '现充爆炸吧', 'FFF团', '单身狗', '死宅', '引き篭もり', 'NEET', '次元壁', '破次元壁', '异世界', '穿越', '转生',
      '后宫', '修罗场', '便当', '刀子', '发糖', '发刀', '致郁', '治愈', '燃', '萌', '腐', '百合', '耽美', 'BL', 'GL',
      '攻受', '总受', '总攻', '女王受', '抖S', '抖M', '天然呆', '黑化', '洗白', '开后宫', '收后宫', '立flag', '倒flag',
      '死亡flag', '强制续命', '氪金', '非酋', '欧皇', '抽卡', '十连', '出货', '保底', '歪了', '毕业了', '入坑', '脱坑',
      '安利', '墙头', '爬墙', '本命', '大法好', 'awsl', 'yyds', 'prpr', 'mmp', 'gg', 'orz', '233', '666', '2333',
      '23333', '蛤蛤蛤', '哈哈哈', '嘤嘤嘤', '呜呜呜', '555', '哭唧唧', '嘤嘤怪', '元气满满', '满血复活', 'HP-1',
      'MP不足', '掉san', '理智蒸发', '脑子瓦特了', '脑补', '妄想', '中二病', '厨二病', '黑历史', '社死', '原地去世',
      '当场去世', '我死了', '已逝', '鸽了', '咕咕咕', '真香', '蛙趣', '有内味了', '确实', '没毛病', '问题不大',
      '稳得一批', '牛逼', '可以的', '奶思', '橘势大好', '橘里橘气', '正义的伙伴', 'English母语', '本子画师',
      '立绘师', 'CV', '监督', '脚本', '原画师', '声优', '中之人', '皮套人', 'Vtuber', '虚拟主播', '切片', '单推',
      'DD', '撒娇', '卖萌', '装可爱', '嘟嘟嘟', '啵啵啵', '摸摸哒', '抱抱', '亲亲', '贴贴', '蹭蹭', '揉揉', '戳戳',
      '刺溜', '吨吨吨', '咔嚓', '嗷呜', '旺', '喵', '汪', '嘎', '咕', '哞', '嘶', '嗨嗨嗨', '达咩哟', '不可以',
      'dame', 'yamete', 'kimoji', 'itai', 'oshimai', 'owari', 'hajimari', '我摊牌了', '你是懂的', '鸡你太美',
      '只因', '纯路人', '真爱粉', '路转粉', '粉转黑', '黑转粉', '回踩', '脱粉', '入股', '关注', '取关', '拉黑',
      '举报', '封号', '炸号', '开小号', '水军', '黑粉', '白莲花', '绿茶', '海王', '舔狗', '工具人', '备胎', '正宫',
      '小三', '渣男', '渣女', '钢铁直男', '钢铁直女', '百合控', '腐女', '腐男', '宅男', '宅女', '处男', '处女',
      '母胎solo', '万年单身', '恋爱绝缘体', '恋爱废柴', '恋爱白痴', '木头', '榆木疙瘩', '钢铁直男癌', '异性绝缘体'
    ];

    if (!validCodes.includes(upgradeCode.trim())) {
      return res.status(400).json({ message: '密码错误！请输入正确的二次元密码' });
    }

    // 升级用户为管理员
    req.user.role = 'admin';
    await req.user.save();

    console.log(`🎉 User ${req.user.username} has been upgraded to admin using code: ${upgradeCode}`);

    res.json({
      message: '恭喜！你已经成为管理员了！',
      user: {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        displayName: req.user.displayName,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Admin upgrade error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;