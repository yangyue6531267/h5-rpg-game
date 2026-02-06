// ===== Chapter 05: 夺舍 =====
export const ChapterData_ch05 = {
  id: 'ch05',
  title: '夺舍',
  nodes: {
    ch05_start: {
      type: 'narration',
      text: '夜雨后山，乱葬岗潮气冲天。陈道追着一缕异样灵光，走到一口半塌的坟坑前。',
      next: 'ch05_tomb'
    },
    ch05_tomb: {
      type: 'narration',
      text: '泥土翻涌，一道残魂从锈剑中窜出，带着刺骨的寒意直扑识海。',
      next: 'ch05_system_warning'
    },
    ch05_system_warning: {
      type: 'system',
      title: '精神入侵',
      messages: [
        { text: '【警告：检测到夺舍级精神冲击】', style: 'critical' },
        { text: '【建议：维持血量，不要被一击清空】', style: 'danger' },
        { text: '【系统：顶住这一波，你就有老爷爷了。】', style: 'snark' }
      ],
      effects: [
        { type: 'mood', value: -8 }
      ],
      next: 'ch05_combat'
    },
    ch05_combat: {
      type: 'combat',
      enemyId: 'remnant_soul',
      canFlee: false,
      winNext: 'ch05_win',
      loseNext: 'ch05_recover'
    },
    ch05_recover: {
      type: 'narration',
      text: '你被残魂压得识海震荡，几乎失去意识。最后关头，你靠一口狠劲咬破舌尖，强行醒来。',
      effects: [
        { type: 'hp', value: 45 },
        { type: 'sp', value: 12 }
      ],
      next: 'ch05_win'
    },
    ch05_win: {
      type: 'system',
      title: '夺舍反杀',
      messages: [
        { text: '【斩杀：夺舍残魂】', style: 'enemy' },
        { text: '【获得：残缺古剑】', style: 'item' },
        { text: '【系统：从今天起，你也是有"挂件"的人了。】', style: 'snark' }
      ],
      effects: [
        { type: 'skill', skillId: 'tongtian_sword_v1' },
        { type: 'item', itemId: 'broken_sword', count: 1 },
        { type: 'exp', value: 40 },
        { type: 'currency', value: 50 }
      ],
      next: 'ch05_final'
    },
    ch05_final: {
      type: 'transition',
      text: 'MVP章节完成（Ch01-Ch05）：你成功活过开局，并拿到第一把"命运之剑"。'
    }
  }
};
