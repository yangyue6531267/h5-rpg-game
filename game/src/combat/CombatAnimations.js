// ===== CombatAnimations：战斗动画编排 =====

import { COLORS } from '../config/theme.js';

export class CombatAnimations {
  constructor(scene) {
    this.scene = scene;
  }

  // 攻击动画：角色冲锋 → 返回
  async playerAttack(playerSprite, enemySprite) {
    return new Promise(resolve => {
      const origX = playerSprite.x;
      this.scene.tweens.add({
        targets: playerSprite,
        x: enemySprite.x + 80,
        duration: 200,
        ease: 'Power2',
        onComplete: () => {
          this.scene.tweens.add({
            targets: playerSprite,
            x: origX,
            duration: 300,
            ease: 'Power2',
            onComplete: resolve
          });
        }
      });
    });
  }

  // 敌人攻击动画
  async enemyAttack(enemySprite, playerSprite) {
    return new Promise(resolve => {
      const origX = enemySprite.x;
      this.scene.tweens.add({
        targets: enemySprite,
        x: playerSprite.x - 80,
        duration: 200,
        ease: 'Power2',
        onComplete: () => {
          this.scene.tweens.add({
            targets: enemySprite,
            x: origX,
            duration: 300,
            ease: 'Power2',
            onComplete: resolve
          });
        }
      });
    });
  }

  // 受伤闪白 + 震动
  async hitEffect(sprite) {
    return new Promise(resolve => {
      const origX = sprite.x;
      sprite.setTintFill(0xffffff);
      this.scene.time.delayedCall(80, () => {
        sprite.clearTint();
      });

      // 震动
      this.scene.tweens.add({
        targets: sprite,
        x: origX + 5,
        duration: 40,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          sprite.x = origX;
          resolve();
        }
      });
    });
  }

  // 浮动伤害数字
  showDamage(x, y, amount, isCrit, isHeal = false) {
    const color = isHeal ? COLORS.greenStr : (isCrit ? COLORS.goldStr : '#ffffff');
    const fontSize = isCrit ? 28 : 20;
    const prefix = isHeal ? '+' : '-';

    const txt = this.scene.add.text(x, y, `${prefix}${amount}`, {
      fontFamily: "'Noto Serif SC', serif",
      fontSize: fontSize,
      color: color,
      fontStyle: isCrit ? 'bold' : 'normal',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    if (isCrit) {
      const critLabel = this.scene.add.text(x, y - 20, '暴击!', {
        fontFamily: "'Noto Serif SC', serif",
        fontSize: 14,
        color: COLORS.goldStr,
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);

      this.scene.tweens.add({
        targets: critLabel,
        y: y - 50,
        alpha: 0,
        duration: 1000,
        onComplete: () => critLabel.destroy()
      });
    }

    this.scene.tweens.add({
      targets: txt,
      y: y - 40,
      alpha: 0,
      duration: 1200,
      ease: 'Power2',
      onComplete: () => txt.destroy()
    });
  }

  // 以伤换伤特殊演出
  async tradeHPSequence(playerSprite, enemySprite) {
    return new Promise(resolve => {
      // 红色闪屏
      const flash = this.scene.add.rectangle(
        this.scene.cameras.main.centerX,
        this.scene.cameras.main.centerY,
        this.scene.cameras.main.width,
        this.scene.cameras.main.height,
        0xff0000, 0.3
      );
      this.scene.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 500,
        onComplete: () => flash.destroy()
      });

      // 角色发光
      playerSprite.setTint(0xff6644);
      this.scene.time.delayedCall(300, () => {
        playerSprite.clearTint();
        resolve();
      });
    });
  }

  // 技能特效（粒子）
  skillEffect(x, y, skillType) {
    // 简单粒子效果
    const colors = {
      'attack': [0x4a7ab5, 0x88bbff],
      'double_turbo': [0xff4444, 0xff8844],
      'default': [0xd4a843, 0xffee88]
    };
    const tint = colors[skillType] || colors.default;

    // 创建粒子纹理（如果不存在）
    if (!this.scene.textures.exists('skill_particle')) {
      const gfx = this.scene.add.graphics();
      gfx.fillStyle(0xffffff);
      gfx.fillCircle(4, 4, 4);
      gfx.generateTexture('skill_particle', 8, 8);
      gfx.destroy();
    }

    this.scene.add.particles(x, y, 'skill_particle', {
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 600,
      quantity: 12,
      tint: tint,
      emitting: false
    }).explode(12);
  }

  // Boss阶段切换效果
  bossPhaseEffect() {
    this.scene.cameras.main.shake(300, 0.01);
  }

  // 死亡效果
  async deathEffect(sprite) {
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: sprite,
        alpha: 0,
        y: sprite.y + 20,
        duration: 800,
        ease: 'Power2',
        onComplete: resolve
      });
    });
  }

  // 屏幕震动
  screenShake() {
    this.scene.cameras.main.shake(200, 0.008);
  }
}
