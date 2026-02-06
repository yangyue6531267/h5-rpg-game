// ===== TitleScene：标题画面 =====

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { COLORS, FONTS } from '../config/theme.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // 粒子背景（水墨飘散）
    this.createParticles();

    // 装饰线
    const line = this.add.graphics();
    line.lineStyle(1, COLORS.gold, 0.3);
    line.lineBetween(cx - 120, cy - 60, cx + 120, cy - 60);
    line.lineBetween(cx - 120, cy + 10, cx + 120, cy + 10);

    // 游戏标题
    this.titleText = this.add.text(cx, cy - 30, '我把你当师姐', {
      fontFamily: FONTS.main,
      fontSize: FONTS.size.title,
      color: COLORS.textBright,
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0);

    // 副标题
    this.subTitle = this.add.text(cx, cy + 25, '墨 山 道 R P G', {
      fontFamily: FONTS.main,
      fontSize: FONTS.size.lg,
      color: COLORS.goldStr,
      letterSpacing: 8
    }).setOrigin(0.5).setAlpha(0);

    // 淡入动画
    this.tweens.add({
      targets: this.titleText,
      alpha: 1,
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

    // 菜单按钮（延迟显示）
    this.time.delayedCall(800, () => {
      this.createMenuButtons(cx, cy);
    });

    // 底部引言
    this.add.text(cx, GAME_HEIGHT - 30, '"血条没清零，你就还有戏。"', {
      fontFamily: FONTS.main,
      fontSize: FONTS.size.sm,
      color: COLORS.textDim
    }).setOrigin(0.5).setAlpha(0.6);
  }

  createParticles() {
    // 用图形创建简单粒子纹理
    const gfx = this.add.graphics();
    gfx.fillStyle(0xffffff, 0.3);
    gfx.fillCircle(4, 4, 2);
    gfx.generateTexture('particle_dot', 8, 8);
    gfx.destroy();

    this.add.particles(0, 0, 'particle_dot', {
      x: { min: 0, max: GAME_WIDTH },
      y: -10,
      lifespan: 6000,
      speedY: { min: 10, max: 30 },
      speedX: { min: -5, max: 5 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.3, end: 0 },
      frequency: 300,
      quantity: 1,
      tint: [0xd4a843, 0x8a8a9a, 0x4a7ab5]
    });
  }

  createMenuButtons(cx, cy) {
    const buttons = [
      { text: '新游戏', y: cy + 100, action: () => this.startNewGame() },
      { text: '继续游戏', y: cy + 145, action: () => this.loadGame() },
      { text: '设  置', y: cy + 190, action: () => this.openSettings() }
    ];

    buttons.forEach((btn, i) => {
      const container = this.createButton(cx, btn.y, btn.text, btn.action);
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

  createButton(x, y, text, callback) {
    const container = this.add.container(x, y);

    // 按钮背景
    const bg = this.add.rectangle(0, 0, 200, 36, COLORS.bgPanel, 0.85)
      .setStrokeStyle(1, COLORS.btnBorder);

    // 按钮文字
    const txt = this.add.text(0, 0, text, {
      fontFamily: FONTS.main,
      fontSize: FONTS.size.md,
      color: COLORS.textMain
    }).setOrigin(0.5);

    container.add([bg, txt]);
    container.setSize(200, 36);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.setFillStyle(COLORS.btnHover, 1);
      bg.setStrokeStyle(1, COLORS.gold);
      txt.setColor(COLORS.goldStr);
    });

    container.on('pointerout', () => {
      bg.setFillStyle(COLORS.bgPanel, 0.85);
      bg.setStrokeStyle(1, COLORS.btnBorder);
      txt.setColor(COLORS.textMain);
    });

    container.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        yoyo: true,
        onComplete: callback
      });
    });

    return container;
  }

  startNewGame() {
    const gameState = this.registry.get('gameState');
    gameState.newGame();
    this.cameras.main.fadeOut(500, 10, 10, 15);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('StoryScene');
      this.scene.launch('HUDScene');
    });
  }

  loadGame() {
    this.scene.start('SaveScene', { mode: 'load', returnScene: 'TitleScene' });
  }

  openSettings() {
    this.scene.start('SettingsScene', { returnScene: 'TitleScene' });
  }
}
