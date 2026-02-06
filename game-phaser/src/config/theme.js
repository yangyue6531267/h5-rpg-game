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

// ===== HD-2D 视觉增强配置 =====

// 泛光/发光色
export const GLOW_COLORS = {
  goldGlow: 0xffe4a0,
  blueGlow: 0x88ccff,
  redGlow: 0xff6666,
  greenGlow: 0x66ff99,
  purpleGlow: 0xcc88ff,
  whiteGlow: 0xffffff,
};

// 毛玻璃面板参数
export const GLASS = {
  bgAlpha: 0.75,
  borderAlpha: 0.4,
  highlightAlpha: 0.15,
  noiseAlpha: 0.03,
  borderGradientTop: 0xd4a843,
  borderGradientBottom: 0x3a3a4a,
  fillTop: 0x1e1e30,
  fillBottom: 0x0e0e18,
  innerGlow: 0x2a2a44,
  cornerAccent: 0xd4a843,
};

// HD-2D 角色光影参数
export const SHADING = {
  shadowStrength: 0.35,
  highlightStrength: 0.25,
  rimLightStrength: 0.5,
  rimLightColor: { r: 180, g: 200, b: 255 },
  aoStrength: 0.4,
  ditherThreshold: 0.5,
  groundShadowAlpha: 80,
  groundShadowColor: { r: 10, g: 10, b: 20 },
};

// 每技能粒子特效配置
export const SKILL_VFX = {
  basic_sword: {
    colors: [0x88bbff, 0xccddff],
    shape: 'arc',
    particles: 20,
    duration: 400,
    glow: 0x88bbff,
  },
  tongtian_sword_v1: {
    colors: [0xffe066, 0xffffff],
    shape: 'wave',
    particles: 30,
    duration: 600,
    glow: 0xffe066,
  },
  double_turbo: {
    colors: [0xff4444, 0xff8844],
    shape: 'burst',
    particles: 40,
    duration: 500,
    glow: 0xff4444,
  },
  system_scan: {
    colors: [0x00ff88, 0x88ffcc],
    shape: 'radial',
    particles: 15,
    duration: 300,
    glow: 0x00ff88,
  },
  red_ginger_detox: {
    colors: [0x66ff99, 0xccffdd],
    shape: 'rise',
    particles: 18,
    duration: 500,
    glow: 0x66ff99,
  },
  default: {
    colors: [0xd4a843, 0xffee88],
    shape: 'radial',
    particles: 15,
    duration: 400,
    glow: 0xd4a843,
  },
};

// 场景后处理预设
export const POSTFX_PRESETS = {
  combat: {
    bloom: { strength: 0.5, blurStrength: 0.35, threshold: 0.55 },
    vignette: { radius: 0.6, strength: 0.15 },
  },
  story: {
    bloom: { strength: 0.3, blurStrength: 0.2, threshold: 0.7 },
    vignette: { radius: 0.7, strength: 0.12 },
  },
  title: {
    bloom: { strength: 0.7, blurStrength: 0.45, threshold: 0.5 },
    vignette: { radius: 0.5, strength: 0.2 },
  },
  menu: {
    bloom: { strength: 0.2, blurStrength: 0.15, threshold: 0.8 },
    vignette: { radius: 0.7, strength: 0.1 },
  },
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
