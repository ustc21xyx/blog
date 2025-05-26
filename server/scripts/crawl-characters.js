const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
require('dotenv').config();

// 导入Character模型
const Character = require('../models/Character');

// 连接数据库
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 连接成功');
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error);
    process.exit(1);
  }
}

// 热门动漫角色列表 - 扩展版
const characterList = [
  // 经典角色
  '鲁路修',
  '夜神月',
  '初音未来',
  '江户川柯南',
  '孙悟空',
  '路飞',
  
  // 热门动漫角色
  '灶门炭治郎',
  '我妻善逸',
  '嘴平伊之助',
  '灶门祢豆子',
  
  // JOJO系列
  '空条承太郎',
  '乔鲁诺·乔巴拿',
  '东方仗助',
  
  // 火影忍者
  '旋涡鸣人',
  '宇智波佐助',
  '春野樱',
  '旗木卡卡西',
  
  // 新世纪福音战士
  '碇真嗣',
  '绫波丽',
  '明日香',
  
  // 进击的巨人
  '艾伦·耶格尔',
  '三笠·阿克曼',
  '阿尔敏·阿诺德',
  '利威尔',
  
  // 我的英雄学院
  '绿谷出久',
  '爆豪胜己',
  '丽日御茶子',
  '轰焦冻',
  
  // 咒术回战
  '虎杖悠仁',
  '伏黑惠',
  '钉崎野蔷薇',
  '五条悟',
  
  // 东京喰种
  '金木研',
  '雾岛董香',
  
  // 一拳超人
  '埼玉',
  '杰诺斯',
  
  // 死神
  '黑崎一护',
  '朽木露琪亚',
  '井上织姬',
  
  // 全职猎人
  '小杰',
  '奇犽',
  '酷拉皮卡',
  '雷欧力',
  
  // 日常系
  '比企谷八幡',
  '雪之下雪乃',
  '由比滨结衣',
  '桐间纱路',
  '保登心爱',
  '天天座理世',
  '宇佐美奈奈子',
  '香风智乃',
  
  // 虚拟偶像
  '初音未来',
  '镜音铃',
  '镜音连',
  '巡音流歌',
  
  // Re:Zero
  '菜月昴',
  '艾米莉亚',
  '雷姆',
  '拉姆',
  
  // 约会大作战
  '五河士道',
  '夜刀神十香',
  '时崎狂三',
  
  // 轻音少女
  '平泽唯',
  '秋山澪',
  '田井中律',
  '琴吹紬',
  '中野梓',
  
  // 魔法少女小圆
  '鹿目圆',
  '晓美焰',
  '美树沙耶香',
  '巴麻美',
  '佐仓杏子'
];

