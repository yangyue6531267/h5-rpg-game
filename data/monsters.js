// ===== 怪物数据 =====
window.MonstersData = {
  poison_rat: {
    id: 'poison_rat',
    name: '毒沼鼠妖',
    level: 1,
    emoji: '🐀',
    portraitAccent: '#7a4b2a',
    systemQuip: '新手关卡，不要翻车。',
    stats: {
      hp: 48,
      attack: 8,
      defense: 2,
      speed: 6
    },
    skills: ['撕咬'],
    exp: 16,
    currency: 8,
    drops: [
      { item: 'red_ginger', name: '红辣姜', chance: 0.55 },
      { item: 'simple_bandage', name: '粗布绷带', chance: 0.2 }
    ]
  },
  failed_puppet: {
    id: 'failed_puppet',
    name: '失控药傀',
    level: 2,
    emoji: '🪆',
    portraitAccent: '#5f4050',
    systemQuip: '它看起来想把你也缝进药缸里。',
    stats: {
      hp: 78,
      attack: 11,
      defense: 4,
      speed: 7
    },
    skills: ['突刺', '撞击'],
    exp: 25,
    currency: 15,
    drops: [
      { item: 'detox_pill', name: '解毒丹', chance: 0.35 },
      { item: 'spirit_water', name: '回灵露', chance: 0.3 }
    ]
  },
  gray_scale_snake: {
    id: 'gray_scale_snake',
    name: '灰鳞蛇',
    level: 3,
    emoji: '🐍',
    portraitAccent: '#2f5a48',
    systemQuip: '别让它缠住，越缠越痛。',
    stats: {
      hp: 92,
      attack: 13,
      defense: 5,
      speed: 9
    },
    skills: ['绞杀', '毒牙'],
    exp: 32,
    currency: 24,
    drops: [
      { item: 'detox_pill', name: '解毒丹', chance: 0.45 },
      { item: 'spirit_ore', name: '灵铁矿', chance: 0.25 }
    ]
  },
  outer_bully: {
    id: 'outer_bully',
    name: '赵景行',
    characterId: 'zhao_jingxing',
    level: 4,
    emoji: '😤',
    portraitAccent: '#7f2d2d',
    systemQuip: '他说你是软柿子。',
    stats: {
      hp: 118,
      attack: 15,
      defense: 6,
      speed: 8
    },
    skills: ['重劈', '踢击'],
    exp: 45,
    currency: 40,
    drops: [
      { item: 'simple_bandage', name: '粗布绷带', chance: 0.5 },
      { item: 'spirit_ore', name: '灵铁矿', chance: 0.35 }
    ]
  },
  remnant_soul: {
    id: 'remnant_soul',
    name: '夺舍残魂',
    level: 5,
    emoji: '👻',
    portraitAccent: '#6d4f94',
    systemQuip: '它正在读你的记忆，还嫌你穷。',
    stats: {
      hp: 145,
      attack: 17,
      defense: 7,
      speed: 10
    },
    skills: ['神念穿刺', '噬心'],
    phases: [
      { hpThreshold: 0.6, dialogue: '“把身体交给我！”', buffSelf: '狂躁' },
      { hpThreshold: 0.25, dialogue: '“不可能……你怎么还没倒下？！”' }
    ],
    exp: 70,
    currency: 66,
    drops: [
      { item: 'broken_sword', name: '残缺古剑', chance: 1 },
      { item: 'spirit_water', name: '回灵露', chance: 0.55 }
    ]
  }
};
