// ===== Chapter 01: 血条 =====
export const ChapterData_ch01 = {
  id: 'ch01',
  title: '血条',
  nodes: {
    ch01_start: {
      type: 'narration',
      text: '墨山道外门接风宴上，酒香里裹着一丝不对劲的苦味。陈道抬杯时，眼前忽然浮现出半透明面板。',
      next: 'ch01_welcome'
    },
    ch01_welcome: {
      type: 'dialogue',
      speaker: 'liu_changqing',
      portrait: 'sinister',
      text: '新来的，喝了这杯洗髓酒。入我墨山，先看命硬不硬。',
      next: 'ch01_poison_warning'
    },
    ch01_poison_warning: {
      type: 'system',
      title: '系统警报',
      messages: [
        { text: '【警告：百草蛊酒。每小时HP持续流失】', style: 'danger' },
        { text: '【当前状态：中毒】', style: 'debuff' },
        { text: '【系统：开局就地狱难度，刺激。】', style: 'snark' }
      ],
      effects: [
        { type: 'hp', value: -18 },
        { type: 'flag', key: 'ch01_poisoned', value: true }
      ],
      next: 'ch01_ginger_choice'
    },
    ch01_ginger_choice: {
      type: 'choice',
      text: '喉咙发烫，胃里翻江倒海。你决定：',
      choices: [
        {
          text: '抓起红辣姜硬嚼，先保命',
          effects: [
            { type: 'item', itemId: 'red_ginger', count: 2 },
            { type: 'hp', value: 18 },
            { type: 'mood', value: 4 },
            { type: 'flag', key: 'ch01_used_ginger', value: true }
          ],
          next: 'ch01_pre_fight'
        },
        {
          text: '硬扛，不吃',
          effects: [
            { type: 'hp', value: -10 },
            { type: 'mood', value: -5 },
            { type: 'flag', key: 'ch01_used_ginger', value: false }
          ],
          next: 'ch01_pre_fight'
        }
      ]
    },
    ch01_pre_fight: {
      type: 'narration',
      text: '宴席散去，后厨角落窜出一只沾满毒泥的鼠妖，眼睛猩红地扑了上来。',
      next: 'ch01_first_combat'
    },
    ch01_first_combat: {
      type: 'combat',
      enemyId: 'poison_rat',
      canFlee: false,
      winNext: 'ch01_after_fight',
      loseNext: 'ch01_rescued'
    },
    ch01_rescued: {
      type: 'dialogue',
      speaker: 'su_lingyun',
      portrait: 'normal',
      text: '居然还能喘气？不错，拿去，别死在我看不见的地方。',
      effects: [
        { type: 'hp', value: 35 },
        { type: 'relationship', charId: 'su_lingyun', value: 3 }
      ],
      next: 'ch01_after_fight'
    },
    ch01_after_fight: {
      type: 'system',
      title: '生存结算',
      messages: [
        { text: '【击杀：毒沼鼠妖】', style: 'enemy' },
        { text: '【你学会了第一条规则：活下去】', style: 'quest' },
        { text: '【系统：血条没清零，你就还有戏。】', style: 'snark' }
      ],
      effects: [
        { type: 'exp', value: 20 },
        { type: 'currency', value: 18 },
        { type: 'relationship', charId: 'su_lingyun', value: 5 }
      ],
      next: 'ch01_end'
    },
    ch01_end: {
      type: 'transition',
      text: '第一章结束：陈道成功活过了新手夜。',
      nextChapter: 'ch02'
    }
  }
};
