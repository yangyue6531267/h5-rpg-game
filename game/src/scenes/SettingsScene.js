// ===== SettingsScene：设置 =====

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { COLORS, FONTS } from '../config/theme.js';

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

    // 标题
    this.add.text(cx, cy - 80, '设置', {
      fontFamily: FONTS.main, fontSize: FONTS.size.xl, color: COLORS.goldStr
    }).setOrigin(0.5);

    // 文字速度
    this.add.text(cx - 120, cy - 20, '文字速度', {
      fontFamily: FONTS.main, fontSize: FONTS.size.md, color: COLORS.textMain
    });

    // 速度值显示
    this.speedText = this.add.text(cx + 80, cy - 20, `${this.gameState.textSpeed}ms`, {
      fontFamily: FONTS.main, fontSize: FONTS.size.md, color: COLORS.goldStr
    });

    // 调节按钮
    const minusBtn = this.add.text(cx + 20, cy - 20, '◀', {
      fontFamily: FONTS.main, fontSize: FONTS.size.md, color: COLORS.textDim
    }).setInteractive({ useHandCursor: true });
    minusBtn.on('pointerdown', () => {
      this.gameState.textSpeed = Math.max(10, this.gameState.textSpeed - 10);
      this.speedText.setText(`${this.gameState.textSpeed}ms`);
    });

    const plusBtn = this.add.text(cx + 140, cy - 20, '▶', {
      fontFamily: FONTS.main, fontSize: FONTS.size.md, color: COLORS.textDim
    }).setInteractive({ useHandCursor: true });
    plusBtn.on('pointerdown', () => {
      this.gameState.textSpeed = Math.min(200, this.gameState.textSpeed + 10);
      this.speedText.setText(`${this.gameState.textSpeed}ms`);
    });

    // 返回按钮
    const backBtn = this.add.text(cx, cy + 80, '← 返回', {
      fontFamily: FONTS.main, fontSize: FONTS.size.md, color: COLORS.textDim
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor(COLORS.goldStr));
    backBtn.on('pointerout', () => backBtn.setColor(COLORS.textDim));
    backBtn.on('pointerdown', () => {
      this.scene.start(this.returnScene);
    });
  }
}
