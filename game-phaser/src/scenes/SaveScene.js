// ===== SaveScene：HD-2D 存档/读档 =====

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { COLORS, FONTS } from '../config/theme.js';
import { GlassPanel } from '../ui/GlassPanel.js';

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

    // 毛玻璃面板
    const accentColor = this.mode === 'save' ? COLORS.systemGreen : COLORS.gold;
    const accentStr = this.mode === 'save' ? COLORS.systemGreenStr : COLORS.goldStr;
    GlassPanel.create(this, cx, cy, panelW, panelH, {
      accentColor,
      accentStr,
    });

    // 标题
    const title = this.mode === 'save' ? '存档' : '读档';
    this.add.text(cx, cy - panelH / 2 + 25, title, {
      fontFamily: FONTS.main, fontSize: FONTS.size.lg, color: accentStr
    }).setOrigin(0.5);

    // 存档槽位
    const slots = this.saveSystem.getAllSlotInfo();
    slots.forEach((slot, i) => {
      const y = cy - panelH / 2 + 70 + i * 65;
      this.createSlot(cx, y, slot, panelW - 60);
    });

    // 关闭按钮
    GlassPanel.createButton(
      this, cx, cy + panelH / 2 - 25, 120, 30, '← 返回',
      () => {
        if (this.returnScene) {
          this.scene.start(this.returnScene);
        } else {
          this.scene.stop();
        }
      },
      { color: COLORS.textDim, hoverColor: COLORS.goldStr, fontSize: FONTS.size.sm }
    );
  }

  createSlot(cx, y, slot, width) {
    const container = this.add.container(cx, y);

    // 毛玻璃槽位背景
    const bg = this.add.graphics();
    bg.fillStyle(0x0e0e18, 0.8);
    bg.fillRect(-width / 2, -26, width, 52);
    bg.fillStyle(0x1e1e30, 0.3);
    bg.fillRect(-width / 2, -26, width, 26);
    bg.lineStyle(1, 0x3a3a4a, 0.5);
    bg.strokeRect(-width / 2, -26, width, 52);
    // 顶部高光
    bg.lineStyle(1, 0xd4a843, 0.08);
    bg.beginPath();
    bg.moveTo(-width / 2 + 2, -25.5);
    bg.lineTo(width / 2 - 2, -25.5);
    bg.strokePath();
    container.add(bg);

    // 标签
    const label = this.add.text(-width / 2 + 15, -12, slot.label, {
      fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: COLORS.textBright
    });
    container.add(label);

    // 信息
    if (slot.info) {
      const info = this.add.text(-width / 2 + 15, 8,
        `${slot.info.name} | ${slot.info.realm} | 第${slot.info.chapter}章 | ${slot.info.timestamp}`, {
          fontFamily: FONTS.main, fontSize: FONTS.size.xs, color: COLORS.textDim
        });
      container.add(info);
    } else {
      const empty = this.add.text(-width / 2 + 15, 8, '（空）', {
        fontFamily: FONTS.main, fontSize: FONTS.size.xs, color: '#555'
      });
      container.add(empty);
    }

    // 交互
    container.setSize(width, 52);
    container.setInteractive({ useHandCursor: true });

    // hover 发光
    const hoverGlow = this.add.graphics();
    hoverGlow.fillStyle(0xd4a843, 0.06);
    hoverGlow.fillRect(-width / 2, -26, width, 52);
    hoverGlow.setVisible(false);
    container.add(hoverGlow);

    container.on('pointerover', () => {
      hoverGlow.setVisible(true);
      bg.clear();
      bg.fillStyle(0x1e1e30, 0.85);
      bg.fillRect(-width / 2, -26, width, 52);
      bg.fillStyle(0x2a2a44, 0.3);
      bg.fillRect(-width / 2, -26, width, 26);
      bg.lineStyle(1, COLORS.gold, 0.5);
      bg.strokeRect(-width / 2, -26, width, 52);
    });
    container.on('pointerout', () => {
      hoverGlow.setVisible(false);
      bg.clear();
      bg.fillStyle(0x0e0e18, 0.8);
      bg.fillRect(-width / 2, -26, width, 52);
      bg.fillStyle(0x1e1e30, 0.3);
      bg.fillRect(-width / 2, -26, width, 26);
      bg.lineStyle(1, 0x3a3a4a, 0.5);
      bg.strokeRect(-width / 2, -26, width, 52);
      bg.lineStyle(1, 0xd4a843, 0.08);
      bg.beginPath();
      bg.moveTo(-width / 2 + 2, -25.5);
      bg.lineTo(width / 2 - 2, -25.5);
      bg.strokePath();
    });
    container.on('pointerdown', () => this.onSlotClick(slot));
  }

  onSlotClick(slot) {
    if (this.mode === 'save') {
      if (slot.id === 'auto') return;
      if (this.saveSystem.saveToSlot(slot.id, this.gameState.player)) {
        this.scene.restart({ mode: 'save', returnScene: this.returnScene });
      }
    } else {
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
