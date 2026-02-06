// ===== HD-2D 等距像素风角色 Sprite 生成器 =====
// 128×128 帧，15 帧/实体，5 级光影，3/4 等距视角

import { CharactersData } from '../data/characters.js';
import { MonstersData } from '../data/monsters.js';
import { SHADING } from '../config/theme.js';

// ===== 调色板 =====
const CHAR_PALETTES = {
  chen_dao: {
    skin: '#e2bc98', hair: '#1f1f24', robe: '#33476d',
    accent: '#8a5ab5', eye: '#1f1f1f', belt: '#d4a843',
    inner: '#4a5878', pattern: '#2a3856'
  },
  su_lingyun: {
    skin: '#edc5a8', hair: '#46212a', robe: '#8b2437',
    accent: '#d4a843', eye: '#3a2323', belt: '#d4a843',
    inner: '#a83848', pattern: '#6e1828'
  },
  qing_he: {
    skin: '#ebc8a8', hair: '#1d2a20', robe: '#254b37',
    accent: '#7fa24e', eye: '#243224', belt: '#7fa24e',
    inner: '#2e5a42', pattern: '#1a3c28'
  },
  yang_youwei: {
    skin: '#f0cfb2', hair: '#3e3658', robe: '#4a5da0',
    accent: '#f0ece0', eye: '#29283a', belt: '#d4a843',
    inner: '#5a6cb0', pattern: '#3a4d80'
  },
  wang_daoyuan: {
    skin: '#d3ad89', hair: '#3c2f2a', robe: '#6a4d37',
    accent: '#d4a843', eye: '#2a201c', belt: '#d4a843',
    inner: '#7a5d47', pattern: '#5a3d27'
  },
  liu_changqing: {
    skin: '#c8a88a', hair: '#2d2d2d', robe: '#442b2b',
    accent: '#c43e3e', eye: '#1b1b1b', belt: '#c43e3e',
    inner: '#543838', pattern: '#341818'
  },
  zhang_xiaobao: {
    skin: '#e2bc98', hair: '#2b2520', robe: '#3d5a4a',
    accent: '#6a9a5a', eye: '#2a2a2a', belt: '#6a9a5a',
    inner: '#4d6a5a', pattern: '#2d4a3a'
  },
  zhao_jingxing: {
    skin: '#d3a880', hair: '#1a1a1a', robe: '#5a2020',
    accent: '#c43e3e', eye: '#1a1a1a', belt: '#7f2d2d',
    inner: '#6a3030', pattern: '#4a1515'
  }
};

const DEFAULT_PALETTE = {
  skin: '#e5c2a4', hair: '#2b2b33', robe: '#2c3b5f',
  accent: '#d4a843', eye: '#2a2a2a', belt: '#d4a843',
  inner: '#3c4b6f', pattern: '#1c2b4f'
};

// ===== 颜色工具 =====
function hexToRgb(hex) {
  const c = hex.replace('#', '');
  return {
    r: parseInt(c.substring(0, 2), 16),
    g: parseInt(c.substring(2, 4), 16),
    b: parseInt(c.substring(4, 6), 16)
  };
}

function darken(hex, amt) {
  const c = hexToRgb(hex);
  return {
    r: Math.max(0, Math.floor(c.r * (1 - amt))),
    g: Math.max(0, Math.floor(c.g * (1 - amt))),
    b: Math.max(0, Math.floor(c.b * (1 - amt)))
  };
}

function lighten(hex, amt) {
  const c = hexToRgb(hex);
  return {
    r: Math.min(255, Math.floor(c.r + (255 - c.r) * amt)),
    g: Math.min(255, Math.floor(c.g + (255 - c.g) * amt)),
    b: Math.min(255, Math.floor(c.b + (255 - c.b) * amt))
  };
}

function blendColors(c1, c2, t) {
  return {
    r: Math.floor(c1.r + (c2.r - c1.r) * t),
    g: Math.floor(c1.g + (c2.g - c1.g) * t),
    b: Math.floor(c1.b + (c2.b - c1.b) * t)
  };
}

// 棋盘 dithering：两色之间的像素交错
function ditherColor(c1, c2, x, y) {
  return (x + y) % 2 === 0 ? c1 : c2;
}

// ===== 像素操作 =====
function setPixel(data, x, y, totalW, totalH, r, g, b, a = 255) {
  if (x < 0 || x >= totalW || y < 0 || y >= totalH) return;
  const idx = (y * totalW + x) * 4;
  // alpha 混合
  if (a < 255 && data[idx + 3] > 0) {
    const srcA = a / 255;
    const dstA = data[idx + 3] / 255;
    const outA = srcA + dstA * (1 - srcA);
    data[idx] = Math.floor((r * srcA + data[idx] * dstA * (1 - srcA)) / outA);
    data[idx + 1] = Math.floor((g * srcA + data[idx + 1] * dstA * (1 - srcA)) / outA);
    data[idx + 2] = Math.floor((b * srcA + data[idx + 2] * dstA * (1 - srcA)) / outA);
    data[idx + 3] = Math.floor(outA * 255);
  } else {
    data[idx] = r;
    data[idx + 1] = g;
    data[idx + 2] = b;
    data[idx + 3] = a;
  }
}

