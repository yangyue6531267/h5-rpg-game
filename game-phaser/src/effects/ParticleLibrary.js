// ===== ParticleLibrary：粒子特效工厂 =====

import { SKILL_VFX } from '../config/theme.js';

export class ParticleLibrary {
  constructor(scene) {
    this.scene = scene;
  }

  // 在 BootScene 中调用，生成所有粒子纹理
  static generateTextures(scene) {
    // 1. 柔和圆形 16×16（泛用）
    if (!scene.textures.exists('particle_soft')) {
      const g1 = scene.make.graphics({ add: false });
      g1.fillStyle(0xffffff, 1);
      g1.fillCircle(8, 8, 7);
      // 外圈半透明
      g1.fillStyle(0xffffff, 0.3);
      g1.fillCircle(8, 8, 8);
      g1.generateTexture('particle_soft', 16, 16);
      g1.destroy();
    }

    // 2. 菱形 8×8（锐利碎片）
    if (!scene.textures.exists('particle_sharp')) {
      const g2 = scene.make.graphics({ add: false });
      g2.fillStyle(0xffffff, 1);
      g2.fillTriangle(4, 0, 8, 4, 4, 8);
      g2.fillTriangle(4, 0, 0, 4, 4, 8);
      g2.generateTexture('particle_sharp', 8, 8);
      g2.destroy();
    }

    // 3. 横条 32×4（剑气/速度线）
    if (!scene.textures.exists('particle_streak')) {
      const g3 = scene.make.graphics({ add: false });
      g3.fillStyle(0xffffff, 1);
      g3.fillRoundedRect(0, 0, 32, 4, 2);
      g3.generateTexture('particle_streak', 32, 4);
      g3.destroy();
    }

    // 4. 空心环 24×24（冲击波）
    if (!scene.textures.exists('particle_ring')) {
      const g4 = scene.make.graphics({ add: false });
      g4.lineStyle(2, 0xffffff, 1);
      g4.strokeCircle(12, 12, 10);
      g4.generateTexture('particle_ring', 24, 24);
      g4.destroy();
    }

    // 5. 四角星 12×12（火花）
    if (!scene.textures.exists('particle_spark')) {
      const g5 = scene.make.graphics({ add: false });
      g5.fillStyle(0xffffff, 1);
      // 十字形 + 对角
      g5.fillRect(5, 0, 2, 12); // 竖
      g5.fillRect(0, 5, 12, 2); // 横
      g5.fillRect(4, 4, 4, 4);  // 中心
      g5.generateTexture('particle_spark', 12, 12);
      g5.destroy();
    }

    // 6. 不规则点 6×6（灰尘）
    if (!scene.textures.exists('particle_dust')) {
      const g6 = scene.make.graphics({ add: false });
      g6.fillStyle(0xffffff, 0.8);
      g6.fillCircle(3, 3, 2);
      g6.fillStyle(0xffffff, 0.4);
      g6.fillCircle(3, 3, 3);
      g6.generateTexture('particle_dust', 6, 6);
      g6.destroy();
    }
  }

  // ===== 技能特效 =====

