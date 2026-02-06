// ===== SettingsScene：HD-2D 设置 =====

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { COLORS, FONTS } from '../config/theme.js';
import { GlassPanel } from '../ui/GlassPanel.js';

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
  }

  init(data) {
    this.returnScene = data?.returnScene || 'TitleScene';
  }

  create() {
    this.gameState = this.registry.get('gameState');

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.bgDark);

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // 毛玻璃面板
    GlassPanel.create(this, cx, cy, 440, 320, {
      accentColor: COLORS.gold,
      accentStr: COLORS.goldStr,
    });

    // 标题
    this.add.text(cx, cy - 130, '设置', {
      fontFamily: FONTS.main, fontSize: FONTS.size.xl, color: COLORS.goldStr
    }).setOrigin(0.5);

    // --- 文字速度 ---
    this.add.text(cx - 160, cy - 70, '文字速度', {
      fontFamily: FONTS.main, fontSize: FONTS.size.md, color: COLORS.textMain
    });

    this.speedText = this.add.text(cx + 60, cy - 70, `${this.gameState.textSpeed}ms`, {
      fontFamily: FONTS.main, fontSize: FONTS.size.md, color: COLORS.goldStr
    });

    this.createArrowBtn(cx + 10, cy - 70, '◀', () => {
      this.gameState.textSpeed = Math.max(10, this.gameState.textSpeed - 10);
      this.speedText.setText(`${this.gameState.textSpeed}ms`);
    });
    this.createArrowBtn(cx + 120, cy - 70, '▶', () => {
      this.gameState.textSpeed = Math.min(200, this.gameState.textSpeed + 10);
      this.speedText.setText(`${this.gameState.textSpeed}ms`);
    });

    // --- 画质设置 ---
    this.add.text(cx - 160, cy - 20, '画质', {
      fontFamily: FONTS.main, fontSize: FONTS.size.md, color: COLORS.textMain
    });

    const quality = this.registry.get('graphicsQuality') || 'high';
    const qualities = ['high', 'medium', 'low'];
    const qualityLabels = { high: '高', medium: '中', low: '低' };
    this.qualityIndex = qualities.indexOf(quality);

    this.qualityText = this.add.text(cx + 60, cy - 20, qualityLabels[quality], {
      fontFamily: FONTS.main, fontSize: FONTS.size.md, color: COLORS.goldStr
    });

    this.createArrowBtn(cx + 10, cy - 20, '◀', () => {
      this.qualityIndex = Math.max(0, this.qualityIndex - 1);
      const q = qualities[this.qualityIndex];
      this.qualityText.setText(qualityLabels[q]);
      this.registry.set('graphicsQuality', q);
    });
    this.createArrowBtn(cx + 120, cy - 20, '▶', () => {
      this.qualityIndex = Math.min(2, this.qualityIndex + 1);
      const q = qualities[this.qualityIndex];
      this.qualityText.setText(qualityLabels[q]);
      this.registry.set('graphicsQuality', q);
    });

    // 画质说明
    this.add.text(cx, cy + 20, '高：全特效 | 中：减少粒子 | 低：关闭后处理', {
      fontFamily: FONTS.main, fontSize: FONTS.size.xs, color: COLORS.textDim
    }).setOrigin(0.5);

    // --- 返回按钮 ---
    GlassPanel.createButton(
      this, cx, cy + 100, 160, 36, '← 返回',
      () => this.scene.start(this.returnScene),
      { color: COLORS.textDim, hoverColor: COLORS.goldStr }
    );
  }

  createArrowBtn(x, y, text, callback) {
    const btn = this.add.text(x, y, text, {
      fontFamily: FONTS.main, fontSize: FONTS.size.md, color: COLORS.textDim
    }).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor(COLORS.goldStr));
    btn.on('pointerout', () => btn.setColor(COLORS.textDim));
    btn.on('pointerdown', callback);
    return btn;
  }
}
