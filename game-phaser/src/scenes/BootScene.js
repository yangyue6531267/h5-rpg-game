// ===== BootScene：HD-2D 资源加载 + 纹理生成 =====

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { COLORS, FONTS } from '../config/theme.js';
import { GameState } from '../core/GameState.js';
import { SaveSystem } from '../core/SaveSystem.js';
import { HD2DCharGenerator } from '../sprites/HD2DCharGenerator.js';
import { ParticleLibrary } from '../effects/ParticleLibrary.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.createLoadingScreen();

    // 自定义主角贴图（来自 public/images）
    // webp 作为站立贴图
    this.load.image('player_idle_stand', '/images/站立.webp');

    // gif 文件较大，Phaser 会以静态图加载（首帧）
    // 如果加载失败则忽略，战斗中回退到程序生成的角色
    this.load.image('player_skill_1', '/images/1kisll.gif');
    this.load.image('player_skill_2', '/images/2kills.gif');
    this.load.image('player_skill_3', '/images/3skill.gif');

    // 监听加载失败 → 不阻塞流程
    this.load.on('loaderror', (fileObj) => {
      console.warn('资源加载失败（已忽略）:', fileObj.key, fileObj.url);
    });
  }

  create() {
    // 初始化全局状态
    const gameState = new GameState();
    const saveSystem = new SaveSystem();
    this.registry.set('gameState', gameState);
    this.registry.set('saveSystem', saveSystem);

    // 生成粒子纹理
    this.updateLoadText('生成粒子纹理...');
    ParticleLibrary.generateTextures(this);

    // 生成 HD-2D 角色纹理（128×128，15帧）
    this.updateLoadText('生成 HD-2D 角色纹理...');
    const generator = new HD2DCharGenerator(this);
    generator.generateAll();

    // 生成 UI 纹理
    this.updateLoadText('生成 UI 资源...');
    this.generateUITextures();

    // 生成毛玻璃噪点纹理
    this.generateGlassNoiseTexture();

    this.updateLoadText('加载字体...');

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

    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, COLORS.bgDark);

    // 标题带微光效果
    const title = this.add.text(cx, cy - 40, '墨山道', {
      fontFamily: FONTS.main,
      fontSize: 28,
      color: COLORS.textDim
    }).setOrigin(0.5);

    // 副标题
    this.add.text(cx, cy - 12, 'HD-2D', {
      fontFamily: FONTS.main,
      fontSize: 12,
      color: '#4a4a5a'
    }).setOrigin(0.5);

    this.loadText = this.add.text(cx, cy + 20, '加载中...', {
      fontFamily: FONTS.main,
      fontSize: 16,
      color: COLORS.systemGreenStr
    }).setOrigin(0.5);

    // 加载进度条（带渐变感）
    const barW = 200;
    const barH = 4;
    this.add.rectangle(cx, cy + 50, barW, barH, COLORS.barBg).setOrigin(0.5);
    this.loadBar = this.add.rectangle(cx - barW / 2, cy + 50, 0, barH, COLORS.systemGreen).setOrigin(0, 0.5);

    this.tweens.add({
      targets: this.loadBar,
      width: barW,
      duration: 1000,
      ease: 'Power2'
    });

    // 标题呼吸发光
    this.tweens.add({
      targets: title,
      alpha: { from: 0.6, to: 1 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  updateLoadText(text) {
    if (this.loadText) {
      this.loadText.setText(text);
    }
  }

  generateUITextures() {
    // 按钮背景（毛玻璃风格）
    const btnCanvas = document.createElement('canvas');
    btnCanvas.width = 160;
    btnCanvas.height = 40;
    const btnCtx = btnCanvas.getContext('2d');
    const btnGrad = btnCtx.createLinearGradient(0, 0, 0, 40);
    btnGrad.addColorStop(0, 'rgba(30, 30, 48, 0.85)');
    btnGrad.addColorStop(1, 'rgba(14, 14, 24, 0.9)');
    btnCtx.fillStyle = btnGrad;
    btnCtx.fillRect(0, 0, 160, 40);
    // 顶部高光
    btnCtx.strokeStyle = 'rgba(212, 168, 67, 0.2)';
    btnCtx.lineWidth = 1;
    btnCtx.beginPath();
    btnCtx.moveTo(2, 0.5);
    btnCtx.lineTo(158, 0.5);
    btnCtx.stroke();
    // 边框
    btnCtx.strokeStyle = 'rgba(74, 74, 90, 0.6)';
    btnCtx.lineWidth = 1;
    btnCtx.strokeRect(0.5, 0.5, 159, 39);
    this.textures.addCanvas('btn_bg', btnCanvas);

    // 面板背景（毛玻璃渐变）
    const panelCanvas = document.createElement('canvas');
    panelCanvas.width = 400;
    panelCanvas.height = 300;
    const panelCtx = panelCanvas.getContext('2d');
    const panelGrad = panelCtx.createLinearGradient(0, 0, 0, 300);
    panelGrad.addColorStop(0, 'rgba(30, 30, 48, 0.92)');
    panelGrad.addColorStop(1, 'rgba(14, 14, 24, 0.96)');
    panelCtx.fillStyle = panelGrad;
    panelCtx.fillRect(0, 0, 400, 300);
    // 顶部高光线
    panelCtx.strokeStyle = 'rgba(212, 168, 67, 0.25)';
    panelCtx.lineWidth = 1;
    panelCtx.beginPath();
    panelCtx.moveTo(4, 0.5);
    panelCtx.lineTo(396, 0.5);
    panelCtx.stroke();
    // 边框渐变
    panelCtx.strokeStyle = 'rgba(74, 74, 90, 0.5)';
    panelCtx.lineWidth = 2;
    panelCtx.strokeRect(1, 1, 398, 298);
    // 角落高光点
    panelCtx.fillStyle = 'rgba(212, 168, 67, 0.3)';
    panelCtx.fillRect(0, 0, 3, 3);
    panelCtx.fillRect(397, 0, 3, 3);
    this.textures.addCanvas('panel_bg', panelCanvas);

    // 对话框背景（毛玻璃+金色上边框）
    const dialogCanvas = document.createElement('canvas');
    dialogCanvas.width = GAME_WIDTH;
    dialogCanvas.height = 160;
    const dCtx = dialogCanvas.getContext('2d');
    const grad = dCtx.createLinearGradient(0, 0, 0, 160);
    grad.addColorStop(0, 'rgba(16, 16, 28, 0.8)');
    grad.addColorStop(0.3, 'rgba(12, 12, 20, 0.9)');
    grad.addColorStop(1, 'rgba(10, 10, 15, 0.95)');
    dCtx.fillStyle = grad;
    dCtx.fillRect(0, 0, GAME_WIDTH, 160);
    // 上边框（金色渐变）
    const borderGrad = dCtx.createLinearGradient(0, 0, GAME_WIDTH, 0);
    borderGrad.addColorStop(0, 'rgba(212, 168, 67, 0.1)');
    borderGrad.addColorStop(0.3, 'rgba(212, 168, 67, 0.5)');
    borderGrad.addColorStop(0.5, 'rgba(255, 228, 160, 0.6)');
    borderGrad.addColorStop(0.7, 'rgba(212, 168, 67, 0.5)');
    borderGrad.addColorStop(1, 'rgba(212, 168, 67, 0.1)');
    dCtx.strokeStyle = borderGrad;
    dCtx.lineWidth = 2;
    dCtx.beginPath();
    dCtx.moveTo(0, 0.5);
    dCtx.lineTo(GAME_WIDTH, 0.5);
    dCtx.stroke();
    // 微弱内发光
    const innerGlow = dCtx.createLinearGradient(0, 0, 0, 8);
    innerGlow.addColorStop(0, 'rgba(212, 168, 67, 0.08)');
    innerGlow.addColorStop(1, 'rgba(212, 168, 67, 0)');
    dCtx.fillStyle = innerGlow;
    dCtx.fillRect(0, 1, GAME_WIDTH, 8);
    this.textures.addCanvas('dialogue_bg', dialogCanvas);
  }

  // 生成毛玻璃噪点覆盖纹理
  generateGlassNoiseTexture() {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = Math.floor(Math.random() * 8); // 非常微弱
    }
    ctx.putImageData(imageData, 0, 0);
    this.textures.addCanvas('glass_noise', canvas);
  }
}