  // 弧形剑气（基础剑法）
  slashArc(x, y, colors = [0x88bbff, 0xccddff]) {
    const emitter = this.scene.add.particles(x, y, 'particle_streak', {
      speed: { min: 120, max: 250 },
      angle: { min: -60, max: 30 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 400,
      quantity: 3,
      frequency: 30,
      tint: colors,
      rotate: { min: -30, max: 30 },
      duration: 200,
    });
    this.scene.time.delayedCall(600, () => emitter.destroy());
    return emitter;
  }

  // 能量波（通天剑法）
  energyWave(x, y, colors = [0xffe066, 0xffffff]) {
    // 主体波浪
    const wave = this.scene.add.particles(x, y, 'particle_soft', {
      speed: { min: 80, max: 200 },
      angle: { min: -40, max: 40 },
      scale: { start: 1.5, end: 0.2 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 600,
      quantity: 5,
      frequency: 40,
      tint: colors,
      duration: 300,
    });
    // 火花
    const sparks = this.scene.add.particles(x, y, 'particle_spark', {
      speed: { min: 150, max: 300 },
      angle: { min: -50, max: 50 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 400,
      quantity: 2,
      frequency: 50,
      tint: colors[0],
      duration: 300,
    });
    this.scene.time.delayedCall(800, () => { wave.destroy(); sparks.destroy(); });
  }

  // 径向爆发（双涡轮增压/通用）
  radialBurst(x, y, colors = [0xff4444, 0xff8844], count = 30) {
    const emitter = this.scene.add.particles(x, y, 'particle_soft', {
      speed: { min: 100, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.0, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 500,
      quantity: count,
      frequency: -1, // 单次爆发
      tint: colors,
    });
    // 冲击环
    const ring = this.scene.add.particles(x, y, 'particle_ring', {
      speed: 0,
      scale: { start: 0.5, end: 3 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 400,
      quantity: 1,
      frequency: -1,
      tint: colors[0],
    });
    this.scene.time.delayedCall(600, () => { emitter.destroy(); ring.destroy(); });
  }

  // 冲击环（受击反馈）
  impactRing(x, y, color = 0xffffff) {
    const emitter = this.scene.add.particles(x, y, 'particle_ring', {
      speed: 0,
      scale: { start: 0.3, end: 2.5 },
      alpha: { start: 0.7, end: 0 },
      lifespan: 350,
      quantity: 1,
      frequency: -1,
      tint: color,
    });
    this.scene.time.delayedCall(400, () => emitter.destroy());
  }

  // 上升火花（治疗/增益）
  risingSparks(x, y, color = 0x66ff99, duration = 500) {
    const emitter = this.scene.add.particles(x, y, 'particle_spark', {
      speed: { min: 30, max: 80 },
      angle: { min: -100, max: -80 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: duration,
      quantity: 2,
      frequency: 60,
      tint: color,
      duration: duration,
    });
    this.scene.time.delayedCall(duration + 200, () => emitter.destroy());
  }

  // 地面扬尘（攻击落地）
  dustCloud(x, y) {
    const emitter = this.scene.add.particles(x, y, 'particle_dust', {
      speed: { min: 20, max: 60 },
      angle: { min: -150, max: -30 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 0.4, end: 0 },
      lifespan: 400,
      quantity: 8,
      frequency: -1,
      tint: 0x8a8a7a,
    });
    this.scene.time.delayedCall(500, () => emitter.destroy());
  }

  // 残影效果（冲刺时的半透明拖影）
  afterimage(sprite, count = 3, interval = 40) {
    for (let i = 0; i < count; i++) {
      this.scene.time.delayedCall(i * interval, () => {
        const ghost = this.scene.add.sprite(sprite.x, sprite.y, sprite.texture.key, sprite.frame.name);
        ghost.setScale(sprite.scaleX, sprite.scaleY);
        ghost.setFlipX(sprite.flipX);
        ghost.setAlpha(0.4 - i * 0.1);
        ghost.setTint(0x4488ff);
        this.scene.tweens.add({
          targets: ghost,
          alpha: 0,
          duration: 200,
          onComplete: () => ghost.destroy(),
        });
      });
    }
  }

  // ===== 大气粒子 =====

  // 慢速飘浮尘粒（战斗/剧情背景）
  atmosphericDust(width = 960, height = 540) {
    const emitter = this.scene.add.particles(0, 0, 'particle_dust', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      speed: { min: 5, max: 15 },
      angle: { min: -120, max: -60 },
      scale: { min: 0.5, max: 1.5 },
      alpha: { min: 0.1, max: 0.25 },
      lifespan: { min: 4000, max: 8000 },
      quantity: 1,
      frequency: 300,
      tint: 0x8888aa,
    });
    return emitter;
  }

  // 萤火虫（标题画面）
  fireflies(width = 960, height = 540) {
    const emitter = this.scene.add.particles(0, 0, 'particle_soft', {
      x: { min: 50, max: width - 50 },
      y: { min: 100, max: height - 50 },
      speed: { min: 3, max: 12 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.4, end: 0.1 },
      alpha: { start: 0, end: 0.6, ease: 'Sine.easeInOut' },
      lifespan: { min: 3000, max: 6000 },
      quantity: 1,
      frequency: 400,
      tint: [0xffe4a0, 0xd4a843, 0xffcc66],
    });
    return emitter;
  }

  // 按技能 ID 自动选择特效
  playSkillEffect(x, y, skillId) {
    const config = SKILL_VFX[skillId] || SKILL_VFX.default;

    switch (config.shape) {
      case 'arc':
        this.slashArc(x, y, config.colors);
        break;
      case 'wave':
        this.energyWave(x, y, config.colors);
        break;
      case 'burst':
        this.radialBurst(x, y, config.colors, config.particles);
        break;
      case 'rise':
        this.risingSparks(x, y, config.colors[0], config.duration);
        break;
      case 'radial':
      default:
        this.radialBurst(x, y, config.colors, config.particles);
        break;
    }
  }
}
