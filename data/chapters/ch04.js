// ===== Chapter 04: 逆练 =====
window.ChapterData_ch04 = {
  id: 'ch04',
  title: '逆练',
  nodes: {
    ch04_start: {
      type: 'narration',
      text: '《墨竹诀》的进度慢得像蜗牛。陈道盯着经脉图，决定走一条“正常人不会走”的路。',
      next: 'ch04_reverse_choice'
    },
    ch04_reverse_choice: {
      type: 'choice',
      text: '经脉逆行，风险极高。你的选择是：',
      choices: [
        {
          text: '逆行经脉，换取爆发修炼速度',
          effects: [
            { type: 'hp', value: -22 },
            { type: 'sp', value: 12 },
            { type: 'exp', value: 35 },
            { type: 'flag', key: 'ch04_reverse_training', value: true }
          ],
          next: 'ch04_reverse_system'
        },
        {
          text: '按部就班，不赌命',
          effects: [
            { type: 'exp', value: 15 },
            { type: 'mood', value: 5 },
            { type: 'flag', key: 'ch04_reverse_training', value: false }
          ],
          next: 'ch04_reverse_system'
        }
      ]
    },
    ch04_reverse_system: {
      type: 'system',
      title: '修炼反馈',
      messages: [
        { text: '【经脉负荷上升】', style: 'debuff' },
        { text: '【修炼效率提升】', style: 'buff' },
        { text: '【系统：你这练法，医馆看了都摇头。】', style: 'snark' }
      ],
      next: 'ch04_bully'
    },
    ch04_bully: {
      type: 'dialogue',
      speaker: 'zhao_jingxing',
      portrait: 'angry',
      text: '听说你最近挺狂？来，和我切磋一场，输了就滚出这片演武场。',
      next: 'ch04_combat'
    },
    ch04_combat: {
      type: 'combat',
      enemyId: 'outer_bully',
      canFlee: false,
      winNext: 'ch04_after',
      loseNext: 'ch04_fail_recover'
    },
    ch04_fail_recover: {
      type: 'narration',
      text: '你被重劈砸翻在地，耳边嗡鸣。好在张小宝把你拖出了擂台。',
      effects: [
        { type: 'hp', value: 28 },
        { type: 'mood', value: -6 }
      ],
      next: 'ch04_after'
    },
    ch04_after: {
      type: 'system',
      title: '战斗总结',
      messages: [
        { text: '【你扛住了外门恶霸的压力】', style: 'quest' },
        { text: '【领悟：双涡轮增压（雏形）】', style: 'buff' },
        { text: '【系统：拳头硬，讲道理就容易。】', style: 'snark' }
      ],
      effects: [
        { type: 'skill', skillId: 'double_turbo' },
        { type: 'item', itemId: 'simple_bandage', count: 1 },
        { type: 'currency', value: 42 }
      ],
      next: 'ch04_end'
    },
    ch04_end: {
      type: 'transition',
      text: '第四章结束：你学会了“以命换速”的修炼方式。',
      nextChapter: 'ch05'
    }
  }
};
