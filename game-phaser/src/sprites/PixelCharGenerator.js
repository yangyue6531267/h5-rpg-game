// ===== 像素风角色 Sprite 生成器 =====
// 程序化生成 64×64 像素画 spritesheet

import { CharactersData } from '../data/characters.js';
import { MonstersData } from '../data/monsters.js';

// 角色配色方案（基于原 CharacterGraphicsEngine 的 styles）
const CHAR_PALETTES = {
  chen_dao: {
    skin: '#e2bc98', hair: '#1f1f24', robe: '#33476d',
    accent: '#8a5ab5', eye: '#1f1f1f', belt: '#d4a843'
  },
  su_lingyun: {
    skin: '#edc5a8', hair: '#46212a', robe: '#8b2437',
    accent: '#d4a843', eye: '#3a2323', belt: '#d4a843'
  },
  qing_he: {
    skin: '#ebc8a8', hair: '#1d2a20', robe: '#254b37',
    accent: '#7fa24e', eye: '#243224', belt: '#7fa24e'
  },
  yang_youwei: {
    skin: '#f0cfb2', hair: '#3e3658', robe: '#4a5da0',
    accent: '#f0ece0', eye: '#29283a', belt: '#d4a843'
  },
  wang_daoyuan: {
    skin: '#d3ad89', hair: '#3c2f2a', robe: '#6a4d37',
    accent: '#d4a843', eye: '#2a201c', belt: '#d4a843'
  },
  liu_changqing: {
    skin: '#c8a88a', hair: '#2d2d2d', robe: '#442b2b',
    accent: '#c43e3e', eye: '#1b1b1b', belt: '#c43e3e'
  },
  zhang_xiaobao: {
    skin: '#e2bc98', hair: '#2b2520', robe: '#3d5a4a',
    accent: '#6a9a5a', eye: '#2a2a2a', belt: '#6a9a5a'
  },
  zhao_jingxing: {
    skin: '#d3a880', hair: '#1a1a1a', robe: '#5a2020',
    accent: '#c43e3e', eye: '#1a1a1a', belt: '#7f2d2d'
  }
};

const DEFAULT_PALETTE = {
  skin: '#e5c2a4', hair: '#2b2b33', robe: '#2c3b5f',
  accent: '#d4a843', eye: '#2a2a2a', belt: '#d4a843'
};

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16)
  };
}

function darken(hex, amount) {
  const c = hexToRgb(hex);
  return {
    r: Math.max(0, Math.floor(c.r * (1 - amount))),
    g: Math.max(0, Math.floor(c.g * (1 - amount))),
    b: Math.max(0, Math.floor(c.b * (1 - amount)))
  };
}

function lighten(hex, amount) {
  const c = hexToRgb(hex);
  return {
    r: Math.min(255, Math.floor(c.r + (255 - c.r) * amount)),
    g: Math.min(255, Math.floor(c.g + (255 - c.g) * amount)),
    b: Math.min(255, Math.floor(c.b + (255 - c.b) * amount))
  };
}

function setPixel(data, x, y, w, r, g, b, a = 255) {
  if (x < 0 || x >= w || y < 0 || y >= 64) return;
  const idx = (y * w + x) * 4;
  data[idx] = r;
  data[idx + 1] = g;
  data[idx + 2] = b;
  data[idx + 3] = a;
}

function fillRect(data, x, y, rw, rh, w, r, g, b, a = 255) {
  for (let dy = 0; dy < rh; dy++) {
    for (let dx = 0; dx < rw; dx++) {
      setPixel(data, x + dx, y + dy, w, r, g, b, a);
    }
  }
}

