// ===== HD-2D 增强战斗动画 =====

import { COLORS, SKILL_VFX } from '../config/theme.js';

export class HD2DCombatAnimations {
  constructor(scene, particleLib, postFXManager) {
    this.scene = scene;
    this.particles = particleLib;
    this.postFX = postFXManager;
  }

  // 安全播放动画：只有当动画确实注册过时才调用 play
  _safePlay(sprite, animKey) {
    try {
      if (sprite && sprite.play && animKey && this.scene.anims.exists(animKey)) {
        sprite.play(animKey);
      }
    } catch (e) {
      // 忽略 —— 使用自定义贴图时无动画，这是正常的
    }
  }

  // 玩家攻击：蓄力回拉→残影冲刺→落地扬尘→弹性返回
  async playerAttack(playerSprite, enemySprite) {
    const origX = playerSprite.x;
    const origY = playerSprite.y;
    const targetX = enemySprite.x + 80;

    // 播放攻击动画（仅程序生成的角色有 spritesheet 动画）
    const key = playerSprite.texture?.key;
    this._safePlay(playerSprite, `${key}_attack`);

    // 1. 蓄力回拉
    await this._tween(playerSprite, { x: origX + 10 }, 80, 'Quad.easeIn');

    // 2. 残影冲刺
    if (this.particles) {
      this.particles.afterimage(playerSprite, 3, 30);
    }
    await this._tween(playerSprite, { x: targetX }, 120, 'Power3');

    // 3. 落地扬尘
    if (this.particles) {
      this.particles.dustCloud(targetX, origY + 30);
    }

    // 4. 短暂停顿
    await this._delay(80);

    // 5. 弹性返回
    await this._tween(playerSprite, { x: origX }, 250, 'Back.easeOut');

    // 恢复 idle
    this._safePlay(playerSprite, `${key}_idle`);
  }

  // 敌人攻击：镜像版本
  async enemyAttack(enemySprite, playerSprite) {
    const origX = enemySprite.x;
    const origY = enemySprite.y;
    const targetX = playerSprite.x - 80;

    const key = enemySprite.texture?.key;

    // 眼睛闪红预警
    if (enemySprite.setTint) {
      enemySprite.setTint(0xff4444);
      await this._delay(150);
      enemySprite.clearTint();
    }

    this._safePlay(enemySprite, `${key}_attack`);

    await this._tween(enemySprite, { x: origX - 10 }, 80, 'Quad.easeIn');

    if (this.particles) {
      this.particles.afterimage(enemySprite, 2, 40);
    }
    await this._tween(enemySprite, { x: targetX }, 130, 'Power3');

    if (this.particles) {
      this.particles.dustCloud(targetX, origY + 30);
    }
    await this._delay(80);

    await this._tween(enemySprite, { x: origX }, 250, 'Back.easeOut');

    this._safePlay(enemySprite, `${key}_idle`);
  }

  // 受击效果：白闪→色散→冲击环→微缩放→bloom脉冲
  async hitEffect(sprite) {
    // 1. 白闪
    if (sprite.setTintFill) {
      sprite.setTintFill(0xffffff);
      await this._delay(60);
      sprite.clearTint();
    }

    // 2. 震动（含 Y 分量）
    const origX = sprite.x;
    const origY = sprite.y;
    for (let i = 0; i < 4; i++) {
      const dx = (i % 2 === 0 ? 1 : -1) * (6 - i);
      const dy = (i % 2 === 0 ? -1 : 1) * 2;
      sprite.x = origX + dx;
      sprite.y = origY + dy;
      await this._delay(35);
    }
    sprite.x = origX;
    sprite.y = origY;

    // 3. 冲击环粒子
    if (this.particles) {
      this.particles.impactRing(sprite.x, sprite.y, 0xffffff);
    }

    // 4. 微缩放脉冲
    this.scene.tweens.add({
      targets: sprite,
      scaleX: sprite.scaleX * 1.05,
      scaleY: sprite.scaleY * 1.05,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeOut'
    });

    // 5. Bloom 脉冲
    if (this.postFX) {
      this.postFX.pulseBloom(200, 1.0);
    }
  }

