// ===== TitleScene：HD-2D 标题画面 =====

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { COLORS, FONTS, GLASS, POSTFX_PRESETS } from '../config/theme.js';
import { PostFXManager } from '../effects/PostFXManager.js';
import { ParticleLibrary } from '../effects/ParticleLibrary.js';
import { GlassPanel } from '../ui/GlassPanel.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // 深色渐变背景
    this.createBackground(cx, cy);

    // PostFX 标题预设
    this.postFX = new PostFXManager(this);
    this.postFX.applyPreset('title');

    // 大气粒子（萤火虫）
    this.createAtmosphericParticles();

    // 装饰线（金色渐变感）
    const line = this.add.graphics();
    line.lineStyle(1, COLORS.gold, 0.25);
    line.lineBetween(cx - 140, cy - 65, cx + 140, cy - 65);
    line.lineStyle(1, COLORS.gold, 0.15);
    line.lineBetween(cx - 100, cy + 15, cx + 100, cy + 15);

    // 游戏标题（带外发光）
    const titleGlow = this.add.text(cx, cy - 28, '我把你当师姐', {
      fontFamily: FONTS.main,
      fontSize: FONTS.size.title + 4,
      color: '#d4a843',
      stroke: '#d4a843',
      strokeThickness: 6,
    }).setOrigin(0.5).setAlpha(0);

    this.titleText = this.add.text(cx, cy - 28, '我把你当师姐', {
      fontFamily: FONTS.main,
      fontSize: FONTS.size.title,
      color: COLORS.textBright,
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0);

    // 副标题
    this.subTitle = this.add.text(cx, cy + 28, '墨 山 道 R P G', {
      fontFamily: FONTS.main,
      fontSize: FONTS.size.lg,
      color: COLORS.goldStr,
      letterSpacing: 8
    }).setOrigin(0.5).setAlpha(0);

    // HD-2D 标签
    this.add.text(cx, cy + 55, 'HD-2D', {
      fontFamily: FONTS.main,
      fontSize: 11,
      color: '#4a4a5a'
    }).setOrigin(0.5).setAlpha(0.6);

    // 淡入动画
    this.tweens.add({
      targets: [this.titleText, titleGlow],
      alpha: { from: 0, to: 1 },
      y: cy - 25,
      duration: 1200,
      ease: 'Power2'
    });
    this.tweens.add({
      targets: this.subTitle,
      alpha: 1,
      duration: 1200,
      delay: 400,
      ease: 'Power2'
    });

    // 标题呼吸发光
    this.tweens.add({
      targets: titleGlow,
      alpha: { from: 0.15, to: 0.35 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 菜单按钮（延迟显示）
    this.time.delayedCall(800, () => {
      this.createMenuButtons(cx, cy);
    });

    // 底部引言
    this.add.text(cx, GAME_HEIGHT - 30, '"血条没清零，你就还有戏。"', {
      fontFamily: FONTS.main,
      fontSize: FONTS.size.sm,
      color: COLORS.textDim
    }).setOrigin(0.5).setAlpha(0.5);
  }

  createBackground(cx, cy) {
    // 多层渐变背景
    const bg = this.add.graphics();

    // 天空渐变（深蓝→黑）
    const steps = 20;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const r = Math.floor(8 + t * 4);
      const g = Math.floor(8 + t * 6);
      const b = Math.floor(15 + t * 12);
      const color = Phaser.Display.Color.GetColor(r, g, b);
      const y = (i / steps) * GAME_HEIGHT;
      const h = GAME_HEIGHT / steps + 1;
      bg.fillStyle(color, 1);
      bg.fillRect(0, y, GAME_WIDTH, h);
    }

    // 远山剪影
    bg.fillStyle(0x0c0c16, 0.6);
    bg.beginPath();
    bg.moveTo(0, GAME_HEIGHT * 0.65);
    for (let x = 0; x <= GAME_WIDTH; x += 20) {
      const h = Math.sin(x * 0.008) * 30 + Math.sin(x * 0.015) * 15 + GAME_HEIGHT * 0.6;
      bg.lineTo(x, h);
    }
    bg.lineTo(GAME_WIDTH, GAME_HEIGHT);
    bg.lineTo(0, GAME_HEIGHT);
    bg.closePath();
    bg.fillPath();

    // 近景地面
    bg.fillStyle(0x08080e, 0.8);
    bg.fillRect(0, GAME_HEIGHT * 0.85, GAME_WIDTH, GAME_HEIGHT * 0.15);

    // 地面雾气
    bg.fillStyle(0x1a1a2e, 0.15);
    bg.fillRect(0, GAME_HEIGHT * 0.82, GAME_WIDTH, 20);
  }

  createAtmosphericParticles() {
    // 使用 ParticleLibrary 的纹理（如果存在）
    const particleKey = this.textures.exists('particle_soft') ? 'particle_soft' : null;

    if (!particleKey) {
      // fallback: 生成简单粒子纹理
      const gfx = this.add.graphics();
      gfx.fillStyle(0xffffff, 0.3);
      gfx.fillCircle(4, 4, 2);
      gfx.generateTexture('particle_dot', 8, 8);
      gfx.destroy();
    }

    const key = particleKey || 'particle_dot';

    // 萤火虫粒子
    this.add.particles(0, 0, key, {
      x: { min: 0, max: GAME_WIDTH },
      y: { min: GAME_HEIGHT * 0.5, max: GAME_HEIGHT * 0.85 },
      lifespan: { min: 3000, max: 6000 },
      speedX: { min: -8, max: 8 },
      speedY: { min: -15, max: -5 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0, end: 0 },
      emitCallback: (particle) => {
        particle.alphaSteps = [
          { time: 0, value: 0 },
          { time: 0.2, value: 0.5 },
          { time: 0.5, value: 0.3 },
          { time: 0.8, value: 0.5 },
          { time: 1, value: 0 }
        ];
      },
      frequency: 400,
      quantity: 1,
      tint: [0xd4a843, 0xffe4a0, 0x88ccff]
    });

    // 上方飘落微粒
    this.add.particles(0, 0, key, {
      x: { min: 0, max: GAME_WIDTH },
      y: -10,
      lifespan: 8000,
      speedY: { min: 5, max: 15 },
      speedX: { min: -3, max: 3 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.15, end: 0 },
      frequency: 500,
      quantity: 1,
      tint: [0x8a8a9a, 0x4a4a5a]
    });
  }

  createMenuButtons(cx, cy) {
    const buttons = [
      { text: '新游戏', y: cy + 105, action: () => this.startNewGame() },
      { text: '继续游戏', y: cy + 150, action: () => this.loadGame() },
      { text: '设  置', y: cy + 195, action: () => this.openSettings() }
    ];

    buttons.forEach((btn, i) => {
      const container = GlassPanel.createButton(
        this, cx, btn.y, 220, 38, btn.text, btn.action, {
          fontSize: FONTS.size.md,
          color: COLORS.textMain,
          hoverColor: COLORS.goldStr,
        }
      );
      container.setAlpha(0);
      this.tweens.add({
        targets: container,
        alpha: 1,
        y: btn.y,
        duration: 500,
        delay: i * 150,
        ease: 'Power2'
      });
    });
  }

  startNewGame() {
    const gameState = this.registry.get('gameState');
    gameState.newGame();
    if (this.postFX) this.postFX.clearAll();
    this.cameras.main.fadeOut(500, 10, 10, 15);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('StoryScene');
      this.scene.launch('HUDScene');
    });
  }

  loadGame() {
    if (this.postFX) this.postFX.clearAll();
    this.scene.start('SaveScene', { mode: 'load', returnScene: 'TitleScene' });
  }

  openSettings() {
    if (this.postFX) this.postFX.clearAll();
    this.scene.start('SettingsScene', { returnScene: 'TitleScene' });
  }
}