// 绘制单帧角色像素画
function drawCharFrame(data, offsetX, palette, frameType, frameIdx) {
  const W = 64; // 每帧宽度
  const p = palette;
  const skin = hexToRgb(p.skin);
  const hair = hexToRgb(p.hair);
  const robe = hexToRgb(p.robe);
  const belt = hexToRgb(p.belt);
  const eye = hexToRgb(p.eye);
  const hairDark = darken(p.hair, 0.3);
  const robeDark = darken(p.robe, 0.2);
  const robeLight = lighten(p.robe, 0.15);
  const skinLight = lighten(p.skin, 0.15);

  // 位移偏移（用于动画）
  let bodyOffsetY = 0;
  let armOffsetX = 0;
  let legSpread = 0;

  if (frameType === 'idle') {
    bodyOffsetY = frameIdx === 1 ? -1 : 0;
  } else if (frameType === 'attack') {
    if (frameIdx === 0) { bodyOffsetY = 0; armOffsetX = 2; }
    else if (frameIdx === 1) { bodyOffsetY = -1; armOffsetX = 6; }
    else { bodyOffsetY = 0; armOffsetX = 3; }
  } else if (frameType === 'hurt') {
    bodyOffsetY = frameIdx === 0 ? 1 : 0;
    armOffsetX = frameIdx === 0 ? -2 : -1;
  }

  const ox = offsetX;
  const baseY = 16 + bodyOffsetY;

  // === 头发（上层） ===
  fillRect(data, ox + 26, baseY, 12, 3, W * 8, hair.r, hair.g, hair.b);
  fillRect(data, ox + 24, baseY + 3, 16, 2, W * 8, hair.r, hair.g, hair.b);
  fillRect(data, ox + 24, baseY + 5, 2, 6, W * 8, hairDark.r, hairDark.g, hairDark.b); // 左鬓
  fillRect(data, ox + 38, baseY + 5, 2, 6, W * 8, hairDark.r, hairDark.g, hairDark.b); // 右鬓

  // === 脸部 ===
  fillRect(data, ox + 26, baseY + 5, 12, 10, W * 8, skin.r, skin.g, skin.b);
  fillRect(data, ox + 27, baseY + 4, 10, 1, W * 8, skinLight.r, skinLight.g, skinLight.b); // 额头高光

  // === 眼睛 ===
  if (frameType === 'hurt' && frameIdx === 0) {
    // X 眼（受伤）
    setPixel(data, ox + 28, baseY + 9, W * 8, eye.r, eye.g, eye.b);
    setPixel(data, ox + 30, baseY + 9, W * 8, eye.r, eye.g, eye.b);
    setPixel(data, ox + 34, baseY + 9, W * 8, eye.r, eye.g, eye.b);
    setPixel(data, ox + 36, baseY + 9, W * 8, eye.r, eye.g, eye.b);
  } else {
    // 正常眼睛
    fillRect(data, ox + 28, baseY + 8, 2, 2, W * 8, eye.r, eye.g, eye.b);
    fillRect(data, ox + 34, baseY + 8, 2, 2, W * 8, eye.r, eye.g, eye.b);
    // 眼白高光
    setPixel(data, ox + 28, baseY + 8, W * 8, 255, 255, 255, 180);
    setPixel(data, ox + 34, baseY + 8, W * 8, 255, 255, 255, 180);
  }

  // === 嘴 ===
  if (frameType === 'hurt') {
    fillRect(data, ox + 30, baseY + 12, 4, 1, W * 8, 180, 80, 80); // 嘴巴张开
  } else if (frameType === 'attack' && frameIdx === 1) {
    fillRect(data, ox + 30, baseY + 12, 4, 1, W * 8, 160, 100, 100); // 喊叫
  } else {
    fillRect(data, ox + 31, baseY + 12, 2, 1, W * 8, darken(p.skin, 0.3).r, darken(p.skin, 0.3).g, darken(p.skin, 0.3).b);
  }

  // === 身体/长袍 ===
  fillRect(data, ox + 24, baseY + 15, 16, 20, W * 8, robe.r, robe.g, robe.b);
  // 领口
  fillRect(data, ox + 30, baseY + 15, 4, 3, W * 8, robeLight.r, robeLight.g, robeLight.b);
  // 中线
  fillRect(data, ox + 31, baseY + 18, 2, 14, W * 8, robeDark.r, robeDark.g, robeDark.b);
  // 腰带
  fillRect(data, ox + 24, baseY + 24, 16, 2, W * 8, belt.r, belt.g, belt.b);
  // 袍摆展开
  fillRect(data, ox + 22, baseY + 32, 2, 3, W * 8, robeDark.r, robeDark.g, robeDark.b);
  fillRect(data, ox + 40, baseY + 32, 2, 3, W * 8, robeDark.r, robeDark.g, robeDark.b);

  // === 手臂 ===
  const armX1 = ox + 20 + armOffsetX;
  const armX2 = ox + 40 + armOffsetX;
  fillRect(data, armX1, baseY + 16, 4, 10, W * 8, robe.r, robe.g, robe.b);
  fillRect(data, armX2, baseY + 16, 4, 10, W * 8, robe.r, robe.g, robe.b);
  // 手
  fillRect(data, armX1, baseY + 26, 4, 3, W * 8, skin.r, skin.g, skin.b);
  fillRect(data, armX2, baseY + 26, 4, 3, W * 8, skin.r, skin.g, skin.b);

  // === 攻击时的剑光 ===
  if (frameType === 'attack' && frameIdx === 1) {
    const accentC = hexToRgb(p.accent);
    for (let i = 0; i < 12; i++) {
      setPixel(data, armX2 + 4 + i, baseY + 16 - i, W * 8, accentC.r, accentC.g, accentC.b, 200);
      if (i > 2) {
        setPixel(data, armX2 + 5 + i, baseY + 16 - i, W * 8, 255, 255, 255, 120);
      }
    }
  }

  // === 脚 ===
  fillRect(data, ox + 26 - legSpread, baseY + 35, 5, 3, W * 8, robeDark.r, robeDark.g, robeDark.b);
  fillRect(data, ox + 33 + legSpread, baseY + 35, 5, 3, W * 8, robeDark.r, robeDark.g, robeDark.b);
  // 鞋
  fillRect(data, ox + 26 - legSpread, baseY + 38, 5, 2, W * 8, 30, 30, 35);
  fillRect(data, ox + 33 + legSpread, baseY + 38, 5, 2, W * 8, 30, 30, 35);
}