  // 浮动伤害数字：弹出缩放→外发光→弧形飘动
  showDamage(x, y, amount, isCrit = false, isHeal = false) {
    const color = isHeal ? COLORS.greenStr :
                  isCrit ? COLORS.dmgCrit :
                  COLORS.dmgNormal;
    const fontSize = isCrit ? 28 : (isHeal ? 18 : 20);
    const prefix = isHeal ? '+' : '';
    const text = `${prefix}${amount}`;

    // 外发光层（较大、半透明）
    const glow = this.scene.add.text(x, y, text, {
      fontFamily: "'Noto Serif SC', serif",
      fontSize: fontSize + 6,
      fontStyle: isCrit ? 'bold' : 'normal',
      color: color,
      stroke: color,
      strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0.4).setScale(0);

    // 主体文字
    const txt = this.scene.add.text(x, y, text, {
      fontFamily: "'Noto Serif SC', serif",
      fontSize: fontSize,
      fontStyle: isCrit ? 'bold' : 'normal',
      color: color,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setScale(0);

    // 弹出缩放
    this.scene.tweens.add({
      targets: [txt, glow],
      scale: { from: 0, to: isCrit ? 1.3 : 1.0 },
      duration: 120,
      ease: 'Back.easeOut',
      onComplete: () => {
        // 缩回正常
        if (isCrit) {
          this.scene.tweens.add({
            targets: [txt, glow],
            scale: 1.0,
            duration: 100,
          });
        }
      }
    });

    // 弧形飘动（带 sin X 偏移）
    const driftX = (Math.random() - 0.5) * 30;
    this.scene.tweens.add({
      targets: [txt, glow],
      y: y - 50,
      x: x + driftX,
      alpha: 0,
      duration: 1400,
      delay: 200,
      ease: 'Quad.easeOut',
      onComplete: () => { txt.destroy(); glow.destroy(); }
    });

    // 暴击火花粒子
    if (isCrit && this.particles) {
      this.particles.risingSparks(x, y, 0xffd700, 600);
    }

    // 暴击标签
    if (isCrit) {
      const critLabel = this.scene.add.text(x, y - 20, '暴击!', {
        fontFamily: "'Noto Serif SC', serif",
        fontSize: 14,
        fontStyle: 'bold',
        color: '#ffd700',
        stroke: '#000',
        strokeThickness: 2,
      }).setOrigin(0.5).setAlpha(0);

      this.scene.tweens.add({
        targets: critLabel,
        alpha: 1, y: y - 40,
        duration: 200,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.scene.tweens.add({
            targets: critLabel,
            alpha: 0, y: y - 60,
            duration: 600,
            delay: 400,
            onComplete: () => critLabel.destroy()
          });
        }
      });
    }
  }

  // 技能特效：按技能分配独立粒子效果
  skillEffect(x, y, skillId) {
    if (this.particles) {
      this.particles.playSkillEffect(x, y, skillId);
    }

    // 技能闪光
    const config = SKILL_VFX[skillId] || SKILL_VFX.default;
    if (this.postFX) {
      this.postFX.pulseBloom(config.duration * 0.5, 0.9);
    }
  }

  // 以伤换伤：红色能量汇聚→火焰光环→红色暗角
  async tradeHPSequence(playerSprite, enemySprite) {
    const cx = playerSprite.x;
    const cy = playerSprite.y;

    // 1. 红色闪屏
    const flash = this.scene.add.rectangle(
      480, 270, 960, 540, 0xff0000, 0.25
    );
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy()
    });

    // 2. 玩家红色光环
    if (playerSprite.setTint) {
      playerSprite.setTint(0xff4422);
    }

    // 3. 红色能量粒子汇聚到玩家
    if (this.particles) {
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const startX = cx + Math.cos(angle) * 100;
        const startY = cy + Math.sin(angle) * 80;
        const particle = this.scene.add.circle(startX, startY, 3, 0xff4444, 0.8);
        this.scene.tweens.add({
          targets: particle,
          x: cx, y: cy,
          alpha: 0,
          scale: 0.2,
          duration: 400,
          delay: i * 40,
          ease: 'Quad.easeIn',
          onComplete: () => particle.destroy()
        });
      }
    }

    // 4. 暗角加深
    if (this.postFX) {
      this.postFX.pulseVignette(600, 0.55);
    }

    await this._delay(500);

    // 5. 清除红色
    if (playerSprite.clearTint) {
      playerSprite.clearTint();
    }

    // 6. 蓄力文字
    const powerText = this.scene.add.text(cx, cy - 50, '以伤换伤', {
      fontFamily: "'Noto Serif SC', serif",
      fontSize: 18,
      fontStyle: 'bold',
      color: '#ff4444',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);

    this.scene.tweens.add({
      targets: powerText,
      alpha: 1, y: cy - 65,
      duration: 300,
      onComplete: () => {
        this.scene.tweens.add({
          targets: powerText,
          alpha: 0, y: cy - 80,
          duration: 500,
          delay: 500,
          onComplete: () => powerText.destroy()
        });
      }
    });
  }

  // 死亡特效：白闪→灰度化→粒子溶解→缩小消失
  async deathEffect(sprite) {
    // 1. 白闪
    if (sprite.setTintFill) {
      sprite.setTintFill(0xffffff);
      await this._delay(100);
      sprite.clearTint();
    }

    // 2. 灰度化（用深色 tint 模拟）
    if (sprite.setTint) {
      sprite.setTint(0x666666);
    }

    // 3. 粒子溶解（从 sprite 位置向上散开）
    if (this.particles && this.scene.textures.exists('particle_dust')) {
      const emitter = this.scene.add.particles(sprite.x, sprite.y, 'particle_dust', {
        speed: { min: 20, max: 60 },
        angle: { min: -130, max: -50 },
        scale: { start: 1.5, end: 0 },
        alpha: { start: 0.6, end: 0 },
        lifespan: { min: 600, max: 1200 },
        quantity: 20,
        frequency: -1,
        tint: 0x888888,
      });
      this.scene.time.delayedCall(1300, () => emitter.destroy());
    }

    // 4. 淡出+缩小
    await new Promise(resolve => {
      this.scene.tweens.add({
        targets: sprite,
        alpha: 0,
        scaleX: sprite.scaleX * 0.3,
        scaleY: sprite.scaleY * 0.3,
        y: sprite.y + 15,
        duration: 1000,
        ease: 'Power2',
        onComplete: resolve
      });
    });
  }

  // Boss 阶段切换特效
  bossPhaseEffect() {
    // 1. 闪屏
    const flash = this.scene.add.rectangle(480, 270, 960, 540, 0xff2222, 0.3);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 400,
      onComplete: () => flash.destroy()
    });

    // 2. 重震
    this.scene.cameras.main.shake(500, 0.015);

    // 3. Bloom 激增
    if (this.postFX) {
      this.postFX.pulseBloom(400, 1.5);
      this.postFX.pulseVignette(500, 0.5);
    }
  }

  // 屏幕震动
  screenShake() {
    this.scene.cameras.main.shake(200, 0.01);
  }

  // ===== 工具方法 =====

  _tween(target, props, duration, ease = 'Power2') {
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: target,
        ...props,
        duration,
        ease,
        onComplete: resolve
      });
    });
  }

  _delay(ms) {
    return new Promise(resolve => this.scene.time.delayedCall(ms, resolve));
  }
}