function fillRect(data, x, y, w, h, totalW, totalH, r, g, b, a = 255) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      setPixel(data, x + dx, y + dy, totalW, totalH, r, g, b, a);
    }
  }
}

function fillEllipse(data, cx, cy, rx, ry, totalW, totalH, r, g, b, a = 255) {
  for (let dy = -ry; dy <= ry; dy++) {
    for (let dx = -rx; dx <= rx; dx++) {
      if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1) {
        setPixel(data, cx + dx, cy + dy, totalW, totalH, r, g, b, a);
      }
    }
  }
}

// ===== 5 级光影系统 =====
// 给定基础色 hex，返回 5 级色阶：{shadow, ao, base, highlight, rim}
function buildShading(hex) {
  const base = hexToRgb(hex);
  const shadow = darken(hex, SHADING.shadowStrength);
  const ao = darken(hex, SHADING.aoStrength);
  const highlight = lighten(hex, SHADING.highlightStrength);
  const rimC = SHADING.rimLightColor;
  const rim = blendColors(lighten(hex, SHADING.rimLightStrength), rimC, 0.3);
  return { shadow, ao, base, highlight, rim };
}

// ===== 角色帧绘制（128×128，3/4 等距 chibi） =====
function drawHD2DCharFrame(data, offsetX, palette, frameType, frameIdx, totalW, totalH) {
  const p = palette;
  const FW = 128;

  // 构建所有部件的 5 级色阶
  const skinShade = buildShading(p.skin);
  const hairShade = buildShading(p.hair);
  const robeShade = buildShading(p.robe);
  const beltShade = buildShading(p.belt);
  const accentShade = buildShading(p.accent);
  const innerShade = buildShading(p.inner || p.robe);
  const eye = hexToRgb(p.eye);

  // 动画偏移
  let bodyOffY = 0, armOffX = 0, armOffY = 0, headTilt = 0, legOff = 0;
  let swordVisible = false, swordGlow = false;
  let isChanneling = false;

  switch (frameType) {
    case 'idle':
      bodyOffY = [0, -1, -1, 0][frameIdx] || 0;
      break;
    case 'attack':
      if (frameIdx === 0) { bodyOffY = 1; armOffX = -3; } // 蓄力
      else if (frameIdx === 1) { bodyOffY = -2; armOffX = 10; swordVisible = true; } // 斩击
      else if (frameIdx === 2) { bodyOffY = -1; armOffX = 14; swordVisible = true; swordGlow = true; } // 最大延伸
      else { bodyOffY = 0; armOffX = 4; } // 回收
      break;
    case 'hurt':
      bodyOffY = frameIdx === 0 ? 2 : 1;
      armOffX = -4;
      headTilt = 1;
      break;
    case 'dead':
      bodyOffY = frameIdx === 0 ? 4 : 6;
      armOffX = -6;
      headTilt = 2;
      break;
    case 'skill':
      isChanneling = true;
      bodyOffY = frameIdx === 0 ? 0 : (frameIdx === 1 ? -2 : -1);
      armOffX = frameIdx === 2 ? 8 : 0;
      swordGlow = frameIdx >= 1;
      break;
  }

  const ox = offsetX;
  const baseY = 16 + bodyOffY;

  // ===== 地面阴影 =====
  const shC = SHADING.groundShadowColor;
  fillEllipse(data, ox + 64, 112, 28, 6, totalW, totalH,
    shC.r, shC.g, shC.b, SHADING.groundShadowAlpha);

  // ===== 头发（大 chibi 头） =====
  // 后层头发（3/4 视角偏右更宽）
  const hairBaseY = baseY;
  // 顶部
  for (let dy = 0; dy < 6; dy++) {
    const w = 28 + dy * 2;
    const sx = ox + 50 - Math.floor(w / 2);
    for (let dx = 0; dx < w; dx++) {
      const shade = dx < w * 0.3 ? hairShade.shadow :
                    dx > w * 0.75 ? hairShade.highlight :
                    hairShade.base;
      setPixel(data, sx + dx, hairBaseY + dy, totalW, totalH, shade.r, shade.g, shade.b);
    }
  }
  // 中段
  for (let dy = 6; dy < 20; dy++) {
    const w = 40 - (dy > 15 ? (dy - 15) * 2 : 0);
    const sx = ox + 50 - Math.floor(w / 2);
    for (let dx = 0; dx < w; dx++) {
      const shade = dx < 4 ? hairShade.shadow :
                    dx >= w - 3 ? hairShade.rim :
                    dx > w * 0.7 ? hairShade.highlight :
                    hairShade.base;
      setPixel(data, sx + dx, hairBaseY + dy, totalW, totalH, shade.r, shade.g, shade.b);
    }
  }
  // 刘海（遮在脸上层）
  for (let dx = 0; dx < 30; dx++) {
    const shade = dx < 8 ? hairShade.shadow : dx > 22 ? hairShade.highlight : hairShade.base;
    setPixel(data, ox + 35 + dx, hairBaseY + 6, totalW, totalH, shade.r, shade.g, shade.b);
    if (dx > 4 && dx < 26) {
      setPixel(data, ox + 35 + dx, hairBaseY + 7, totalW, totalH, shade.r, shade.g, shade.b);
    }
  }
  // 鬓角（AO 区域）
  for (let dy = 8; dy < 18; dy++) {
    setPixel(data, ox + 34, hairBaseY + dy, totalW, totalH, hairShade.ao.r, hairShade.ao.g, hairShade.ao.b);
    setPixel(data, ox + 35, hairBaseY + dy, totalW, totalH, hairShade.shadow.r, hairShade.shadow.g, hairShade.shadow.b);
    setPixel(data, ox + 65, hairBaseY + dy, totalW, totalH, hairShade.shadow.r, hairShade.shadow.g, hairShade.shadow.b);
    setPixel(data, ox + 66, hairBaseY + dy, totalW, totalH, hairShade.rim.r, hairShade.rim.g, hairShade.rim.b);
  }

  // ===== 脸部 =====
  const faceY = hairBaseY + 8 + headTilt;
  for (let dy = 0; dy < 14; dy++) {
    const faceW = dy < 2 ? 24 + dy * 2 : (dy > 11 ? 28 - (dy - 11) * 4 : 28);
    const sx = ox + 50 - Math.floor(faceW / 2);
    for (let dx = 0; dx < faceW; dx++) {
      let shade;
      if (dx < 3) shade = skinShade.shadow;
      else if (dx >= faceW - 2) shade = skinShade.highlight;
      else if (dy < 2) shade = skinShade.highlight; // 额头高光
      else if (dy > 10) shade = skinShade.shadow; // 下巴阴影
      else shade = skinShade.base;
      // AO：发际线以下
      if (dy === 0 || dy === 1) shade = blendColors(shade, skinShade.ao, 0.3);
      setPixel(data, sx + dx, faceY + dy, totalW, totalH, shade.r, shade.g, shade.b);
    }
  }

  // ===== 眼睛（3×3 带瞳孔高光和眉毛） =====
  const eyeY = faceY + 5;
  if (frameType === 'hurt' || frameType === 'dead') {
    // X 眼
    const xc = [[-1,-1],[0,0],[1,1],[-1,1],[1,-1]];
    for (const [ddx, ddy] of xc) {
      setPixel(data, ox + 43 + ddx, eyeY + ddy, totalW, totalH, eye.r, eye.g, eye.b);
      setPixel(data, ox + 57 + ddx, eyeY + ddy, totalW, totalH, eye.r, eye.g, eye.b);
    }
  } else {
    // 眉毛
    fillRect(data, ox + 42, eyeY - 3, 4, 1, totalW, totalH, eye.r, eye.g, eye.b);
    fillRect(data, ox + 55, eyeY - 3, 4, 1, totalW, totalH, eye.r, eye.g, eye.b);
    // 眼白
    fillRect(data, ox + 42, eyeY - 1, 4, 4, totalW, totalH, 240, 235, 230);
    fillRect(data, ox + 55, eyeY - 1, 4, 4, totalW, totalH, 240, 235, 230);
    // 瞳孔
    fillRect(data, ox + 43, eyeY, 3, 3, totalW, totalH, eye.r, eye.g, eye.b);
    fillRect(data, ox + 56, eyeY, 3, 3, totalW, totalH, eye.r, eye.g, eye.b);
    // 瞳孔高光
    setPixel(data, ox + 43, eyeY, totalW, totalH, 255, 255, 255, 200);
    setPixel(data, ox + 56, eyeY, totalW, totalH, 255, 255, 255, 200);
    // 瞳孔底部反光
    setPixel(data, ox + 44, eyeY + 2, totalW, totalH, 200, 200, 220, 120);
    setPixel(data, ox + 57, eyeY + 2, totalW, totalH, 200, 200, 220, 120);
  }

  // ===== 嘴巴 =====
  const mouthY = faceY + 11;
  if (frameType === 'hurt' || frameType === 'dead') {
    fillRect(data, ox + 48, mouthY, 5, 2, totalW, totalH, 180, 80, 80);
  } else if (frameType === 'attack' && (frameIdx === 1 || frameIdx === 2)) {
    fillRect(data, ox + 47, mouthY, 6, 2, totalW, totalH, 160, 100, 100);
  } else if (isChanneling && frameIdx >= 1) {
    fillRect(data, ox + 48, mouthY, 4, 1, totalW, totalH, 140, 110, 110);
  } else {
    const mouthC = darken(p.skin, 0.25);
    fillRect(data, ox + 49, mouthY, 3, 1, totalW, totalH, mouthC.r, mouthC.g, mouthC.b);
  }

  // ===== 颈部（AO 区域） =====
  const neckY = faceY + 14;
  fillRect(data, ox + 46, neckY, 8, 3, totalW, totalH,
    skinShade.ao.r, skinShade.ao.g, skinShade.ao.b);

  // ===== 身体/长袍（3/4 等距） =====
  const torsoY = neckY + 2;
  const torsoH = 30;
  for (let dy = 0; dy < torsoH; dy++) {
    // 肩宽到腰窄再到袍摆展开
    let w;
    if (dy < 4) w = 30 + dy * 2; // 肩膀展开
    else if (dy < 16) w = 38; // 上身
    else if (dy < 24) w = 38 + (dy - 16) * 1; // 袍摆展开
    else w = 46 + (dy - 24) * 1; // 最下

    const sx = ox + 50 - Math.floor(w / 2);
    for (let dx = 0; dx < w; dx++) {
      // 5 级光影分区
      let shade;
      const ratio = dx / w;
      if (ratio < 0.12) shade = robeShade.shadow;
      else if (ratio < 0.25) shade = ditherColor(robeShade.shadow, robeShade.base, dx, dy);
      else if (ratio > 0.88) shade = robeShade.rim;
      else if (ratio > 0.78) shade = ditherColor(robeShade.highlight, robeShade.rim, dx, dy);
      else if (ratio > 0.65) shade = robeShade.highlight;
      else shade = robeShade.base;

      // 中线（衣襟缝合线）
      if (Math.abs(dx - w / 2) < 1.5 && dy > 3) {
        shade = robeShade.ao;
      }

      setPixel(data, sx + dx, torsoY + dy, totalW, totalH, shade.r, shade.g, shade.b);
    }

    // 领口 V 字（前 8 行）
    if (dy < 8) {
      const collarW = 8 - dy;
      const cx1 = ox + 50 - Math.floor(collarW / 2);
      for (let dx = 0; dx < collarW; dx++) {
        const s = dx < collarW / 2 ? innerShade.base : innerShade.highlight;
        setPixel(data, cx1 + dx, torsoY + dy, totalW, totalH, s.r, s.g, s.b);
      }
    }

    // 衣纹褶皱（每 6 行一条暗线）
    if (dy > 8 && dy % 6 === 0) {
      const foldX1 = sx + Math.floor(w * 0.3);
      const foldX2 = sx + Math.floor(w * 0.6);
      for (let fx = 0; fx < 3; fx++) {
        setPixel(data, foldX1 + fx, torsoY + dy, totalW, totalH,
          robeShade.ao.r, robeShade.ao.g, robeShade.ao.b, 150);
        setPixel(data, foldX2 + fx, torsoY + dy, totalW, totalH,
          robeShade.ao.r, robeShade.ao.g, robeShade.ao.b, 150);
      }
    }
  }

  // ===== 腰带 =====
  const beltY = torsoY + 14;
  for (let dx = 0; dx < 38; dx++) {
    const sx = ox + 31;
    const shade = dx < 6 ? beltShade.shadow :
                  dx > 32 ? beltShade.rim :
                  dx > 26 ? beltShade.highlight :
                  beltShade.base;
    fillRect(data, sx + dx, beltY, 1, 3, totalW, totalH, shade.r, shade.g, shade.b);
  }
  // 腰带装饰（居中圆点）
  fillRect(data, ox + 48, beltY, 4, 3, totalW, totalH,
    accentShade.highlight.r, accentShade.highlight.g, accentShade.highlight.b);
  setPixel(data, ox + 49, beltY + 1, totalW, totalH, 255, 255, 255, 150); // 高光

  // ===== 手臂 =====
  const armY = torsoY + 2;
  const armLen = 16;
  // 左臂（阴影侧）
  const leftArmX = ox + 29 + armOffX;
  for (let dy = 0; dy < armLen; dy++) {
    const aw = dy < 3 ? 6 : 5;
    for (let dx = 0; dx < aw; dx++) {
      const shade = dx < 2 ? robeShade.shadow : robeShade.base;
      setPixel(data, leftArmX + dx, armY + dy + armOffY, totalW, totalH, shade.r, shade.g, shade.b);
    }
  }
  // 左手
  fillRect(data, leftArmX + 1, armY + armLen + armOffY, 4, 4, totalW, totalH,
    skinShade.base.r, skinShade.base.g, skinShade.base.b);
  fillRect(data, leftArmX + 1, armY + armLen + armOffY, 1, 4, totalW, totalH,
    skinShade.shadow.r, skinShade.shadow.g, skinShade.shadow.b);

  // 右臂（高光侧）
  const rightArmX = ox + 65 + armOffX;
  for (let dy = 0; dy < armLen; dy++) {
    const aw = dy < 3 ? 6 : 5;
    for (let dx = 0; dx < aw; dx++) {
      const shade = dx >= aw - 2 ? robeShade.rim :
                    dx >= aw - 3 ? robeShade.highlight :
                    robeShade.base;
      setPixel(data, rightArmX + dx, armY + dy + armOffY, totalW, totalH, shade.r, shade.g, shade.b);
    }
  }
  // 右手
  fillRect(data, rightArmX, armY + armLen + armOffY, 4, 4, totalW, totalH,
    skinShade.highlight.r, skinShade.highlight.g, skinShade.highlight.b);

  // ===== 剑（攻击/技能时可见） =====
  if (swordVisible || swordGlow) {
    const swordX = rightArmX + 4;
    const swordY = armY + armLen - 4 + armOffY;
    const ac = hexToRgb(p.accent);
    // 剑身
    for (let i = 0; i < 18; i++) {
      const sx2 = swordX + i;
      const sy = swordY - i;
      setPixel(data, sx2, sy, totalW, totalH, 200, 210, 220); // 剑身金属色
      setPixel(data, sx2 + 1, sy, totalW, totalH, 240, 245, 250); // 高光边
      if (i < 16) {
        setPixel(data, sx2, sy + 1, totalW, totalH, 140, 150, 165); // 阴影边
      }
    }
    // 剑光（发光效果）
    if (swordGlow) {
      for (let i = 2; i < 16; i++) {
        const sx2 = swordX + i;
        const sy = swordY - i;
        setPixel(data, sx2 - 1, sy - 1, totalW, totalH, ac.r, ac.g, ac.b, 100);
        setPixel(data, sx2 + 2, sy + 1, totalW, totalH, ac.r, ac.g, ac.b, 100);
        setPixel(data, sx2, sy - 1, totalW, totalH, 255, 255, 255, 80);
      }
    }
  }

  // ===== 腿/脚 =====
  const legY = torsoY + torsoH;
  const legSpread = frameType === 'attack' ? 2 : 0;

  // 左腿
  for (let dy = 0; dy < 10; dy++) {
    const lx = ox + 42 - legSpread;
    for (let dx = 0; dx < 6; dx++) {
      const shade = dx < 2 ? robeShade.shadow : robeShade.base;
      setPixel(data, lx + dx, legY + dy, totalW, totalH, shade.r, shade.g, shade.b);
    }
  }
  // 右腿
  for (let dy = 0; dy < 10; dy++) {
    const lx = ox + 54 + legSpread;
    for (let dx = 0; dx < 6; dx++) {
      const shade = dx >= 4 ? robeShade.rim : dx >= 2 ? robeShade.highlight : robeShade.base;
      setPixel(data, lx + dx, legY + dy, totalW, totalH, shade.r, shade.g, shade.b);
    }
  }

  // 鞋
  const shoeY = legY + 10;
  const shoeDark = { r: 25, g: 25, b: 30 };
  const shoeLight = { r: 45, g: 42, b: 50 };
  fillRect(data, ox + 40 - legSpread, shoeY, 8, 3, totalW, totalH, shoeDark.r, shoeDark.g, shoeDark.b);
  fillRect(data, ox + 52 + legSpread, shoeY, 8, 3, totalW, totalH, shoeDark.r, shoeDark.g, shoeDark.b);
  // 鞋面高光
  fillRect(data, ox + 42 - legSpread, shoeY, 4, 1, totalW, totalH, shoeLight.r, shoeLight.g, shoeLight.b);
  fillRect(data, ox + 54 + legSpread, shoeY, 4, 1, totalW, totalH, shoeLight.r, shoeLight.g, shoeLight.b);

  // ===== 轮廓光（右侧+顶部描边） =====
  // 简化方式：在已绘制区域的右侧边缘和顶部边缘添加轮廓光
  applyOutlineGlow(data, ox, baseY, 128, 100, totalW, totalH);

  // ===== 技能蓄力光环 =====
  if (isChanneling && frameIdx >= 1) {
    const ac = hexToRgb(p.accent);
    const auraAlpha = frameIdx === 1 ? 60 : 100;
    // 脚下光环
    fillEllipse(data, ox + 50, torsoY + torsoH + 5, 22 + frameIdx * 3, 5, totalW, totalH,
      ac.r, ac.g, ac.b, auraAlpha);
    // 身体周围微光
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + frameIdx * 0.5;
      const px = ox + 50 + Math.cos(angle) * (20 + frameIdx * 4);
      const py = torsoY + 15 + Math.sin(angle) * (15 + frameIdx * 3);
      setPixel(data, Math.floor(px), Math.floor(py), totalW, totalH, ac.r, ac.g, ac.b, auraAlpha + 40);
    }
  }
}

