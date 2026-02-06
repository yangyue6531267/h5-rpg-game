// ===== PostFXManager：摄像机后处理管理 =====

import { POSTFX_PRESETS } from '../config/theme.js';

export class PostFXManager {
  constructor(scene) {
    this.scene = scene;
    this.bloom = null;
    this.vignette = null;
    this.enabled = true;
  }

  // 从预设应用 bloom + vignette
  applyPreset(presetName) {
    if (!this.enabled) return;

    const preset = POSTFX_PRESETS[presetName];
    if (!preset) return;

    const camera = this.scene.cameras.main;
    if (!camera.postFX) return;

    this.clearAll();

    if (preset.bloom) {
      this.bloom = camera.postFX.addBloom(
        0xffffff,
        1,    // offsetX
        1,    // offsetY
        preset.bloom.blurStrength,
        preset.bloom.strength,
        preset.bloom.threshold
      );
    }

    if (preset.vignette) {
      this.vignette = camera.postFX.addVignette(
        0.5, 0.5,
        preset.vignette.radius,
        preset.vignette.strength
      );
    }
  }

  // 暴击/技能释放时泛光脉冲
  pulseBloom(duration = 300, peakStrength = 1.2) {
    if (!this.bloom || !this.enabled) return;

    const original = this.bloom.strength;
    this.scene.tweens.add({
      targets: this.bloom,
      strength: peakStrength,
      duration: duration * 0.3,
      ease: 'Quad.easeOut',
      yoyo: true,
      hold: duration * 0.1,
      onComplete: () => {
        if (this.bloom) this.bloom.strength = original;
      }
    });
  }

  // 暗角加深脉冲（Boss 阶段切换等）
  pulseVignette(duration = 400, peakStrength = 0.6) {
    if (!this.vignette || !this.enabled) return;

    const original = this.vignette.strength;
    this.scene.tweens.add({
      targets: this.vignette,
      strength: peakStrength,
      duration: duration * 0.4,
      ease: 'Quad.easeOut',
      yoyo: true,
      onComplete: () => {
        if (this.vignette) this.vignette.strength = original;
      }
    });
  }

  // 设置 bloom 强度
  setBloomStrength(value) {
    if (this.bloom) this.bloom.strength = value;
  }

  // 清除所有后处理
  clearAll() {
    const camera = this.scene.cameras.main;
    if (camera.postFX) {
      camera.postFX.clear();
    }
    this.bloom = null;
    this.vignette = null;
  }

  // 根据画质设置启用/禁用
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.clearAll();
  }
}
