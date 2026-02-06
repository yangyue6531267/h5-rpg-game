// ===== SaveScene：存档/读档 =====

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { COLORS, FONTS } from '../config/theme.js';

export class SaveScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SaveScene' });
  }

  init(data) {
    this.mode = data?.mode || 'save';
    this.returnScene = data?.returnScene;
  }

  create() {
    this.gameState = this.registry.get('gameState');
    this.saveSystem = this.registry.get('saveSystem');

    // 遮罩
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setInteractive();

    const panelW = 500;
    const panelH = 350;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.add.rectangle(cx, cy, panelW, panelH, COLORS.bgPanel, 0.95)
      .setStrokeStyle(2, COLORS.systemGreen, 0.4);

    // 标题
    const title = this.mode === 'save' ? '💾 存档' : '📂 读档';
    this.add.text(cx, cy - panelH / 2 + 25, title, {
      fontFamily: FONTS.main, fontSize: FONTS.size.lg, color: COLORS.systemGreenStr
    }).setOrigin(0.5);

    // 存档槽位
    const slots = this.saveSystem.getAllSlotInfo();
    slots.forEach((slot, i) => {
      const y = cy - panelH / 2 + 70 + i * 65;
      this.createSlot(cx, y, slot, panelW - 60);
    });

    // 关闭按钮
    const closeBtn = this.add.text(cx, cy + panelH / 2 - 25, '← 返回', {
      fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: COLORS.textDim
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerover', () => closeBtn.setColor(COLORS.goldStr));
    closeBtn.on('pointerout', () => closeBtn.setColor(COLORS.textDim));
    closeBtn.on('pointerdown', () => {
      if (this.returnScene) {
        this.scene.start(this.returnScene);
      } else {
        this.scene.stop();
      }
    });
  }

  createSlot(cx, y, slot, width) {
    const bg = this.add.rectangle(cx, y, width, 52, COLORS.bgCard, 0.9)
      .setStrokeStyle(1, COLORS.btnBorder)
      .setInteractive({ useHandCursor: true });

    // 标签
    this.add.text(cx - width / 2 + 15, y - 12, slot.label, {
      fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: COLORS.textBright
    });

    // 信息
    if (slot.info) {
      this.add.text(cx - width / 2 + 15, y + 8, `${slot.info.name} | ${slot.info.realm} | 第${slot.info.chapter}章 | ${slot.info.timestamp}`, {
        fontFamily: FONTS.main, fontSize: FONTS.size.xs, color: COLORS.textDim
      });
    } else {
      this.add.text(cx - width / 2 + 15, y + 8, '（空）', {
        fontFamily: FONTS.main, fontSize: FONTS.size.xs, color: '#555'
      });
    }

    bg.on('pointerover', () => bg.setStrokeStyle(1, COLORS.gold));
    bg.on('pointerout', () => bg.setStrokeStyle(1, COLORS.btnBorder));
    bg.on('pointerdown', () => this.onSlotClick(slot));
  }

  onSlotClick(slot) {
    if (this.mode === 'save') {
      if (slot.id === 'auto') return; // 不能覆盖自动存档
      if (this.saveSystem.saveToSlot(slot.id, this.gameState.player)) {
        // 刷新显示
        this.scene.restart({ mode: 'save', returnScene: this.returnScene });
      }
    } else {
      // 读档
      if (!slot.info) return;
      const data = this.saveSystem.loadFromSlot(slot.id);
      if (data) {
        this.gameState.player = data.player;
        this.gameState.events.emit('stateChanged');
        this.scene.stop('HUDScene');
        this.scene.start('StoryScene');
        this.scene.launch('HUDScene');
      }
    }
  }
}