// 右侧/顶部轮廓光描边
function applyOutlineGlow(data, ox, startY, fw, fh, totalW, totalH) {
  const rim = SHADING.rimLightColor;
  const rimAlpha = Math.floor(SHADING.rimLightStrength * 100);

  for (let y = startY; y < startY + fh && y < totalH; y++) {
    for (let x = ox; x < ox + fw && x < totalW; x++) {
      const idx = (y * totalW + x) * 4;
      if (data[idx + 3] > 0) {
        // 检查右侧是否为空
        const rIdx = (y * totalW + (x + 1)) * 4;
        if (x + 1 >= ox + fw || (rIdx >= 0 && rIdx < data.length && data[rIdx + 3] === 0)) {
          setPixel(data, x, y, totalW, totalH, rim.r, rim.g, rim.b, rimAlpha);
        }
        // 检查顶部是否为空
        const tIdx = ((y - 1) * totalW + x) * 4;
        if (y - 1 < startY || (tIdx >= 0 && tIdx < data.length && data[tIdx + 3] === 0)) {
          setPixel(data, x, y, totalW, totalH,
            Math.min(255, rim.r + 30), Math.min(255, rim.g + 30), rim.b, rimAlpha);
        }
      }
    }
  }
}

// ===== 怪物帧绘制 =====
function drawHD2DMonsterFrame(data, offsetX, monsterId, accent, frameType, frameIdx, totalW, totalH) {
  const ac = hexToRgb(accent);
  const acShade = buildShading(accent);
  const bodyDark = { r: 30, g: 20, b: 25 };
  const bodyMid = { r: 50, g: 35, b: 42 };
  const bodyLight = { r: 70, g: 55, b: 62 };
  const bodyRim = blendColors(bodyLight, SHADING.rimLightColor, 0.3);

  const ox = offsetX;
  let baseY = 18 + (frameType === 'idle' ? [0, -1, -1, 0][frameIdx] || 0 : 0);
  if (frameType === 'hurt') baseY += 3;
  if (frameType === 'dead') baseY += (frameIdx === 0 ? 5 : 8);

  // 地面阴影
  const shC = SHADING.groundShadowColor;
  fillEllipse(data, ox + 64, 112, 30, 7, totalW, totalH,
    shC.r, shC.g, shC.b, SHADING.groundShadowAlpha);

  // 根据怪物类型选择不同造型
  if (monsterId === 'poison_rat') {
    drawRatMonster(data, ox, baseY, bodyDark, bodyMid, bodyLight, bodyRim, ac, acShade, frameType, frameIdx, totalW, totalH);
  } else if (monsterId === 'remnant_soul') {
    drawSoulMonster(data, ox, baseY, ac, acShade, frameType, frameIdx, totalW, totalH);
  } else {
    drawGenericMonster(data, ox, baseY, bodyDark, bodyMid, bodyLight, bodyRim, ac, acShade, frameType, frameIdx, totalW, totalH);
  }
}

