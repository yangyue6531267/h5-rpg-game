// ===== Chapter 03: 刷毒 =====
export const ChapterData_ch03 = {
  id: 'ch03',
  title: '刷毒',
  nodes: {
    ch03_start: {
      type: 'narration',
      text: '外门药库堆满了"报废丹"。别人避之不及，陈道盯着它们像盯着经验包。',
      next: 'ch03_market'
    },
    ch03_market: {
      type: 'dialogue',
      speaker: 'qing_he',
      portrait: 'smile',
      text: '你要是吃坏了，别死在仓库里，脏了账本。',
      next: 'ch03_choice_pills'
    },
    ch03_choice_pills: {
      type: 'choice',
      text: '面前摆着三瓶颜色诡异的废丹。',
      choices: [
        {
          text: '一口闷，直接开刷',
          effects: [
            { type: 'hp', value: -18 },
            { type: 'exp', value: 30 },
            { type: 'item', itemId: 'spirit_water', count: 1 },
            { type: 'mood', value: 3 }
          ],
          next: 'ch03_system_joke'
        },
        {
          text: '分次服用，稳着来',
          effects: [
            { type: 'hp', value: -6 },
            { type: 'exp', value: 15 },
            { type: 'mood', value: 1 }
          ],
          next: 'ch03_system_joke'
        }
      ]
    },
    ch03_system_joke: {
      type: 'system',
      title: '毒性转化',
      messages: [
        { text: '【经脉耐受度提升】', style: 'buff' },
        { text: '【心情值波动】', style: 'info' },
        { text: '【系统：别人嗑药成仙，你嗑药成梗。】', style: 'snark' }
      ],
      next: 'ch03_swamp'
    },
    ch03_swamp: {
      type: 'narration',
      text: '回峰途中，源泽边缘传来窸窣声，一条灰鳞蛇从石缝中弹出。',
      next: 'ch03_combat'
    },
    ch03_combat: {
      type: 'combat',
      enemyId: 'gray_scale_snake',
      canFlee: true,
      fleeNext: 'ch03_flee',
      winNext: 'ch03_after',
      loseNext: 'ch03_after'
    },
    ch03_flee: {
      type: 'narration',
      text: '你翻滚进灌木，勉强甩开了灰鳞蛇，但袖子被毒牙划开了一道口子。',
      effects: [
        { type: 'hp', value: -8 },
        { type: 'mood', value: -2 }
      ],
      next: 'ch03_after'
    },
    ch03_after: {
      type: 'system',
      title: '战后收束',
      messages: [
        { text: '【你在毒障中活了下来】', style: 'quest' },
        { text: '【奖励：符钱 +35，解毒丹 +1】', style: 'item' },
        { text: '【系统：不错，已经有点老油条味道了。】', style: 'snark' }
      ],
      effects: [
        { type: 'currency', value: 35 },
        { type: 'item', itemId: 'detox_pill', count: 1 }
      ],
      next: 'ch03_end'
    },
    ch03_end: {
      type: 'transition',
      text: '第三章结束：你开始把毒药当经验书。',
      nextChapter: 'ch04'
    }
  }
};
