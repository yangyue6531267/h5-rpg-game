// ===== HD2DBar：增强血条/灵力条组件 =====

import { COLORS, FONTS, GLOW_COLORS } from '../config/theme.js';

export class HD2DBar {
  // 创建增强血条
  static create(scene, x, y, width, height, options = {}) {
    const barColor = options.barColor || COLORS.hpBar;
    const glowColor = options.glowColor || GLOW_COLORS.redGlow;
    const label = options.label || '';
    const container = scene.add.container(x, y);

    // 背景（深色圆角感）
    const bg = scene.add.graphics();
    bg.fillStyle(0x1a1a2a, 0.9);
    bg.fillRoundedRect(0, 0, width, height, 2);
    bg.lineStyle(1, 0x3a3a4a, 0.4);
    bg.strokeRoundedRect(0, 0, width, height, 2);
    container.add(bg);

    // 填充条
    const fill = scene.add.graphics();
    container.add(fill);

    // 顶部高光线（1px 白色半透明）
    const topHighlight = scene.add.graphics();
    container.add(topHighlight);

    // 发光层（值变化时脉冲）
    const glowLayer = scene.add.graphics();
    glowLayer.setAlpha(0);
    container.add(glowLayer);

    // 标签文字
    let labelText = null;
    if (label) {
      labelText = scene.add.text(-30, height / 2, label, {
        fontFamily: FONTS.main,
        fontSize: 10,
        color: COLORS.textDim,
      }).setOrigin(1, 0.5);
      container.add(labelText);
    }

    // 数值文字
    const valueText = scene.add.text(width + 5, height / 2, '', {
      fontFamily: FONTS.main,
      fontSize: 10,
      color: options.textColor || COLORS.textDim,
    }).setOrigin(0, 0.5);
    container.add(valueText);

    let currentRatio = 1;
    let lowHpPulsing = false;

    // 绘制填充条
    function drawFill(ratio) {
      fill.clear();
      const fw = Math.max(0, width * ratio);
      if (fw <= 0) return;

      // 渐变填充（左亮右暗）
      const bright = barColor;
      const dark = Phaser.Display.Color.IntegerToColor(barColor);
      const darkColor = Phaser.Display.Color.GetColor(
        Math.floor(dark.red * 0.6),
        Math.floor(dark.green * 0.6),
        Math.floor(dark.blue * 0.6)
      );

      fill.fillStyle(bright, 1);
      fill.fillRoundedRect(0, 0, fw, height, 2);

      // 右侧暗化叠加
      fill.fillStyle(darkColor, 0.3);
      fill.fillRoundedRect(fw * 0.6, 0, fw * 0.4, height, 2);

      // 顶部高光
      topHighlight.clear();
      topHighlight.fillStyle(0xffffff, 0.2);
      topHighlight.fillRect(1, 1, Math.max(0, fw - 2), 1);
    }

    function drawGlow(ratio) {
      glowLayer.clear();
      const fw = width * ratio;
      glowLayer.fillStyle(glowColor, 0.3);
      glowLayer.fillRoundedRect(-1, -1, fw + 2, height + 2, 3);
    }

    // 初始绘制
    drawFill(1);

    return {
      container,
      valueText,

      // 设置值（带动画）
      setValue(ratio, current, max) {
        const prevRatio = currentRatio;
        currentRatio = Math.max(0, Math.min(1, ratio));

        // 更新数值文字
        if (current !== undefined && max !== undefined) {
          valueText.setText(`${current}/${max}`);
        }

        // 动画过渡
        const tweenObj = { r: prevRatio };
        scene.tweens.add({
          targets: tweenObj,
          r: currentRatio,
          duration: 300,
          ease: 'Power2',
          onUpdate: () => {
            drawFill(tweenObj.r);
          }
        });

        // 值变化时发光脉冲
        if (Math.abs(prevRatio - currentRatio) > 0.01) {
          drawGlow(currentRatio);
          glowLayer.setAlpha(0.8);
          scene.tweens.add({
            targets: glowLayer,
            alpha: 0,
            duration: 400,
            ease: 'Quad.easeOut'
          });
        }

        // 低血量红色闪烁
        if (currentRatio < 0.25 && !lowHpPulsing && options.barColor === COLORS.hpBar) {
          lowHpPulsing = true;
          scene.tweens.add({
            targets: fill,
            alpha: { from: 1, to: 0.5 },
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        } else if (currentRatio >= 0.25 && lowHpPulsing) {
          lowHpPulsing = false;
          scene.tweens.killTweensOf(fill);
          fill.setAlpha(1);
        }
      },

      // 直接设置（无动画）
      setValueImmediate(ratio, current, max) {
        currentRatio = Math.max(0, Math.min(1, ratio));
        drawFill(currentRatio);
        if (current !== undefined && max !== undefined) {
          valueText.setText(`${current}/${max}`);
        }
      }
    };
  }
}