// 鼠妖造型
function drawRatMonster(data, ox, baseY, bodyDark, bodyMid, bodyLight, bodyRim, ac, acShade, frameType, frameIdx, totalW, totalH) {
  // 四足弓身形态
  const bodyW = 50, bodyH = 24;
  const bx = ox + 64 - bodyW / 2;
  const by = baseY + 20;

  // 身体（椭圆弓形）
  for (let dy = 0; dy < bodyH; dy++) {
    const w = Math.floor(bodyW * Math.sin((dy / bodyH) * Math.PI));
    const sx = bx + (bodyW - w) / 2;
    for (let dx = 0; dx < w; dx++) {
      const ratio = dx / w;
      const shade = ratio < 0.15 ? bodyDark :
                    ratio > 0.85 ? bodyRim :
                    ratio > 0.7 ? bodyLight :
                    bodyMid;
      setPixel(data, Math.floor(sx + dx), by + dy, totalW, totalH, shade.r, shade.g, shade.b);
    }
  }

  // 头部（小三角头）
  const headX = ox + 34, headY = baseY + 16;
  for (let dy = 0; dy < 14; dy++) {
    const w = 14 - dy;
    for (let dx = 0; dx < w; dx++) {
      const shade = dx > w * 0.6 ? bodyLight : bodyMid;
      setPixel(data, headX + dx, headY + dy, totalW, totalH, shade.r, shade.g, shade.b);
    }
  }

  // 眼睛（红色发光）
  const eyeAlpha = frameType === 'dead' ? 80 : 255;
  fillRect(data, headX + 2, headY + 5, 3, 2, totalW, totalH, 255, 50, 50, eyeAlpha);
  setPixel(data, headX + 2, headY + 5, totalW, totalH, 255, 200, 200, eyeAlpha); // 高光

  // 尖耳
  for (let i = 0; i < 5; i++) {
    setPixel(data, headX + 3 + i, headY - 1 - i, totalW, totalH, bodyMid.r, bodyMid.g, bodyMid.b);
    setPixel(data, headX + 9 + i, headY - 1 - i, totalW, totalH, bodyLight.r, bodyLight.g, bodyLight.b);
  }

  // 尾巴
  for (let i = 0; i < 12; i++) {
    const tx = ox + 90 + i;
    const ty = baseY + 28 + Math.sin(i * 0.5 + frameIdx) * 3;
    setPixel(data, tx, Math.floor(ty), totalW, totalH, bodyDark.r, bodyDark.g, bodyDark.b);
    setPixel(data, tx, Math.floor(ty) + 1, totalW, totalH, bodyMid.r, bodyMid.g, bodyMid.b);
  }

  // 四足
  const legs = [[bx + 5, by + bodyH], [bx + 15, by + bodyH], [bx + bodyW - 16, by + bodyH], [bx + bodyW - 6, by + bodyH]];
  for (const [lx, ly] of legs) {
    fillRect(data, lx, ly, 4, 8, totalW, totalH, bodyDark.r, bodyDark.g, bodyDark.b);
    fillRect(data, lx + 1, ly, 2, 8, totalW, totalH, bodyMid.r, bodyMid.g, bodyMid.b);
  }

  // 强调色光晕
  fillEllipse(data, ox + 64, by + bodyH + 6, 18, 3, totalW, totalH, ac.r, ac.g, ac.b, 60);
}

