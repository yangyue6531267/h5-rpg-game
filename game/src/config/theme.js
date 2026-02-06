// 水墨暗黑主题色彩系统
export const COLORS = {
  // 背景
  bgDark: 0x0a0a0f,
  bgPanel: 0x12121a,
  bgCard: 0x1a1a28,

  // 文字
  textMain: '#d4d0c8',
  textDim: '#8a8a9a',
  textBright: '#f0ece0',

  // 强调色
  red: 0xc43e3e,
  gold: 0xd4a843,
  blue: 0x4a7ab5,
  green: 0x4a9a5a,
  purple: 0x8a5ab5,

  // 强调色 CSS 字符串
  redStr: '#c43e3e',
  goldStr: '#d4a843',
  blueStr: '#4a7ab5',
  greenStr: '#4a9a5a',
  purpleStr: '#8a5ab5',

  // 系统色
  systemGreen: 0x00ff88,
  systemBorder: 0x00aa55,
  systemGreenStr: '#00ff88',

  // HP/SP/Mood 条颜色
  hpBar: 0xc43e3e,
  spBar: 0x4a7ab5,
  moodBar: 0xd4a843,
  barBg: 0x2a2a3a,

  // 伤害数字
  dmgNormal: '#ffffff',
  dmgCrit: '#ffd700',
  dmgHeal: '#4a9a5a',

  // 按钮
  btnBorder: 0x4a4a5a,
  btnHover: 0x3a3a4a,
  btnActive: 0xd4a843
};

// 字体配置
export const FONTS = {
  main: "'Noto Serif SC', 'Songti SC', 'STSong', serif",
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    title: 48
  }
};

// 系统消息样式映射
export const MSG_STYLES = {
  danger: { color: '#ff4d4d', prefix: '⚠️' },
  debuff: { color: '#c43e3e', prefix: '▼' },
  buff: { color: '#4a9a5a', prefix: '▲' },
  snark: { color: '#00ff88', prefix: '' },
  quest: { color: '#d4a843', prefix: '★' },
  item: { color: '#d4a843', prefix: '' },
  enemy: { color: '#c43e3e', prefix: '' },
  info: { color: '#8a8a9a', prefix: '' },
  critical: { color: '#ff2222', prefix: '‼️' },
  hp: { color: '#c43e3e', prefix: '' },
  sp: { color: '#4a7ab5', prefix: '' }
};
