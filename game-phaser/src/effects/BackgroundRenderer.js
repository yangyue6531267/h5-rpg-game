// ===== BackgroundRenderer：多层视差背景渲染器 =====

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';

export class BackgroundRenderer {
  constructor(scene) {
    this.scene = scene;
    this.layers = [];
    this.driftSpeed = 0.15; // 微量自动横向漂移
    this.enabled = true;
  }

  // 战斗场景背景：渐变天空 → 远山 → 中景 → 地面 → 大气
  createCombatBG() {
    const gfx = this.scene.add.graphics();

    // Layer 1: 天空渐变（靛蓝→深紫，提亮）
    const steps = 30;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const r = Math.floor(20 + t * 15);
      const g = Math.floor(22 + t * 18);
      const b = Math.floor(45 + t * 25);
      const color = Phaser.Display.Color.GetColor(r, g, b);
      const y = (i / steps) * GAME_HEIGHT * 0.6;
      const h = (GAME_HEIGHT * 0.6 / steps) + 1;
      gfx.fillStyle(color, 1);
      gfx.fillRect(0, y, GAME_WIDTH, h);
    }

    // Layer 2: 远山剪影（最远，蓝紫调）
    gfx.fillStyle(0x1e1e38, 0.6);
    gfx.beginPath();
    gfx.moveTo(0, GAME_HEIGHT * 0.38);
    for (let x = 0; x <= GAME_WIDTH; x += 15) {
      const h = Math.sin(x * 0.005) * 40 + Math.sin(x * 0.012) * 20 + Math.sin(x * 0.025) * 8 + GAME_HEIGHT * 0.35;
      gfx.lineTo(x, h);
    }
    gfx.lineTo(GAME_WIDTH, GAME_HEIGHT * 0.6);
    gfx.lineTo(0, GAME_HEIGHT * 0.6);
    gfx.closePath();
    gfx.fillPath();

    // Layer 3: 中山（稍近，深蓝紫）
    gfx.fillStyle(0x161630, 0.7);
    gfx.beginPath();
    gfx.moveTo(0, GAME_HEIGHT * 0.45);
    for (let x = 0; x <= GAME_WIDTH; x += 12) {
      const h = Math.sin(x * 0.008 + 2) * 30 + Math.sin(x * 0.02 + 1) * 12 + GAME_HEIGHT * 0.42;
      gfx.lineTo(x, h);
    }
    gfx.lineTo(GAME_WIDTH, GAME_HEIGHT * 0.6);
    gfx.lineTo(0, GAME_HEIGHT * 0.6);
    gfx.closePath();
    gfx.fillPath();

    // Layer 4: 中景树影/植被
    gfx.fillStyle(0x121228, 0.75);
    gfx.beginPath();
    gfx.moveTo(0, GAME_HEIGHT * 0.52);
    for (let x = 0; x <= GAME_WIDTH; x += 8) {
      const base = GAME_HEIGHT * 0.5;
      const tree = Math.sin(x * 0.03) * 8 + Math.sin(x * 0.08) * 4;
      const spike = (x % 40 < 20) ? Math.sin(x * 0.15) * 6 : 0;
      gfx.lineTo(x, base + tree + spike);
    }
    gfx.lineTo(GAME_WIDTH, GAME_HEIGHT * 0.6);
    gfx.lineTo(0, GAME_HEIGHT * 0.6);
    gfx.closePath();
    gfx.fillPath();

    // Layer 5: 地面（提亮）
    gfx.fillStyle(0x1a1a2e, 1);
    gfx.fillRect(0, GAME_HEIGHT * 0.57, GAME_WIDTH, GAME_HEIGHT * 0.43);

    // 地面分界线（金色微光，增亮）
    gfx.lineStyle(1, 0xd4a843, 0.15);
    gfx.beginPath();
    gfx.moveTo(40, GAME_HEIGHT * 0.57);
    gfx.lineTo(GAME_WIDTH - 40, GAME_HEIGHT * 0.57);
    gfx.strokePath();

    // 等距地面网格（增亮）
    gfx.lineStyle(1, 0x2a2a40, 0.25);
    for (let i = 0; i < 8; i++) {
      const y = GAME_HEIGHT * 0.6 + i * 22;
      gfx.beginPath();
      gfx.moveTo(0, y);
      gfx.lineTo(GAME_WIDTH, y);
      gfx.strokePath();
    }