// 从萌娘百科爬取角色信息
async function scrapeCharacterFromMoegirl(characterName) {
  try {
    const encodedName = encodeURIComponent(characterName);
    console.log(`🔍 正在爬取: ${characterName}`);
    
    const response = await axios.get(`https://zh.moegirl.org.cn/${encodedName}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    
    // 获取角色名称
    const pageTitle = $('title').text().replace(' - 萌娘百科 万物皆可萌的百科全书', '').trim();
    const name = pageTitle || characterName;
    
    // 获取角色图片
    let image = '';
    const imageSelectors = [
      '.thumb img',
      '.thumbinner img', 
      '.wikitable img',
      '.image img',
      'img[src*="moegirl"]'
    ];
    
    for (const selector of imageSelectors) {
      const img = $(selector).first().attr('src');
      if (img && !img.includes('svg') && !img.includes('icon') && !img.includes('Disambig')) {
        if (img.startsWith('//')) {
          image = `https:${img}`;
        } else if (img.startsWith('/')) {
          image = `https://zh.moegirl.org.cn${img}`;
        } else if (img.startsWith('http')) {
          image = img;
        }
        if (image) break;
      }
    }
    
    // 获取角色描述
    let description = '';
    const descriptionSelectors = [
      '.mw-parser-output > p',
      '#mw-content-text p',
      '.mw-content-ltr p'
    ];
    
    for (const selector of descriptionSelectors) {
      $(selector).each((i, p) => {
        const text = $(p).text().trim();
        if (text.length > 30 && 
            !text.includes('编辑') && 
            !text.includes('本页面') && 
            !text.includes('萌娘百科') &&
            !text.includes('重定向') &&
            !text.includes('可能指')) {
          description = text;
          return false;
        }
      });
      if (description) break;
    }
    
    // 解析信息表格
    let originalName = '';
    let birthday = '';
    let height = '';
    let cv = '';
    let anime = [];
    
    $('.wikitable, table').each((i, table) => {
      $(table).find('tr').each((j, row) => {
        const $row = $(row);
        const cells = $row.find('th, td');
        
        if (cells.length >= 2) {
          const label = $(cells[0]).text().trim();
          const value = $(cells[1]).text().trim();
          
          if (!label || !value) return;
          
          if (/(?:日文名|原名|本名|英文名|罗马音)/i.test(label)) {
            originalName = value;
          } else if (/(?:生日|出生日期|出生|诞生|发售日)/i.test(label)) {
            birthday = value;
          } else if (/(?:身高|高度)/i.test(label)) {
            height = value;
          } else if (/(?:声优|CV|配音|声源)/i.test(label)) {
            cv = value.split('点击查看其他地区')[0].trim(); // 清理多余信息
          } else if (/(?:出自|登场作品|作品|所属作品|来源|系列)/i.test(label)) {
            const cleanValue = value.replace(/\s*\([^)]*\)\s*/g, '').trim();
            if (cleanValue && cleanValue.length > 1 && cleanValue.length < 50) {
              anime.push(cleanValue);
            }
          }
        }
      });
    });
    
    // 从链接中提取作品信息
    if (anime.length === 0) {
      $('a').each((i, link) => {
        const href = $(link).attr('href') || '';
        const text = $(link).text().trim();
        if (text.length > 2 && text.length < 30 && 
            (text.includes('系列') || text.includes('物语') || 
             text.includes('传说') || text.includes('战记'))) {
          anime.push(text);
        }
      });
      anime = [...new Set(anime)].slice(0, 3); // 去重并限制数量
    }

    // 生成标签
    const tags = [];
    if (anime.some(a => a.includes('少女'))) tags.push('少女');
    if (anime.some(a => a.includes('机器人') || a.includes('高达'))) tags.push('机甲');
    if (anime.some(a => a.includes('魔法'))) tags.push('魔法');
    if (anime.some(a => a.includes('学园') || a.includes('学校'))) tags.push('校园');
    if (cv) tags.push('有声优');

    console.log(`✅ 爬取成功: ${name}`);
    
    return {
      name: name,
      originalName: originalName || '',
      image: image || '',
      description: description || '暂无描述',
      anime: anime.length > 0 ? anime : ['未知作品'],
      details: {
        birthday: birthday || '未知',
        height: height || '未知',
        weight: '未知',
        cv: cv || '未知'
      },
      source: 'moegirl',
      sourceUrl: `https://zh.moegirl.org.cn/${encodedName}`,
      tags: tags,
      popularity: Math.floor(Math.random() * 100), // 随机人气值
      isActive: true
    };
    
  } catch (error) {
    console.error(`❌ 爬取失败 ${characterName}:`, error.message);
    return null;
  }
}

// 保存角色到数据库
async function saveCharacter(characterData) {
  try {
    // 检查是否已存在
    const existing = await Character.findOne({ name: characterData.name });
    if (existing) {
      console.log(`⚠️  角色 ${characterData.name} 已存在，跳过`);
      return existing;
    }
    
    const character = new Character(characterData);
    await character.save();
    console.log(`💾 保存成功: ${characterData.name}`);
    return character;
  } catch (error) {
    console.error(`❌ 保存失败 ${characterData.name}:`, error.message);
    return null;
  }
}

// 批量爬取函数
async function batchCrawl() {
  console.log('🚀 开始批量爬取萌娘百科角色数据...');
  console.log(`📊 总计角色数量: ${characterList.length}`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < characterList.length; i++) {
    const characterName = characterList[i];
    console.log(`\n📋 进度: ${i + 1}/${characterList.length}`);
    
    try {
      const characterData = await scrapeCharacterFromMoegirl(characterName);
      
      if (characterData) {
        const saved = await saveCharacter(characterData);
        if (saved) {
          successCount++;
        } else {
          failCount++;
        }
      } else {
        failCount++;
      }
      
      // 避免请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ 处理角色 ${characterName} 时出错:`, error.message);
      failCount++;
    }
  }
  
  console.log('\n📊 爬取完成统计:');
  console.log(`✅ 成功: ${successCount} 个角色`);
  console.log(`❌ 失败: ${failCount} 个角色`);
  console.log(`📈 成功率: ${(successCount / (successCount + failCount) * 100).toFixed(1)}%`);
}

// 主函数
async function main() {
  console.log('🎌 萌娘百科角色数据爬取脚本');
  console.log('==============================');
  
  await connectDB();
  
  try {
    await batchCrawl();
  } catch (error) {
    console.error('❌ 爬取过程中出现错误:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔚 数据库连接已关闭');
    process.exit(0);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  scrapeCharacterFromMoegirl,
  saveCharacter,
  batchCrawl
};