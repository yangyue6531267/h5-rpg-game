// ===== GlassPanel：毛玻璃面板工厂 =====

import { COLORS, FONTS, GLASS } from '../config/theme.js';

export class GlassPanel {
  // 创建毛玻璃面板容器
  static create(scene, x, y, width, height, options = {}) {
    const container = scene.add.container(x, y);
    const accentColor = options.accentColor || GLASS.borderGradientTop;
    const accentStr = options.accentStr || '#d4a843';

    // 1. 渐变填充背景
    const bg = scene.add.graphics();
    bg.fillStyle(GLASS.fillBottom, GLASS.bgAlpha);
    bg.fillRect(-width / 2, -height / 2, width, height);
    // 上半渐变叠加
    bg.fillStyle(GLASS.fillTop, GLASS.bgAlpha * 0.5);
    bg.fillRect(-width / 2, -height / 2, width, height / 2);
    container.add(bg);

    // 2. 噪点覆盖（如果纹理存在）
    if (scene.textures.exists('glass_noise')) {
      const noise = scene.add.tileSprite(
        0, 0, width, height, 'glass_noise'
      ).setAlpha(GLASS.noiseAlpha);
      container.add(noise);
    }

    // 3. 边框
    const border = scene.add.graphics();
    border.lineStyle(2, GLASS.borderGradientBottom, GLASS.borderAlpha);
    border.strokeRect(-width / 2, -height / 2, width, height);
    container.add(border);

    // 4. 顶部高光线
    const highlight = scene.add.graphics();
    highlight.lineStyle(1, accentColor, GLASS.highlightAlpha);
    highlight.beginPath();
    highlight.moveTo(-width / 2 + 4, -height / 2);
    highlight.lineTo(width / 2 - 4, -height / 2);
    highlight.strokePath();
    container.add(highlight);

    // 5. 角落高光点
    const corners = scene.add.graphics();
    corners.fillStyle(accentColor, 0.3);
    corners.fillRect(-width / 2, -height / 2, 3, 3);
    corners.fillRect(width / 2 - 3, -height / 2, 3, 3);
    corners.fillStyle(accentColor, 0.15);
    corners.fillRect(-width / 2, height / 2 - 3, 3, 3);
    corners.fillRect(width / 2 - 3, height / 2 - 3, 3, 3);
    container.add(corners);

    // 6. 内发光（上边缘向下渐隐）
    const innerGlow = scene.add.graphics();
    for (let i = 0; i < 6; i++) {
      const alpha = GLASS.highlightAlpha * (1 - i / 6) * 0.5;
      innerGlow.fillStyle(accentColor, alpha);
      innerGlow.fillRect(-width / 2 + 1, -height / 2 + i, width - 2, 1);
    }
    container.add(innerGlow);

    return {
      container,
      bg,
      border,
      width,
      height,
      // 设置内容区域偏移
      getContentOffset() {
        return { x: -width / 2 + 15, y: -height / 2 + 15 };
      }
    };
  }

  // 创建毛玻璃按钮
  static createButton(scene, x, y, width, height, text, callback, options = {}) {
    const container = scene.add.container(x, y);
    const color = options.color || COLORS.textMain;
    const hoverColor = options.hoverColor || COLORS.goldStr;
    const fontSize = options.fontSize || FONTS.size.sm;

    // 背景
    const bg = scene.add.graphics();
    bg.fillStyle(GLASS.fillBottom, 0.8);
    bg.fillRect(-width / 2, -height / 2, width, height);
    bg.lineStyle(1, GLASS.borderGradientBottom, 0.5);
    bg.strokeRect(-width / 2, -height / 2, width, height);
    container.add(bg);

    // 顶部微光
    const topLine = scene.add.graphics();
    topLine.lineStyle(1, GLASS.borderGradientTop, 0.1);
    topLine.beginPath();
    topLine.moveTo(-width / 2 + 2, -height / 2);
    topLine.lineTo(width / 2 - 2, -height / 2);
    topLine.strokePath();
    container.add(topLine);

    // 文字
    const txt = scene.add.text(0, 0, text, {
      fontFamily: FONTS.main,
      fontSize: fontSize,
      color: color,
    }).setOrigin(0.5);
    container.add(txt);

    // 描述文字（可选）
    if (options.desc) {
      const desc = scene.add.text(0, height / 2 - 8, options.desc, {
        fontFamily: FONTS.main,
        fontSize: 10,
        color: COLORS.textDim,
      }).setOrigin(0.5, 1);
      container.add(desc);
    }

    // 交互
    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    // hover 发光效果
    const hoverGlow = scene.add.graphics();
    hoverGlow.fillStyle(GLASS.cornerAccent, 0.08);
    hoverGlow.fillRect(-width / 2, -height / 2, width, height);
    hoverGlow.setVisible(false);
    container.add(hoverGlow);

    container.on('pointerover', () => {
      hoverGlow.setVisible(true);
      bg.clear();
      bg.fillStyle(GLASS.fillTop, 0.85);
      bg.fillRect(-width / 2, -height / 2, width, height);
      bg.lineStyle(1, GLASS.borderGradientTop, 0.6);
      bg.strokeRect(-width / 2, -height / 2, width, height);
      txt.setColor(hoverColor);
    });

    container.on('pointerout', () => {
      hoverGlow.setVisible(false);
      bg.clear();
      bg.fillStyle(GLASS.fillBottom, 0.8);
      bg.fillRect(-width / 2, -height / 2, width, height);
      bg.lineStyle(1, GLASS.borderGradientBottom, 0.5);
      bg.strokeRect(-width / 2, -height / 2, width, height);
      txt.setColor(color);
    });

    container.on('pointerdown', () => {
      // 按下缩放效果
      scene.tweens.add({
        targets: container,
        scaleX: 0.95, scaleY: 0.95,
        duration: 50,
        yoyo: true,
        onComplete: () => callback()
      });
    });

    return container;
  }
}