// 绘制怪物帧
function drawMonsterFrame(data, offsetX, accent, frameType, frameIdx) {
  const W = 64;
  const ac = hexToRgb(accent);
  const bodyColor = { r: 30, g: 20, b: 25 };
  const eyeColor = frameType === 'hurt' ? { r: 255, g: 100, b: 100 } : { r: 255, g: 80, b: 80 };

  const ox = offsetX;
  let baseY = 14 + (frameType === 'idle' && frameIdx === 1 ? -1 : 0);
  if (frameType === 'hurt') baseY += 2;

  // === 身体剪影 ===
  for (let dy = 0; dy < 28; dy++) {
    const width = Math.floor(14 + Math.sin(dy / 28 * Math.PI) * 8);
    const startX = ox + 32 - Math.floor(width / 2);
    fillRect(data, startX, baseY + 10 + dy, width, 1, W * 8, bodyColor.r, bodyColor.g, bodyColor.b);
  }

  // === 头部 ===
  for (let dy = 0; dy < 12; dy++) {
    const width = Math.floor(10 + Math.sin(dy / 12 * Math.PI) * 6);
    const startX = ox + 32 - Math.floor(width / 2);
    fillRect(data, startX, baseY + dy, width, 1, W * 8, bodyColor.r + 5, bodyColor.g + 3, bodyColor.b + 5);
  }

  // === 角 ===
  for (let i = 0; i < 5; i++) {
    setPixel(data, ox + 26 - i, baseY - i, W * 8, 50, 35, 45);
    setPixel(data, ox + 38 + i, baseY - i, W * 8, 50, 35, 45);
  }

  // === 眼睛（发光） ===
  if (frameType === 'dead') {
    // 死亡 - 暗淡的眼
    fillRect(data, ox + 28, baseY + 5, 3, 2, W * 8, 80, 40, 40, 100);
    fillRect(data, ox + 34, baseY + 5, 3, 2, W * 8, 80, 40, 40, 100);
  } else {
    fillRect(data, ox + 28, baseY + 5, 3, 2, W * 8, eyeColor.r, eyeColor.g, eyeColor.b);
    fillRect(data, ox + 34, baseY + 5, 3, 2, W * 8, eyeColor.r, eyeColor.g, eyeColor.b);
    // 瞳孔光泽
    setPixel(data, ox + 29, baseY + 5, W * 8, 255, 200, 200);
    setPixel(data, ox + 35, baseY + 5, W * 8, 255, 200, 200);
  }

  // === 嘴 ===
  if (frameType === 'attack') {
    fillRect(data, ox + 30, baseY + 9, 5, 2, W * 8, 150, 40, 40);
  } else {
    fillRect(data, ox + 30, baseY + 9, 4, 1, W * 8, 120, 40, 40);
  }

  // === 强调色光晕 ===
  for (let i = 0; i < 3; i++) {
    setPixel(data, ox + 26 + i * 4, baseY + 38 + (frameIdx % 2), W * 8, ac.r, ac.g, ac.b, 120);
  }
}

