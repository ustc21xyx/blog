const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

// 萌娘百科角色页面列表 - 使用更准确的页面名称
const moegirlCharacterPages = [
  '鲁路修',
  '夜神月', 
  '初音未来',
  '江户川柯南',
  '孙悟空',
  '桐间纱路',
  '灶门炭治郎',
  '比企谷八幡',
  '艾米莉亚',
  '路飞'
];

// 从萌娘百科获取角色信息 - 修复的解析方法
async function getCharacterFromMoegirl(characterName) {
  try {
    const encodedName = encodeURIComponent(characterName);
    console.log(`[MOEGIRL] 开始爬取角色: ${characterName}`);
    
    const response = await axios.get(`https://zh.moegirl.org.cn/${encodedName}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    
    // 获取角色名称 - 从title或h1获取
    const pageTitle = $('title').text().replace(' - 萌娘百科 万物皆可萌的百科全书', '').trim();
    const name = pageTitle || $('#firstHeading').text().trim() || $('h1').first().text().trim() || characterName;
    console.log(`[MOEGIRL] 获取到角色名称: ${name}`);
    
    // 获取角色图片 - 查找多种可能的图片位置
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
      if (img && !img.includes('svg') && !img.includes('icon')) {
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
    console.log(`[MOEGIRL] 获取到图片: ${image || '无图片'}`);
    
    // 获取角色描述 - 从第一个有效段落
    let description = '';
    const descriptionSelectors = [
      '.mw-parser-output > p',
      '#mw-content-text p',
      '.mw-content-ltr p'
    ];
    
    for (const selector of descriptionSelectors) {
      $(selector).each((i, p) => {
        const text = $(p).text().trim();
        if (text.length > 30 && !text.includes('编辑') && !text.includes('本页面') && !text.includes('萌娘百科')) {
          description = text;
          return false; // 跳出循环
        }
      });
      if (description) break;
    }
    console.log(`[MOEGIRL] 获取到描述长度: ${description.length}`);
    
    // 解析信息表格 - 萌娘百科使用wikitable
    let originalName = '';
    let birthday = '';
    let height = '';
    let cv = '';
    let anime = [];
    
    // 查找所有表格中的信息
    $('.wikitable, table').each((i, table) => {
      $(table).find('tr').each((j, row) => {
        const $row = $(row);
        const cells = $row.find('th, td');
        
        if (cells.length >= 2) {
          const label = $(cells[0]).text().trim();
          const value = $(cells[1]).text().trim();
          
          if (!label || !value) return;
          
          // 匹配各种字段
          if (/(?:日文名|原名|本名|英文名|罗马音)/i.test(label)) {
            originalName = value;
          } else if (/(?:生日|出生日期|出生|诞生|发售日)/i.test(label)) {
            birthday = value;
          } else if (/(?:身高|高度)/i.test(label)) {
            height = value;
          } else if (/(?:声优|CV|配音|声源)/i.test(label)) {
            cv = value;
          } else if (/(?:出自|登场作品|作品|所属作品|来源|系列)/i.test(label)) {
            const cleanValue = value.replace(/\s*\([^)]*\)\s*/g, '').trim();
            if (cleanValue && cleanValue.length > 1) anime.push(cleanValue);
          }
        }
      });
    });
    
    // 如果没有找到作品信息，从链接中提取
    if (anime.length === 0) {
      $('a').each((i, link) => {
        const href = $(link).attr('href') || '';
        const text = $(link).text().trim();
        if (text.length > 2 && text.length < 20 && 
            (href.includes('系列') || href.includes('作品') || text.includes('系列'))) {
          anime.push(text);
        }
      });
      anime = anime.slice(0, 3); // 最多3个
    }

    console.log(`[MOEGIRL] 解析结果 - 原名:${originalName}, 生日:${birthday}, 声优:${cv}, 作品:${anime.join(',')}`);

    // 验证数据有效性 - 放宽验证条件
    if (!name || (name === characterName && !originalName && !description)) {
      console.log(`[MOEGIRL] 数据不完整，角色可能不存在`);
      return null;
    }

    return {
      id: `moe_${characterName}`,
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
      source: 'moegirl_enhanced'
    };
  } catch (error) {
    console.error(`[MOEGIRL] 爬取 ${characterName} 失败:`, error.message);
    return null;
  }
}


// HTML解析方法作为备选（保持原有逻辑）
async function getCharacterFromMoegirlHTML(characterName) {
  try {
    const encodedName = encodeURIComponent(characterName);
    const response = await axios.get(`https://zh.moegirl.org.cn/${encodedName}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    // 获取角色名称
    const name = $('#firstHeading').text().trim() || characterName;
    
    // 获取角色图片
    let image = '';
    const infoboxImg = $('.infobox img').first().attr('src') || $('.thumb img').first().attr('src');
    if (infoboxImg) {
      if (infoboxImg.startsWith('//')) {
        image = `https:${infoboxImg}`;
      } else if (infoboxImg.startsWith('/')) {
        image = `https://zh.moegirl.org.cn${infoboxImg}`;
      } else if (infoboxImg.startsWith('http')) {
        image = infoboxImg;
      }
    }
    
    // 获取角色描述
    const description = $('.mw-parser-output > p').first().text().trim() ||
                       $('#mw-content-text p').first().text().trim();
    
    // 获取基本信息
    const infoRows = $('.infobox tr');
    let originalName = '';
    let birthday = '';
    let height = '';
    let cv = '';
    let anime = [];
    
    infoRows.each((i, row) => {
      const label = $(row).find('th').text().trim();
      const value = $(row).find('td').text().trim();
      
      if (label.includes('日文名') || label.includes('原名')) {
        originalName = value;
      } else if (label.includes('生日') || label.includes('出生')) {
        birthday = value;
      } else if (label.includes('身高')) {
        height = value;
      } else if (label.includes('声优') || label.includes('CV')) {
        cv = value;
      } else if (label.includes('出自') || label.includes('作品')) {
        anime.push(value);
      }
    });

    if (!name && !image) {
      return null;
    }

    return {
      id: `moe_${characterName}`,
      name: name || characterName,
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
      source: 'moegirl_html'
    };
  } catch (error) {
    console.error(`Error fetching character ${characterName} from Moegirl:`, error.message);
    return null;
  }
}


// 生成角色占位符图片
function generateCharacterImage(name, seed) {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
  const color = colors[seed % colors.length];
  return `data:image/svg+xml;base64,${Buffer.from(`
    <svg width="300" height="400" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="400" fill="${color}"/>
      <text x="150" y="200" font-family="Arial, sans-serif" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">${name}</text>
    </svg>
  `).toString('base64')}`;
}

// 热门二次元角色数据库（作为备选）
const moegiriCharacters = [
  {
    id: 'moe_1',
    name: '鲁路修·Vi·不列颠尼亚',
    originalName: 'ルルーシュ・ヴィ・ブリタニア',
    image: generateCharacterImage('鲁路修', 1),
    description: '《CODE GEASS 反叛的鲁路修》的男主角。不列颠尼亚帝国的第11皇子，后成为第99代皇帝。拥有Geass能力"绝对遵从"，能够对任何人下达无法违抗的命令。为了创造妹妹娜娜莉能够幸福生活的世界，以Zero的身份领导黑色骑士团反抗不列颠尼亚帝国。',
    anime: ['CODE GEASS 反叛的鲁路修', 'CODE GEASS 反叛的鲁路修R2'],
    details: {
      birthday: '12月5日',
      height: '178cm',
      weight: '不明',
      cv: '福山润'
    }
  },
  {
    id: 'moe_2', 
    name: '夜神月',
    originalName: '夜神ライト（やがみライト）',
    image: generateCharacterImage('夜神月', 2),
    description: '《DEATH NOTE》的男主角。东应大学法学部学生，拾到死神之死亡笔记后，以基拉（Kira）的身份制裁罪犯，企图创造一个没有犯罪的新世界。拥有极高的智商和强烈的正义感。',
    anime: ['DEATH NOTE'],
    details: {
      birthday: '2月28日',
      height: '179cm',
      weight: '54kg',
      cv: '宫野真守'
    }
  },
  {
    id: 'moe_3',
    name: '初音未来',
    originalName: '初音ミク（はつね ミク）',
    image: generateCharacterImage('初音未来', 3),
    description: 'CRYPTON FUTURE MEDIA以Yamaha的VOCALOID语音合成引擎为基础开发的音源库，也是其角色主唱的系列的第一作。声源是声优藤田咲。诞生于2007年8月31日，是世界上最著名的虚拟歌手。',
    anime: ['初音未来系列', 'Project DIVA'],
    details: {
      birthday: '8月31日',
      height: '158cm',
      weight: '42kg',
      cv: '藤田咲'
    }
  },
  {
    id: 'moe_4',
    name: '江户川柯南',
    originalName: '江戸川コナン（えどがわ コナン）',
    image: generateCharacterImage('柯南', 4),
    description: '《名侦探柯南》的男主角。原本是高中生侦探工藤新一，被黑衣组织灌下毒药APTX4869后身体缩小成小学生模样。寄住在毛利侦探事务所，暗中协助毛利小五郎破案，同时寻找黑衣组织的线索。',
    anime: ['名侦探柯南'],
    details: {
      birthday: '5月4日',
      height: '约100cm',
      weight: '约18kg',
      cv: '高山南'
    }
  },
  {
    id: 'moe_5',
    name: '孙悟空',
    originalName: '孫悟空（そん ごくう）',
    image: generateCharacterImage('孙悟空', 5),
    description: '《龙珠》系列的男主角。赛亚人卡卡罗特，从小在地球长大。拥有纯真善良的性格和对变强的执着追求。通过不断修炼达到了超级赛亚人等多种形态，是地球最强的战士。',
    anime: ['龙珠', '龙珠Z', '龙珠超'],
    details: {
      birthday: '不明',
      height: '175cm',
      weight: '62kg',
      cv: '野泽雅子'
    }
  },
  {
    id: 'moe_6',
    name: '桐间纱路',
    originalName: '桐間紗路（きりま しゃろ）',
    image: generateCharacterImage('纱路', 6),
    description: '《请问您今天要来点兔子吗？》的主要角色之一。就读于私立绿风女子中学。家境贫困但自尊心很强，经常打工赚钱。性格认真努力，对咖啡有着特殊的反应。',
    anime: ['请问您今天要来点兔子吗？'],
    details: {
      birthday: '7月15日',
      height: '150cm',
      weight: '不明',
      cv: '内田真礼'
    }
  },
  {
    id: 'moe_7',
    name: '炭治郎',
    originalName: '竈門炭治郎（かまど たんじろう）',
    image: generateCharacterImage('炭治郎', 7),
    description: '《鬼灭之刃》的男主角。为了拯救变成鬼的妹妹祢豆子，成为了鬼杀队的剑士。拥有罕见的嗅觉天赋，能够通过气味判断敌人的位置和情绪。性格善良温柔，即使面对鬼也会心怀慈悲。',
    anime: ['鬼灭之刃'],
    details: {
      birthday: '7月14日',
      height: '165cm',
      weight: '61kg',
      cv: '花江夏树'
    }
  },
  {
    id: 'moe_8',
    name: '比企谷八幡',
    originalName: '比企谷八幡（ひきがや はちまん）',
    image: generateCharacterImage('八幡', 8),
    description: '《果然我的青春恋爱喜剧搞错了》的男主角。千叶市立总武高等学校二年级学生，性格消极悲观，擅长独自行动。被老师强制加入了"侍奉部"，在那里遇到了雪之下雪乃和由比滨结衣。',
    anime: ['果然我的青春恋爱喜剧搞错了'],
    details: {
      birthday: '8月8日',
      height: '175cm',
      weight: '不明',
      cv: '江口拓也'
    }
  },
  {
    id: 'moe_9',
    name: '艾米莉亚',
    originalName: 'エミリア',
    image: generateCharacterImage('艾米莉亚', 9),
    description: '《Re:从零开始的异世界生活》的女主角之一。银发的半精灵，王选候补者之一。性格善良纯真，但因为外貌与嫉妒魔女相似而遭受偏见。与昴建立了深厚的感情联系。',
    anime: ['Re:从零开始的异世界生活'],
    details: {
      birthday: '9月23日',
      height: '164cm',
      weight: '不明',
      cv: '高桥李依'
    }
  },
  {
    id: 'moe_10',
    name: '路飞',
    originalName: 'モンキー・D・ルフィ',
    image: generateCharacterImage('路飞', 10),
    description: '《海贼王》的男主角。草帽海贼团船长，梦想是找到传说中的大秘宝"ONE PIECE"成为海贼王。吃了橡胶果实，身体具有橡胶的性质。性格乐观开朗，重视伙伴。',
    anime: ['海贼王'],
    details: {
      birthday: '5月5日',
      height: '174cm',
      weight: '64kg',
      cv: '田中真弓'
    }
  }
];

// Bangumi角色ID列表作为备选
const popularCharacterIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

// 从Bangumi获取角色信息
async function getCharacterFromBangumi(characterId) {
  try {
    const response = await axios.get(`https://bgm.tv/character/${characterId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    // 从页面标题获取角色名称
    const title = $('title').text().trim();
    const name = title.split(' | ')[0].trim() || 
                 $('.nameSingle a').first().text().trim() || 
                 $('h1').first().text().trim();
    
    // 获取原名
    const originalName = $('#columnCrtB h1').text().trim() ||
                        $('.grey').first().text().trim();
    
    // 获取角色图片
    const image = $('#columnCrtA img.cover').attr('src');
    
    // 修复图片URL - 简化逻辑
    let imageUrl = '';
    if (image) {
      if (image.startsWith('//')) {
        // 对于 //lain.bgm.tv/ 格式，直接加 https:
        imageUrl = `https:${image}`;
      } else if (image.startsWith('http')) {
        imageUrl = image;
      } else {
        // 其他情况加完整前缀
        imageUrl = `https://bgm.tv${image}`;
      }
    }
    
    // 获取角色描述
    const description = $('#columnCrtB .detail').text().trim() ||
                       $('#columnCrtB p').first().text().trim() ||
                       $('.info').text().trim();
    
    // 获取相关动画作品
    const anime = $('.browserCoverMedium .l a').map((i, el) => $(el).text().trim()).get() ||
                  $('.subject_line a').map((i, el) => $(el).text().trim()).get();
    
    const infoItems = $('.infobox .tip').map((i, el) => {
      const key = $(el).text().trim();
      const value = $(el).next().text().trim();
      return { key, value };
    }).get();
    
    const birthday = infoItems.find(item => item.key.includes('生日'))?.value || '';
    const height = infoItems.find(item => item.key.includes('身高'))?.value || '';
    const weight = infoItems.find(item => item.key.includes('体重'))?.value || '';
    const cv = infoItems.find(item => item.key.includes('声优'))?.value || '';

    if (!name && !image) {
      return null;
    }

    return {
      id: characterId,
      name: name || 'Unknown Character',
      originalName: originalName || '',
      image: imageUrl,
      description: description || '暂无描述',
      anime: anime.slice(0, 3), // 取前3个动画
      details: {
        birthday,
        height,
        weight,
        cv
      },
      source: 'bangumi'
    };
  } catch (error) {
    console.error(`Error fetching character ${characterId} from Bangumi:`, error.message);
    return null;
  }
}

