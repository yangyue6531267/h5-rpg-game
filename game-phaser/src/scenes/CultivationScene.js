// ===== CultivationScene：HD-2D 修炼系统 =====

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { COLORS, FONTS } from '../config/theme.js';
import { SkillsData } from '../data/skills.js';
import { GlassPanel } from '../ui/GlassPanel.js';
import { HD2DBar } from '../ui/HD2DBar.js';

export class CultivationScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CultivationScene' });
  }

  create() {
    this.gameState = this.registry.get('gameState');

    // 半透明背景遮罩
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setInteractive();

    const panelW = 500;
    const panelH = 400;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // 毛玻璃面板
    const panel = GlassPanel.create(this, cx, cy, panelW, panelH, {
      accentColor: COLORS.purple,
      accentStr: COLORS.purpleStr,
    });

    // 标题
    this.add.text(cx, cy - panelH / 2 + 25, '修炼', {
      fontFamily: FONTS.main, fontSize: FONTS.size.xl, color: COLORS.purpleStr
    }).setOrigin(0.5);

    // 境界信息
    const p = this.gameState.player;
    const s = p.stats;

    this.realmText = this.add.text(cx, cy - panelH / 2 + 60, p.realm.display, {
      fontFamily: FONTS.main, fontSize: FONTS.size.lg, color: COLORS.goldStr
    }).setOrigin(0.5);

    // 经验条（HD2DBar）
    const barY = cy - panelH / 2 + 90;
    this.expBarObj = HD2DBar.create(this, cx - 100, barY - 4, 200, 12, {
      barColor: COLORS.purple,
      glowColor: 0xcc88ff,
      textColor: COLORS.textDim,
    });
    this.expBarObj.setValueImmediate(s.exp / s.expToNext, s.exp, s.expToNext);

    // 属性
    const statsY = cy - panelH / 2 + 115;
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

    // 行动按钮（毛玻璃）
    const btnY = cy + panelH / 2 - 80;
    GlassPanel.createButton(
      this, cx - 120, btnY, 200, 40, '打坐修炼',
      () => this.meditate(),
      { desc: '恢复灵力+获得经验', color: COLORS.textMain, hoverColor: COLORS.purpleStr }
    );
    GlassPanel.createButton(
      this, cx + 120, btnY, 200, 40, '休息',
      () => this.rest(),
      { desc: '恢复血量', color: COLORS.textMain, hoverColor: COLORS.greenStr }
    );

    // 关闭按钮
    const closeBtn = GlassPanel.createButton(
      this, cx, cy + panelH / 2 - 25, 120, 30, '← 返回',
      () => {
        this.gameState.events.emit('cultivationDone');
        this.scene.stop();
      },
      { color: COLORS.textDim, hoverColor: COLORS.goldStr, fontSize: FONTS.size.sm }
    );

    // 修炼粒子效果（紫色能量飘浮）
    this.createMeditationParticles(cx, cy);
  }

  createMeditationParticles(cx, cy) {
    const particleKey = this.textures.exists('particle_soft') ? 'particle_soft' : null;
    if (!particleKey) return;

    this.add.particles(cx, cy, particleKey, {
      x: { min: -150, max: 150 },
      y: { min: -100, max: 100 },
      lifespan: { min: 2000, max: 4000 },
      speedY: { min: -10, max: -3 },
      speedX: { min: -3, max: 3 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.3, end: 0 },
      frequency: 600,
      quantity: 1,
      tint: [0x8a5ab5, 0xcc88ff, 0x4a7ab5]
    });
  }

  meditate() {
    const s = this.gameState.player.stats;
    const expGain = 10 + Math.floor(Math.random() * 10);
    const spGain = Math.floor(s.maxSp * 0.3);
    s.sp = Math.min(s.maxSp, s.sp + spGain);
    this.gameState.modifyStat('exp', expGain);

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
