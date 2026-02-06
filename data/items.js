// ===== 物品数据 =====
window.ItemsData = {
  red_ginger: {
    name: '红辣姜',
    emoji: '🌶️',
    description: '辣到流泪，但能吊命。战斗外/内都可用。',
    usable: true,
    usableInCombat: true,
    healHp: 18
  },
  detox_pill: {
    name: '解毒丹',
    emoji: '🧪',
    description: '中和常见毒素，稳定经脉。',
    usable: true,
    usableInCombat: true,
    healHp: 30,
    healSp: 8
  },
  spirit_water: {
    name: '回灵露',
    emoji: '💧',
    description: '恢复灵力，适合连战后补给。',
    usable: true,
    usableInCombat: true,
    healSp: 25
  },
  black_blood_pill: {
    name: '黑血丹（试验版）',
    emoji: '⚫',
    description: '药性狂暴，能冲开部分窍穴，也可能反噬。',
    usable: true,
    usableInCombat: false,
    effects: [
      { type: 'hp', value: -10 },
      { type: 'sp', value: 18 },
      { type: 'exp', value: 8 }
    ]
  },
  simple_bandage: {
    name: '粗布绷带',
    emoji: '🩹',
    description: '最基础的止血用品。',
    usable: true,
    usableInCombat: true,
    healHp: 12
  },
  broken_sword: {
    name: '残缺古剑',
    emoji: '🗡️',
    description: '剑身有缺口，却隐隐有剑意流转。',
    usable: false,
    usableInCombat: false
  },
  spirit_ore: {
    name: '灵铁矿',
    emoji: '🪨',
    description: '炼器素材，可卖钱。',
    usable: false,
    usableInCombat: false
  }
};
