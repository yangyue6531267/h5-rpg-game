// ===== HUDScene：持久化状态栏 =====

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { COLORS, FONTS } from '../config/theme.js';

export class HUDScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HUDScene' });
  }

  create() {
    this.gameState = this.registry.get('gameState');

    // HUD 容器
    this.hudContainer = this.add.container(0, 0);

    // 顶部背景条
    const topBg = this.add.rectangle(GAME_WIDTH / 2, 18, GAME_WIDTH, 36, 0x0a0a0f, 0.9);
    this.hudContainer.add(topBg);

    // 左侧：角色名 + 境界
    this.nameText = this.add.text(10, 6, '', {
      fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: COLORS.textBright
    });
    this.realmText = this.add.text(10, 22, '', {
      fontFamily: FONTS.main, fontSize: FONTS.size.xs, color: COLORS.goldStr
    });
    this.hudContainer.add([this.nameText, this.realmText]);

    // HP条
    this.hpBarBg = this.add.rectangle(130, 10, 120, 8, COLORS.barBg).setOrigin(0, 0.5);
    this.hpBar = this.add.rectangle(130, 10, 120, 8, COLORS.hpBar).setOrigin(0, 0.5);
    this.hpText = this.add.text(255, 10, '', {
      fontFamily: FONTS.main, fontSize: 10, color: COLORS.redStr
    }).setOrigin(0, 0.5);
    this.hudContainer.add([this.hpBarBg, this.hpBar, this.hpText]);

    // SP条
    this.spBarBg = this.add.rectangle(130, 22, 120, 8, COLORS.barBg).setOrigin(0, 0.5);
    this.spBar = this.add.rectangle(130, 22, 120, 8, COLORS.spBar).setOrigin(0, 0.5);
    this.spText = this.add.text(255, 22, '', {
      fontFamily: FONTS.main, fontSize: 10, color: COLORS.blueStr
    }).setOrigin(0, 0.5);
    this.hudContainer.add([this.spBarBg, this.spBar, this.spText]);

    // 右侧：符钱 + 章节
    this.currencyText = this.add.text(GAME_WIDTH - 200, 8, '', {
      fontFamily: FONTS.main, fontSize: FONTS.size.xs, color: COLORS.goldStr
    });
    this.chapterText = this.add.text(GAME_WIDTH - 200, 22, '', {
      fontFamily: FONTS.main, fontSize: FONTS.size.xs, color: COLORS.textDim
    });
    this.hudContainer.add([this.currencyText, this.chapterText]);

    // 快捷按钮
    this.createQuickButtons();

    // 初始更新
    this.updateHUD();

    // 监听状态变化
    this.gameState.events.on('stateChanged', () => this.updateHUD());
    this.gameState.events.on('levelUp', (r) => this.showLevelUp(r));
  }

  createQuickButtons() {
    const btnData = [
      { text: '背包', x: GAME_WIDTH - 120, action: () => this.toggleOverlay('InventoryScene') },
      { text: '修炼', x: GAME_WIDTH - 75, action: () => this.toggleOverlay('CultivationScene') },
      { text: '存档', x: GAME_WIDTH - 30, action: () => this.toggleOverlay('SaveScene') }
    ];

    btnData.forEach(btn => {
      const txt = this.add.text(btn.x, 14, btn.text, {
        fontFamily: FONTS.main, fontSize: FONTS.size.xs, color: COLORS.textDim
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      txt.on('pointerover', () => txt.setColor(COLORS.goldStr));
      txt.on('pointerout', () => txt.setColor(COLORS.textDim));
      txt.on('pointerdown', btn.action);

      this.hudContainer.add(txt);
    });
  }

  toggleOverlay(sceneName) {
    if (this.scene.isActive(sceneName)) {
      this.scene.stop(sceneName);
    } else {
      this.scene.launch(sceneName, { mode: 'save', returnScene: null });
      this.scene.bringToTop('HUDScene');
    }
  }

  updateHUD() {
    const p = this.gameState.player;
    const s = p.stats;

    this.nameText.setText(p.name);
    this.realmText.setText(p.realm.display);

    // HP 条动画
    const hpRatio = Math.max(0, s.hp / s.maxHp);
    this.tweens.add({
      targets: this.hpBar,
      width: 120 * hpRatio,
      duration: 300,
      ease: 'Power2'
    });
    this.hpText.setText(`${s.hp}/${s.maxHp}`);

    // SP 条动画
    const spRatio = Math.max(0, s.sp / s.maxSp);
    this.tweens.add({
      targets: this.spBar,
      width: 120 * spRatio,
      duration: 300,
      ease: 'Power2'
    });
    this.spText.setText(`${s.sp}/${s.maxSp}`);

    this.currencyText.setText(`符钱: ${p.currency}`);
    this.chapterText.setText(`第${p.chapter}章`);
  }

  showLevelUp(realm) {
    const popup = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50,
      `突破！${realm.display}`, {
        fontFamily: FONTS.main,
        fontSize: FONTS.size.xl,
        color: COLORS.goldStr,
        stroke: '#000',
        strokeThickness: 3
      }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: popup,
      alpha: 1,
      y: GAME_HEIGHT / 2 - 80,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        this.tweens.add({
          targets: popup,
          alpha: 0,
          y: GAME_HEIGHT / 2 - 120,
          duration: 800,
          delay: 1500,
          onComplete: () => popup.destroy()
        });
      }
    });
  }

  setVisible(visible) {
    this.hudContainer.setVisible(visible);
  }
}
