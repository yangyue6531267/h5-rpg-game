// ===== LightingSystem：Phaser Lights2D 动态光照管理 =====

export class LightingSystem {
  constructor(scene) {
    this.scene = scene;
    this.pointLights = [];
    this.enabled = true;
  }

  // 场景环境光色
  static AMBIENT = {
    combat: 0x404060,
    story: 0x605040,
    title: 0x302040,
    menu: 0x404050,
  };

  // 启用场景灯光
  enableLighting(sceneType = 'combat') {
    if (!this.enabled) return;

    try {
      this.scene.lights.enable();
      const ambient = LightingSystem.AMBIENT[sceneType] || 0x404060;
      this.scene.lights.setAmbientColor(ambient);
    } catch (e) {
      // Lights2D 不可用时静默降级
      this.enabled = false;
    }
  }

  // 为角色/怪物添加点光源
  addCharacterLight(sprite, color = 0xffffff, radius = 120, intensity = 0.6) {
    if (!this.enabled) return null;

    try {
      const light = this.scene.lights.addLight(
        sprite.x, sprite.y + 20, // 脚下偏移
        radius,
        color,
        intensity
      );
      this.pointLights.push({ light, sprite, offsetY: 20 });

      // 尝试为 sprite 设置 Light2D 管线
      if (sprite.setPipeline) {
        sprite.setPipeline('Light2D');
      }

      return light;
    } catch (e) {
      return null;
    }
  }

  // 技能释放闪光（临时高亮点光源）
  addSkillFlash(x, y, color = 0xffffff, radius = 200, duration = 400) {
    if (!this.enabled) return;

    try {
      const light = this.scene.lights.addLight(x, y, radius, color, 1.5);

      this.scene.tweens.add({
        targets: light,
        intensity: 0,
        radius: radius * 0.5,
        duration: duration,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.scene.lights.removeLight(light);
        }
      });
    } catch (e) {
      // 静默降级
    }
  }

  // 同步光源位置到 sprite 位置（在 update 中调用）
  update() {
    if (!this.enabled) return;

    for (const entry of this.pointLights) {
      if (entry.sprite && entry.light) {
        entry.light.x = entry.sprite.x;
        entry.light.y = entry.sprite.y + entry.offsetY;
      }
    }
  }

  // 设置环境光色
  setAmbientColor(color) {
    if (!this.enabled) return;
    try {
      this.scene.lights.setAmbientColor(color);
    } catch (e) {
      // 静默
    }
  }

  // 清理所有光源
  destroy() {
    for (const entry of this.pointLights) {
      try {
        this.scene.lights.removeLight(entry.light);
      } catch (e) {
        // 静默
      }
    }
    this.pointLights = [];
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.destroy();
  }
}
