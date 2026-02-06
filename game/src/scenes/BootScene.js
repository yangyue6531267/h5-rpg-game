// ===== BootScene：资源加载 + 纹理生成 =====

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { COLORS, FONTS } from '../config/theme.js';
import { GameState } from '../core/GameState.js';
import { SaveSystem } from '../core/SaveSystem.js';
import { PixelCharGenerator } from '../sprites/PixelCharGenerator.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // 显示加载画面
    this.createLoadingScreen();
  }

  create() {
    // 初始化全局状态
    const gameState = new GameState();
    const saveSystem = new SaveSystem();
    this.registry.set('gameState', gameState);
    this.registry.set('saveSystem', saveSystem);

    // 生成像素角色纹理
    this.updateLoadText('生成角色纹理...');
    const generator = new PixelCharGenerator(this);
    generator.generateAll();

    // 生成 UI 纹理
    this.updateLoadText('生成 UI 资源...');
    this.generateUITextures();

    // 预加载字体检测
    this.updateLoadText('加载字体...');

    // 等一帧确保纹理注册完成
    this.time.delayedCall(100, () => {
      this.updateLoadText('准备就绪！');
      this.time.delayedCall(300, () => {
        this.scene.start('TitleScene');
      });
    });
  }

  createLoadingScreen() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // 背景
    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, COLORS.bgDark);

    // 标题
    this.add.text(cx, cy - 40, '墨山道', {
      fontFamily: FONTS.main,
      fontSize: 28,
      color: COLORS.textDim
    }).setOrigin(0.5);

    // 加载文本
    this.loadText = this.add.text(cx, cy + 20, '加载中...', {
      fontFamily: FONTS.main,
      fontSize: 16,
      color: COLORS.systemGreenStr
    }).setOrigin(0.5);

    // 加载进度条
    const barW = 200;
    const barH = 4;
    this.add.rectangle(cx, cy + 50, barW, barH, COLORS.barBg).setOrigin(0.5);
    this.loadBar = this.add.rectangle(cx - barW / 2, cy + 50, 0, barH, COLORS.systemGreen).setOrigin(0, 0.5);

    // 动画进度条
    this.tweens.add({
      targets: this.loadBar,
      width: barW,
      duration: 800,
      ease: 'Power2'
    });
  }

  updateLoadText(text) {
    if (this.loadText) {
      this.loadText.setText(text);
    }
  }

  generateUITextures() {
    // 按钮背景纹理
    const btnCanvas = document.createElement('canvas');
    btnCanvas.width = 160;
    btnCanvas.height = 40;
    const btnCtx = btnCanvas.getContext('2d');
    btnCtx.fillStyle = 'rgba(26, 26, 40, 0.85)';
    btnCtx.fillRect(0, 0, 160, 40);
    btnCtx.strokeStyle = '#4a4a5a';
    btnCtx.lineWidth = 1;
    btnCtx.strokeRect(0.5, 0.5, 159, 39);
    this.textures.addCanvas('btn_bg', btnCanvas);

    // 面板背景纹理
    const panelCanvas = document.createElement('canvas');
    panelCanvas.width = 400;
    panelCanvas.height = 300;
    const panelCtx = panelCanvas.getContext('2d');
    panelCtx.fillStyle = 'rgba(18, 18, 26, 0.95)';
    panelCtx.fillRect(0, 0, 400, 300);
    panelCtx.strokeStyle = '#3a3a4a';
    panelCtx.lineWidth = 2;
    panelCtx.strokeRect(1, 1, 398, 298);
    this.textures.addCanvas('panel_bg', panelCanvas);

    // 对话框背景纹理
    const dialogCanvas = document.createElement('canvas');
    dialogCanvas.width = GAME_WIDTH;
    dialogCanvas.height = 160;
    const dCtx = dialogCanvas.getContext('2d');
    const grad = dCtx.createLinearGradient(0, 0, 0, 160);
    grad.addColorStop(0, 'rgba(10, 10, 15, 0.75)');
    grad.addColorStop(1, 'rgba(10, 10, 15, 0.95)');
    dCtx.fillStyle = grad;
    dCtx.fillRect(0, 0, GAME_WIDTH, 160);
    dCtx.strokeStyle = 'rgba(212, 168, 67, 0.4)';
    dCtx.lineWidth = 1;
    dCtx.beginPath();
    dCtx.moveTo(0, 0);
    dCtx.lineTo(GAME_WIDTH, 0);
    dCtx.stroke();
    this.textures.addCanvas('dialogue_bg', dialogCanvas);
  }
}