// 残魂造型（半透明飘忽）
function drawSoulMonster(data, ox, baseY, ac, acShade, frameType, frameIdx, totalW, totalH) {
  const baseAlpha = frameType === 'dead' ? 60 : 160;
  const cx = ox + 64;

  // 飘忽的身体轮廓
  for (let dy = 0; dy < 50; dy++) {
    const wave = Math.sin((dy + frameIdx * 3) * 0.15) * 6;
    const w = Math.floor(20 + Math.sin(dy / 50 * Math.PI) * 15 + wave);
    const sx = cx - w / 2;
    for (let dx = 0; dx < w; dx++) {
      const ratio = dx / w;
      const alpha = Math.floor(baseAlpha * (1 - Math.abs(ratio - 0.5) * 1.2));
      const shade = ratio < 0.3 ? acShade.shadow :
                    ratio > 0.7 ? acShade.rim :
                    acShade.base;
      setPixel(data, Math.floor(sx + dx), baseY + 10 + dy, totalW, totalH, shade.r, shade.g, shade.b, Math.max(20, alpha));
    }
  }

  // 头部光球
  fillEllipse(data, cx, baseY + 12, 12, 10, totalW, totalH, ac.r, ac.g, ac.b, baseAlpha);
  fillEllipse(data, cx, baseY + 12, 8, 7, totalW, totalH,
    Math.min(255, ac.r + 60), Math.min(255, ac.g + 60), Math.min(255, ac.b + 60), baseAlpha);

  // 眼睛
  const eyeAlpha = frameType === 'dead' ? 40 : 255;
  fillRect(data, cx - 6, baseY + 11, 3, 3, totalW, totalH, 255, 80, 80, eyeAlpha);
  fillRect(data, cx + 3, baseY + 11, 3, 3, totalW, totalH, 255, 80, 80, eyeAlpha);
  setPixel(data, cx - 5, baseY + 11, totalW, totalH, 255, 200, 200, eyeAlpha);
  setPixel(data, cx + 4, baseY + 11, totalW, totalH, 255, 200, 200, eyeAlpha);

  // 飘散粒子
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + frameIdx * 0.8;
    const dist = 25 + Math.sin(frameIdx * 0.5 + i) * 8;
    const px = cx + Math.cos(angle) * dist;
    const py = baseY + 30 + Math.sin(angle) * dist * 0.6;
    setPixel(data, Math.floor(px), Math.floor(py), totalW, totalH, ac.r, ac.g, ac.b, 120);
    setPixel(data, Math.floor(px + 1), Math.floor(py), totalW, totalH, ac.r, ac.g, ac.b, 80);
  }
}