export class PixelCharGenerator {
  constructor(scene) {
    this.scene = scene;
  }

  generateAll() {
    this.generateCharacters();
    this.generateMonsters();
  }

  generateCharacters() {
    for (const charId of Object.keys(CharactersData)) {
      const palette = CHAR_PALETTES[charId] || DEFAULT_PALETTE;
      this._generateSpriteSheet(`char_${charId}`, (data, ox, type, idx) => {
        drawCharFrame(data, ox, palette, type, idx);
      });
    }
  }

  generateMonsters() {
    for (const [monsterId, monsterData] of Object.entries(MonstersData)) {
      const accent = monsterData.portraitAccent || '#8b2a2a';
      this._generateSpriteSheet(`monster_${monsterId}`, (data, ox, type, idx) => {
        drawMonsterFrame(data, ox, accent, type, idx);
      });
    }
  }

  _generateSpriteSheet(key, drawFn) {
    const FRAME_W = 64;
    const FRAME_H = 64;
    // 帧布局：idle(2) + attack(3) + hurt(2) + dead(1) = 8帧
    const TOTAL_FRAMES = 8;
    const sheetW = FRAME_W * TOTAL_FRAMES;
    const sheetH = FRAME_H;

    const canvas = document.createElement('canvas');
    canvas.width = sheetW;
    canvas.height = sheetH;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(sheetW, sheetH);
    const data = imageData.data;

    const frames = [
      { type: 'idle', idx: 0 },
      { type: 'idle', idx: 1 },
      { type: 'attack', idx: 0 },
      { type: 'attack', idx: 1 },
      { type: 'attack', idx: 2 },
      { type: 'hurt', idx: 0 },
      { type: 'hurt', idx: 1 },
      { type: 'dead', idx: 0 }
    ];

    frames.forEach((frame, i) => {
      drawFn(data, i * FRAME_W, frame.type, frame.idx);
    });

    ctx.putImageData(imageData, 0, 0);

    // 注册为 Phaser 纹理
    if (this.scene.textures.exists(key)) {
      this.scene.textures.remove(key);
    }
    this.scene.textures.addSpriteSheet(key, canvas, {
      frameWidth: FRAME_W,
      frameHeight: FRAME_H
    });

    // 创建动画
    this._createAnimations(key);
  }

  _createAnimations(key) {
    const anims = this.scene.anims;

    // Idle 动画 (帧 0-1, 循环)
    if (!anims.exists(`${key}_idle`)) {
      anims.create({
        key: `${key}_idle`,
        frames: anims.generateFrameNumbers(key, { start: 0, end: 1 }),
        frameRate: 2,
        repeat: -1
      });
    }

    // Attack 动画 (帧 2-4, 单次)
    if (!anims.exists(`${key}_attack`)) {
      anims.create({
        key: `${key}_attack`,
        frames: anims.generateFrameNumbers(key, { start: 2, end: 4 }),
        frameRate: 8,
        repeat: 0
      });
    }

    // Hurt 动画 (帧 5-6, 单次)
    if (!anims.exists(`${key}_hurt`)) {
      anims.create({
        key: `${key}_hurt`,
        frames: anims.generateFrameNumbers(key, { start: 5, end: 6 }),
        frameRate: 6,
        repeat: 0
      });
    }

    // Dead (帧 7, 单帧)
    if (!anims.exists(`${key}_dead`)) {
      anims.create({
        key: `${key}_dead`,
        frames: [{ key: key, frame: 7 }],
        frameRate: 1,
        repeat: 0
      });
    }
  }
}
