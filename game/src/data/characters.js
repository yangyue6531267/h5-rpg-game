// ===== 角色数据 =====
export const CharactersData = {
  'chen_dao': {
    name: '陈道',
    title: '墨山道外门弟子',
    portraits: { normal: '😏', smirk: '😈', hurt: '🩸', shocked: '😱', thinking: '🤔', angry: '😤' },
    relationshipThresholds: {}
  },
  'su_lingyun': {
    name: '苏灵韵',
    title: '六师姐 · 真传弟子',
    portraits: { normal: '🌸', yandere: '🔪', gentle: '💕', angry: '😤', smile: '😊' },
    relationshipThresholds: {
      '-50': '杀意（你是我的实验品）',
      '-20': '警惕（有点意思的玩具）',
      '0': '中立（我的师弟）',
      '30': '好感（只有我能欺负你）',
      '60': '亲密（不许受伤）',
      '90': '执念（你是我的。永远。）'
    }
  },
  'qing_he': {
    name: '青禾',
    title: '内门管事',
    portraits: { normal: '🎋', smile: '😏', angry: '💢', sad: '😢' },
    relationshipThresholds: {
      '0': '公事公办',
      '30': '认可',
      '60': '信任'
    }
  },
  'yang_youwei': {
    name: '杨幼微',
    title: '昆仑派圣女',
    portraits: { normal: '✨', angry: '💢', scared: '😰', tsundere: '😤', blush: '😳' },
    relationshipThresholds: {
      '-50': '敌意（魔教妖人！）',
      '0': '警惕',
      '30': '臭味相投',
      '60': '孽缘'
    }
  },
  'wang_daoyuan': {
    name: '王道元',
    title: '外门长老 · 笑面虎',
    portraits: { normal: '😄', serious: '🧐', angry: '😠' },
    relationshipThresholds: { '0': '利用价值', '30': '可造之材' }
  },
  'liu_changqing': {
    name: '刘拐子',
    title: '墨山道执事',
    portraits: { normal: '🦹', sinister: '😈', angry: '👿' },
    relationshipThresholds: {}
  },
  'zhang_xiaobao': {
    name: '张小宝',
    title: '外门师兄',
    portraits: { normal: '😁', nervous: '😅' },
    relationshipThresholds: { '0': '同门', '30': '兄弟' }
  },
  'zhao_jingxing': {
    name: '赵景行',
    title: '外门恶霸',
    portraits: { normal: '😤', angry: '🤬' },
    relationshipThresholds: {}
  }
};