// 通用怪物造型（药傀/灰鳞蛇/赵景行等）
function drawGenericMonster(data, ox, baseY, bodyDark, bodyMid, bodyLight, bodyRim, ac, acShade, frameType, frameIdx, totalW, totalH) {
  const cx = ox + 64;

  // 身体（正弦曲线轮廓，更大更精细）
  for (let dy = 0; dy < 40; dy++) {
    const w = Math.floor(22 + Math.sin(dy / 40 * Math.PI) * 14);
    const sx = cx - w / 2;
    for (let dx = 0; dx < w; dx++) {
      const ratio = dx / w;
      const shade = ratio < 0.12 ? bodyDark :
                    ratio < 0.25 ? ditherColor(bodyDark, bodyMid, dx, dy) :
                    ratio > 0.88 ? bodyRim :
                    ratio > 0.75 ? ditherColor(bodyLight, bodyRim, dx, dy) :
                    ratio > 0.6 ? bodyLight :
                    bodyMid;
      setPixel(data, sx + dx, baseY + 14 + dy, totalW, totalH, shade.r, shade.g, shade.b);
    }
  }

  // 头部
  for (let dy = 0; dy < 16; dy++) {
    const w = Math.floor(16 + Math.sin(dy / 16 * Math.PI) * 10);
    const sx = cx - w / 2;
    for (let dx = 0; dx < w; dx++) {
      const ratio = dx / w;
      const shade = ratio < 0.2 ? bodyDark :
                    ratio > 0.8 ? bodyRim :
                    ratio > 0.6 ? bodyLight :
                    bodyMid;
      setPixel(data, sx + dx, baseY + dy, totalW, totalH, shade.r, shade.g, shade.b);
    }
  }

  // 角（更精致）
  for (let i = 0; i < 8; i++) {
    const hw = 2 - Math.floor(i / 3);
    fillRect(data, cx - 10 - i, baseY - i, Math.max(1, hw), 1, totalW, totalH, 60, 45, 55);
    fillRect(data, cx + 10 + i, baseY - i, Math.max(1, hw), 1, totalW, totalH, 80, 65, 75);
  }

  // 眼睛
  const eyeAlpha = frameType === 'dead' ? 80 : 255;
  const eyeR = frameType === 'hurt' ? 255 : 255;
  const eyeG = frameType === 'hurt' ? 60 : 50;
  fillRect(data, cx - 8, baseY + 6, 4, 3, totalW, totalH, eyeR, eyeG, eyeG, eyeAlpha);
  fillRect(data, cx + 4, baseY + 6, 4, 3, totalW, totalH, eyeR, eyeG, eyeG, eyeAlpha);
  // 瞳孔高光
  setPixel(data, cx - 7, baseY + 6, totalW, totalH, 255, 200, 200, eyeAlpha);
  setPixel(data, cx + 5, baseY + 6, totalW, totalH, 255, 200, 200, eyeAlpha);

  // 嘴
  if (frameType === 'attack') {
    fillRect(data, cx - 4, baseY + 12, 8, 3, totalW, totalH, 150, 40, 40);
  } else {
    fillRect(data, cx - 3, baseY + 12, 6, 2, totalW, totalH, 120, 40, 40);
  }

  // 强调色光晕
  fillEllipse(data, cx, baseY + 52, 16, 4, totalW, totalH, ac.r, ac.g, ac.b, 80);

  // 轮廓光
  applyOutlineGlow(data, ox, baseY - 8, 128, 72, totalW, totalH);
}

