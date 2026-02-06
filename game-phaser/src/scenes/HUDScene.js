// ===== HUDScene：HD-2D 持久化状态栏 =====

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { COLORS, FONTS, GLASS } from '../config/theme.js';
import { HD2DBar } from '../ui/HD2DBar.js';

export class HUDScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HUDScene' });
  }

  create() {
    this.gameState = this.registry.get('gameState');

    // HUD 容器
    this.hudContainer = this.add.container(0, 0);

    // 顶部毛玻璃背景条
    const topBg = this.add.graphics();
    topBg.fillStyle(GLASS.fillBottom, 0.88);
    topBg.fillRect(0, 0, GAME_WIDTH, 40);
    // 上半渐变叠加
    topBg.fillStyle(GLASS.fillTop, 0.4);
    topBg.fillRect(0, 0, GAME_WIDTH, 20);
    // 底部边线
    topBg.lineStyle(1, GLASS.borderGradientTop, 0.2);
    topBg.beginPath();
    topBg.moveTo(0, 39.5);
    topBg.lineTo(GAME_WIDTH, 39.5);
    topBg.strokePath();
    // 顶部高光线
    topBg.lineStyle(1, GLASS.borderGradientTop, 0.1);
    topBg.beginPath();
    topBg.moveTo(0, 0.5);
    topBg.lineTo(GAME_WIDTH, 0.5);
    topBg.strokePath();
    this.hudContainer.add(topBg);

    // 噪点覆盖
    if (this.textures.exists('glass_noise')) {
      const noise = this.add.tileSprite(GAME_WIDTH / 2, 20, GAME_WIDTH, 40, 'glass_noise')
        .setAlpha(0.03);
      this.hudContainer.add(noise);
    }

    // 左侧：角色名 + 境界
    this.nameText = this.add.text(12, 6, '', {
      fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: COLORS.textBright
    });
    this.realmText = this.add.text(12, 23, '', {
      fontFamily: FONTS.main, fontSize: FONTS.size.xs, color: COLORS.goldStr
    });
    this.hudContainer.add([this.nameText, this.realmText]);

    // HP条（HD2DBar）
    this.hpBarObj = HD2DBar.create(this, 130, 8, 120, 8, {
      barColor: COLORS.hpBar,
      glowColor: 0xff6666,
      label: 'HP',
      textColor: COLORS.redStr
    });
    this.hudContainer.add(this.hpBarObj.container);

    // SP条（HD2DBar）
    this.spBarObj = HD2DBar.create(this, 130, 22, 120, 8, {
      barColor: COLORS.spBar,
      glowColor: 0x88ccff,
      label: 'SP',
      textColor: COLORS.blueStr
    });
    this.hudContainer.add(this.spBarObj.container);

    // 右侧：符钱 + 章节
    this.currencyText = this.add.text(GAME_WIDTH - 200, 8, '', {
      fontFamily: FONTS.main, fontSize: FONTS.size.xs, color: COLORS.goldStr
    });
    this.chapterText = this.add.text(GAME_WIDTH - 200, 23, '', {
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
      const txt = this.add.text(btn.x, 15, btn.text, {
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

    // HD2DBar 带动画更新
    const hpRatio = Math.max(0, s.hp / s.maxHp);
    this.hpBarObj.setValue(hpRatio, s.hp, s.maxHp);

    const spRatio = Math.max(0, s.sp / s.maxSp);
    this.spBarObj.setValue(spRatio, s.sp, s.maxSp);

    this.currencyText.setText(`符钱: ${p.currency}`);
    this.chapterText.setText(`第${p.chapter}章`);
  }

  showLevelUp(realm) {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // 金色闪光背景
    const flash = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0xd4a843, 0.15);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 800,
      onComplete: () => flash.destroy()
    });

    const popup = this.add.text(cx, cy - 50,
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
      y: cy - 80,
      duration: 600,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: popup,
          alpha: 0,
          y: cy - 120,
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