// 获取随机角色
router.get('/random', async (req, res) => {
  try {
    let character = null;
    
    // 80% 概率使用萌娘百科爬虫，20% 概率使用 Bangumi 数据
    if (Math.random() < 0.8) {
      // 使用萌娘百科爬虫获取实时数据
      let attempts = 0;
      while (!character && attempts < 3) {
        const randomCharacterName = moegirlCharacterPages[Math.floor(Math.random() * moegirlCharacterPages.length)];
        character = await getCharacterFromMoegirl(randomCharacterName);
        attempts++;
        
        if (!character && attempts < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } else {
      // 使用 Bangumi 数据作为备选
      let attempts = 0;
      while (!character && attempts < 3) {
        const randomId = popularCharacterIds[Math.floor(Math.random() * popularCharacterIds.length)];
        character = await getCharacterFromBangumi(randomId);
        attempts++;
        
        if (!character && attempts < 3) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    // 如果都失败了，使用静态萌娘百科数据作为保底
    if (!character) {
      const randomIndex = Math.floor(Math.random() * moegiriCharacters.length);
      character = {
        ...moegiriCharacters[randomIndex],
        source: 'moegirl_fallback'
      };
      console.log(`[FALLBACK] 使用静态数据: ${character.name}`);
    }
    
    res.json({
      success: true,
      character
    });
  } catch (error) {
    console.error('Random character error:', error);
    
    // 错误情况下返回静态萌娘百科数据
    const randomIndex = Math.floor(Math.random() * moegiriCharacters.length);
    const character = {
      ...moegiriCharacters[randomIndex],
      source: 'moegirl_fallback'
    };
    
    res.json({
      success: true,
      character
    });
  }
});

// 根据ID获取特定角色
router.get('/:id', async (req, res) => {
  try {
    const characterId = parseInt(req.params.id);
    
    if (isNaN(characterId)) {
      return res.status(400).json({
        success: false,
        message: '无效的角色ID'
      });
    }
    
    const character = await getCharacterFromBangumi(characterId);
    
    if (!character) {
      return res.status(404).json({
        success: false,
        message: '角色不存在或获取失败'
      });
    }
    
    res.json({
      success: true,
      character
    });
  } catch (error) {
    console.error('Get character error:', error);
    res.status(500).json({
      success: false,
      message: '获取角色信息失败'
    });
  }
});

module.exports = router;