// ===== 导出类 =====
export class HD2DCharGenerator {
  constructor(scene) {
    this.scene = scene;
  }

  generateAll() {
    this.generateCharacters();
    this.generateMonsters();
  }

  generateCharacters() {
    for (const charId of Object.keys(CharactersData)) {
      const palette = CHAR_PALETTES[charId] || DEFAULT_PALETTE;
      this._generateSpriteSheet(`char_${charId}`, (data, ox, type, idx, tw, th) => {
        drawHD2DCharFrame(data, ox, palette, type, idx, tw, th);
      });
    }
  }

  generateMonsters() {
    for (const [monsterId, monsterData] of Object.entries(MonstersData)) {
      const accent = monsterData.portraitAccent || '#8b2a2a';
      this._generateSpriteSheet(`monster_${monsterId}`, (data, ox, type, idx, tw, th) => {
        drawHD2DMonsterFrame(data, ox, monsterId, accent, type, idx, tw, th);
      });
    }
  }

  _generateSpriteSheet(key, drawFn) {
    const FRAME_W = 128;
    const FRAME_H = 128;
    // 15 帧：idle(4) + attack(4) + hurt(2) + dead(2) + skill(3)
    const TOTAL_FRAMES = 15;
    const sheetW = FRAME_W * TOTAL_FRAMES;
    const sheetH = FRAME_H;

    const canvas = document.createElement('canvas');
    canvas.width = sheetW;
    canvas.height = sheetH;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(sheetW, sheetH);
    const d = imageData.data;

    const frames = [
      // idle: 0-3
      { type: 'idle', idx: 0 }, { type: 'idle', idx: 1 },
      { type: 'idle', idx: 2 }, { type: 'idle', idx: 3 },
      // attack: 4-7
      { type: 'attack', idx: 0 }, { type: 'attack', idx: 1 },
      { type: 'attack', idx: 2 }, { type: 'attack', idx: 3 },
      // hurt: 8-9
      { type: 'hurt', idx: 0 }, { type: 'hurt', idx: 1 },
      // dead: 10-11
      { type: 'dead', idx: 0 }, { type: 'dead', idx: 1 },
      // skill: 12-14
      { type: 'skill', idx: 0 }, { type: 'skill', idx: 1 },
      { type: 'skill', idx: 2 }
    ];

    frames.forEach((frame, i) => {
      drawFn(d, i * FRAME_W, frame.type, frame.idx, sheetW, sheetH);
    });

    ctx.putImageData(imageData, 0, 0);

    if (this.scene.textures.exists(key)) {
      this.scene.textures.remove(key);
    }
    this.scene.textures.addSpriteSheet(key, canvas, {
      frameWidth: FRAME_W,
      frameHeight: FRAME_H
    });

    this._createAnimations(key);
  }

