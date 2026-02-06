// ===== CultivationScene：修炼系统 =====

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { COLORS, FONTS } from '../config/theme.js';
import { SkillsData } from '../data/skills.js';

export class CultivationScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CultivationScene' });
  }

  create() {
    this.gameState = this.registry.get('gameState');

    // 半透明背景遮罩
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setInteractive(); // 阻止下层点击

    // 面板
    const panelW = 500;
    const panelH = 400;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    this.add.rectangle(cx, cy, panelW, panelH, COLORS.bgPanel, 0.95)
      .setStrokeStyle(2, COLORS.purple, 0.5);

    // 标题
    this.add.text(cx, cy - panelH / 2 + 25, '🧘 修炼', {
      fontFamily: FONTS.main, fontSize: FONTS.size.xl, color: COLORS.purpleStr
    }).setOrigin(0.5);

    // 境界信息
    const p = this.gameState.player;
    const s = p.stats;

    this.realmText = this.add.text(cx, cy - panelH / 2 + 60, p.realm.display, {
      fontFamily: FONTS.main, fontSize: FONTS.size.lg, color: COLORS.goldStr
    }).setOrigin(0.5);

    // 经验条
    const barY = cy - panelH / 2 + 90;
    this.add.rectangle(cx - 100, barY, 200, 12, COLORS.barBg).setOrigin(0, 0.5);
    this.expBar = this.add.rectangle(cx - 100, barY, 200 * (s.exp / s.expToNext), 12, COLORS.purple).setOrigin(0, 0.5);
    this.expText = this.add.text(cx + 110, barY, `${s.exp}/${s.expToNext}`, {
      fontFamily: FONTS.main, fontSize: FONTS.size.xs, color: COLORS.textDim
    }).setOrigin(0, 0.5);

    // 属性
    const statsY = cy - panelH / 2 + 120;
    this.add.text(cx, statsY, `攻击:${s.attack} | 防御:${s.defense} | 速度:${s.speed} | HP上限:${s.maxHp} | SP上限:${s.maxSp}`, {
      fontFamily: FONTS.main, fontSize: FONTS.size.xs, color: COLORS.textDim
    }).setOrigin(0.5);

    // 已学功法
    this.add.text(cx - panelW / 2 + 30, statsY + 30, '已学功法：', {
      fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: COLORS.textMain
    });

    p.skills.forEach((sid, i) => {
      const sk = SkillsData[sid];
      if (sk) {
        this.add.text(cx - panelW / 2 + 40, statsY + 50 + i * 20, `• ${sk.name} — ${sk.description || ''}`, {
          fontFamily: FONTS.main, fontSize: FONTS.size.xs, color: COLORS.blueStr,
          wordWrap: { width: panelW - 80 }
        });
      }
    });

    // 行动按钮
    const btnY = cy + panelH / 2 - 80;
    this.createActionBtn(cx - 120, btnY, '🧘 打坐修炼', '恢复灵力+获得经验', () => this.meditate());
    this.createActionBtn(cx + 120, btnY, '💤 休息', '恢复血量', () => this.rest());

    // 关闭按钮
    this.createCloseBtn(cx, cy + panelH / 2 - 25);
  }

  createActionBtn(x, y, text, desc, callback) {
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 200, 40, COLORS.bgCard)
      .setStrokeStyle(1, COLORS.btnBorder);
    const txt = this.add.text(0, -5, text, {
      fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: COLORS.textMain
    }).setOrigin(0.5);
    const descTxt = this.add.text(0, 12, desc, {
      fontFamily: FONTS.main, fontSize: 10, color: COLORS.textDim
    }).setOrigin(0.5);

    container.add([bg, txt, descTxt]);
    container.setSize(200, 40);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => { bg.setStrokeStyle(1, COLORS.gold); txt.setColor(COLORS.goldStr); });
    container.on('pointerout', () => { bg.setStrokeStyle(1, COLORS.btnBorder); txt.setColor(COLORS.textMain); });
    container.on('pointerdown', callback);

    return container;
  }

  createCloseBtn(x, y) {
    const btn = this.add.text(x, y, '← 返回', {
      fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: COLORS.textDim
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor(COLORS.goldStr));
    btn.on('pointerout', () => btn.setColor(COLORS.textDim));
    btn.on('pointerdown', () => {
      this.gameState.events.emit('cultivationDone');
      this.scene.stop();
    });
  }

  meditate() {
    const s = this.gameState.player.stats;
    const expGain = 10 + Math.floor(Math.random() * 10);
    const spGain = Math.floor(s.maxSp * 0.3);
    s.sp = Math.min(s.maxSp, s.sp + spGain);
    this.gameState.modifyStat('exp', expGain);

    // 简单粒子效果
    this.showResultPopup([
      { text: `灵力恢复 +${spGain}`, color: COLORS.blueStr },
      { text: `经验获得 +${expGain}`, color: COLORS.greenStr },
      { text: '系统：又水了一波经验，不错不错。', color: COLORS.systemGreenStr }
    ]);
  }

  rest() {
    const s = this.gameState.player.stats;
    const hpGain = Math.floor(s.maxHp * 0.5);
    s.hp = Math.min(s.maxHp, s.hp + hpGain);
    this.gameState.events.emit('stateChanged');

    this.showResultPopup([
      { text: `血量恢复 +${hpGain}`, color: COLORS.redStr },
      { text: '系统：睡一觉就满血，这游戏也太简单了。', color: COLORS.systemGreenStr }
    ]);
  }

  showResultPopup(messages) {
    // 重启场景以刷新数据
    this.time.delayedCall(1200, () => {
      this.scene.restart();
    });

    // 显示结果
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    messages.forEach((msg, i) => {
      const txt = this.add.text(cx, cy + 30 + i * 22, msg.text, {
        fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: msg.color,
        stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({
        targets: txt,
        alpha: 1, y: cy + 20 + i * 22,
        duration: 400, delay: i * 150
      });
    });
  }
}