    // 地面雾气（增亮）
    gfx.fillStyle(0x2a2a44, 0.15);
    gfx.fillRect(0, GAME_HEIGHT * 0.55, GAME_WIDTH, 16);

    return gfx;
  }

  // 标题场景背景
  createTitleBG() {
    const gfx = this.scene.add.graphics();

    // 天空渐变（提亮）
    const steps = 25;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const r = Math.floor(14 + t * 10);
      const g = Math.floor(14 + t * 12);
      const b = Math.floor(28 + t * 18);
      const color = Phaser.Display.Color.GetColor(r, g, b);
      const y = (i / steps) * GAME_HEIGHT;
      const h = GAME_HEIGHT / steps + 1;
      gfx.fillStyle(color, 1);
      gfx.fillRect(0, y, GAME_WIDTH, h);
    }

    // 远山
    gfx.fillStyle(0x181830, 0.55);
    gfx.beginPath();
    gfx.moveTo(0, GAME_HEIGHT * 0.6);
    for (let x = 0; x <= GAME_WIDTH; x += 20) {
      const h = Math.sin(x * 0.006) * 35 + Math.sin(x * 0.015) * 18 + GAME_HEIGHT * 0.55;
      gfx.lineTo(x, h);
    }
    gfx.lineTo(GAME_WIDTH, GAME_HEIGHT);
    gfx.lineTo(0, GAME_HEIGHT);
    gfx.closePath();
    gfx.fillPath();

    // 近景地面
    gfx.fillStyle(0x121220, 0.8);
    gfx.fillRect(0, GAME_HEIGHT * 0.82, GAME_WIDTH, GAME_HEIGHT * 0.18);

    // 地面雾
    gfx.fillStyle(0x2a2a44, 0.18);
    gfx.fillRect(0, GAME_HEIGHT * 0.80, GAME_WIDTH, 20);

    return gfx;
  }

  // 剧情场景背景（按章节变化）
  createStoryBG(chapter = 1) {
    const gfx = this.scene.add.graphics();

    // 根据章节切换色调（提亮）
    let baseR, baseG, baseB;
    if (chapter <= 2) {
      // 山间（冷色）
      baseR = 16; baseG = 20; baseB = 35;
    } else if (chapter <= 4) {
      // 夜晚（暖色）
      baseR = 22; baseG = 16; baseB = 28;
    } else {
      // 黎明（金色）
      baseR = 26; baseG = 22; baseB = 20;
    }

    const steps = 20;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const r = Math.floor(baseR + t * 8);
      const g = Math.floor(baseG + t * 8);
      const b = Math.floor(baseB + t * 10);
      const color = Phaser.Display.Color.GetColor(r, g, b);
      const y = (i / steps) * GAME_HEIGHT;
      const h = GAME_HEIGHT / steps + 1;
      gfx.fillStyle(color, 1);
      gfx.fillRect(0, y, GAME_WIDTH, h);
    }

    return gfx;
  }

  // 添加大气粒子
  addAtmosphericParticles(type = 'dust') {
    const particleKey = this.scene.textures.exists('particle_soft') ? 'particle_soft' : null;
    if (!particleKey) return null;

    if (type === 'fireflies') {
      return this.scene.add.particles(0, 0, particleKey, {
        x: { min: 0, max: GAME_WIDTH },
        y: { min: GAME_HEIGHT * 0.4, max: GAME_HEIGHT * 0.85 },
        lifespan: { min: 3000, max: 5000 },
        speedX: { min: -6, max: 6 },
        speedY: { min: -12, max: -3 },
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.4, end: 0 },
        frequency: 500,
        quantity: 1,
        tint: [0xd4a843, 0xffe4a0, 0x88ccff]
      });
    }

    // 默认：大气微尘
    return this.scene.add.particles(0, 0, particleKey, {
      x: { min: 0, max: GAME_WIDTH },
      y: -10,
      lifespan: 8000,
      speedY: { min: 4, max: 12 },
      speedX: { min: -2, max: 2 },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.1, end: 0 },
      frequency: 600,
      quantity: 1,
      tint: [0x8a8a9a, 0x4a4a5a]
    });
  }

  destroy() {
    this.layers.forEach(l => { if (l && l.destroy) l.destroy(); });
    this.layers = [];
  }
}