  _createAnimations(key) {
    const anims = this.scene.anims;

    // Idle: 帧 0-3, 3fps, 循环
    if (!anims.exists(`${key}_idle`)) {
      anims.create({
        key: `${key}_idle`,
        frames: anims.generateFrameNumbers(key, { start: 0, end: 3 }),
        frameRate: 3,
        repeat: -1
      });
    }

    // Attack: 帧 4-7, 10fps, 单次
    if (!anims.exists(`${key}_attack`)) {
      anims.create({
        key: `${key}_attack`,
        frames: anims.generateFrameNumbers(key, { start: 4, end: 7 }),
        frameRate: 10,
        repeat: 0
      });
    }

    // Hurt: 帧 8-9, 6fps, 单次
    if (!anims.exists(`${key}_hurt`)) {
      anims.create({
        key: `${key}_hurt`,
        frames: anims.generateFrameNumbers(key, { start: 8, end: 9 }),
        frameRate: 6,
        repeat: 0
      });
    }

    // Dead: 帧 10-11, 4fps, 单次
    if (!anims.exists(`${key}_dead`)) {
      anims.create({
        key: `${key}_dead`,
        frames: anims.generateFrameNumbers(key, { start: 10, end: 11 }),
        frameRate: 4,
        repeat: 0
      });
    }

    // Skill: 帧 12-14, 8fps, 单次
    if (!anims.exists(`${key}_skill`)) {
      anims.create({
        key: `${key}_skill`,
        frames: anims.generateFrameNumbers(key, { start: 12, end: 14 }),
        frameRate: 8,
        repeat: 0
      });
    }
  }
}
