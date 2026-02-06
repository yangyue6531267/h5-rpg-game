// ===== 技能/功法数据 =====
window.SkillsData = {
  'basic_sword': {
    name: '基础剑法',
    description: '墨山道入门剑术，朴实无华但胜在稳定',
    spCost: 5,
    power: 0,
    multiplier: 1.2,
    critRate: 0.15,
    type: 'attack'
  },
  'lock_blood': {
    name: '锁血',
    description: '被动技能：血量低于10%时，有30%概率保留1点HP',
    spCost: 0,
    type: 'passive'
  },
  'system_scan': {
    name: '系统扫描',
    description: '查看目标的血量和弱点信息',
    spCost: 3,
    type: 'utility'
  },
  'tongtian_sword_v1': {
    name: '通天剑法 v1.0（私服魔改版）',
    description: '名字土，但是真能砍死人。老爷爷亲自魔改的剑谱',
    spCost: 15,
    power: 10,
    multiplier: 2.0,
    critRate: 0.25,
    type: 'attack'
  },
  'double_turbo': {
    name: '双涡轮增压',
    description: '爆发模式！短时间内攻击力翻倍，但灵力消耗巨大',
    spCost: 25,
    power: 20,
    multiplier: 2.5,
    critRate: 0.35,
    type: 'attack'
  },
  'poison_resistance': {
    name: '百毒不侵（初级）',
    description: '对毒素有一定抗性，降低中毒伤害',
    spCost: 0,
    type: 'passive'
  },
  'red_ginger_technique': {
    name: '红姜解毒术',
    description: '用红姜配合灵力运转，可解低级毒素',
    spCost: 8,
    type: 'utility'
  }
};
