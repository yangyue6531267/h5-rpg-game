// ===== Chapter 02: 药人 =====
export const ChapterData_ch02 = {
  id: 'ch02',
  title: '药人',
  nodes: {
    ch02_start: {
      type: 'narration',
      text: '药庐里药香混着血腥味。红衣女子背对丹炉，手指敲着玉瓶。',
      next: 'ch02_meet_su'
    },
    ch02_meet_su: {
      type: 'dialogue',
      speaker: 'su_lingyun',
      portrait: 'smile',
      text: '你就是新药童？从今天起，替我试药。放心，我手很稳，死了也能缝回来。',
      effects: [
        { type: 'relationship', charId: 'su_lingyun', value: 4 }
      ],
      next: 'ch02_test_choice'
    },
    ch02_test_choice: {
      type: 'choice',
      text: '苏灵韵把黑色丹丸递到你嘴边。',
      choices: [
        {
          text: '主动吞下，赌一把收益',
          effects: [
            { type: 'mood', value: 5 },
            { type: 'relationship', charId: 'su_lingyun', value: 8 }
          ],
          next: 'ch02_take_pill'
        },
        {
          text: '皱眉后退，拒绝试药',
          effects: [
            { type: 'mood', value: -8 },
            { type: 'relationship', charId: 'su_lingyun', value: -5 }
          ],
          next: 'ch02_forced_pill'
        }
      ]
    },
    ch02_take_pill: {
      type: 'system',
      title: '药性爆发',
      messages: [
        { text: '【服用：黑血丹（试验版）】', style: 'item' },
        { text: '【HP -20，灵力回路活跃】', style: 'debuff' },
        { text: '【系统：疼是疼，但有收益。】', style: 'snark' }
      ],
      effects: [
        { type: 'hp', value: -20 },
        { type: 'sp', value: 10 },
        { type: 'item', itemId: 'black_blood_pill', count: 1 }
      ],
      next: 'ch02_combat'
    },
    ch02_forced_pill: {
      type: 'system',
      title: '强制喂药',
      messages: [
        { text: '【苏灵韵按住了你的下巴】', style: 'info' },
        { text: '【HP -30，心情下降】', style: 'debuff' },
        { text: '【系统：不配合也得配合。】', style: 'snark' }
      ],
      effects: [
        { type: 'hp', value: -30 },
        { type: 'mood', value: -5 }
      ],
      next: 'ch02_combat'
    },
    ch02_combat: {
      type: 'combat',
      enemyId: 'failed_puppet',
      canFlee: false,
      winNext: 'ch02_reward',
      loseNext: 'ch02_recover'
    },
    ch02_recover: {
      type: 'narration',
      text: '你被药傀一击打飞，撞在丹架上。苏灵韵叹了口气，顺手往你嘴里塞了两颗丹。',
      effects: [
        { type: 'hp', value: 35 },
        { type: 'item', itemId: 'detox_pill', count: 1 }
      ],
      next: 'ch02_reward'
    },
    ch02_reward: {
      type: 'dialogue',
      speaker: 'su_lingyun',
      portrait: 'gentle',
      text: '你这命格挺抗造。行，给你一门小术，省得你天天抱着药瓶乱啃。',
      effects: [
        { type: 'skill', skillId: 'poison_resistance' },
        { type: 'item', itemId: 'detox_pill', count: 1 },
        { type: 'relationship', charId: 'su_lingyun', value: 6 }
      ],
      next: 'ch02_end'
    },
    ch02_end: {
      type: 'transition',
      text: '第二章结束：你从药人，变成了"有价值的药人"。',
      nextChapter: 'ch03'
    }
  }
};
