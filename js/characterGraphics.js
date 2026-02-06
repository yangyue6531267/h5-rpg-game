// ===== Character Graphics Engine (Canvas-based) =====

(function initCharacterGraphicsEngine() {
  class CharacterGraphicsEngine {
    constructor() {
      this.styles = {
        defaultCharacter: {
          skin: '#e5c2a4',
          hair: '#2b2b33',
          robe: '#2c3b5f',
          accent: '#d4a843',
          eye: '#2a2a2a'
        },
        chen_dao: {
          skin: '#e2bc98',
          hair: '#1f1f24',
          robe: '#33476d',
          accent: '#8a5ab5',
          eye: '#1f1f1f'
        },
        su_lingyun: {
          skin: '#edc5a8',
          hair: '#46212a',
          robe: '#8b2437',
          accent: '#d4a843',
          eye: '#3a2323'
        },
        qing_he: {
          skin: '#ebc8a8',
          hair: '#1d2a20',
          robe: '#254b37',
          accent: '#7fa24e',
          eye: '#243224'
        },
        yang_youwei: {
          skin: '#f0cfb2',
          hair: '#3e3658',
          robe: '#4a5da0',
          accent: '#f0ece0',
          eye: '#29283a'
        },
        wang_daoyuan: {
          skin: '#d3ad89',
          hair: '#3c2f2a',
          robe: '#6a4d37',
          accent: '#d4a843',
          eye: '#2a201c'
        },
        liu_changqing: {
          skin: '#c8a88a',
          hair: '#2d2d2d',
          robe: '#442b2b',
          accent: '#c43e3e',
          eye: '#1b1b1b'
        }
      };
    }

    // Map portrait keys from CharactersData to mood rendering styles.
    mapPortraitToMood(portraitKey) {
      const key = (portraitKey || 'normal').toLowerCase();
      if (['angry', 'yandere', 'sinister', 'evil'].includes(key)) return 'angry';
      if (['smile', 'gentle', 'blush', 'happy'].includes(key)) return 'smile';
      if (['hurt', 'sad', 'scared'].includes(key)) return 'hurt';
      if (['shocked', 'nervous', 'thinking', 'surprised'].includes(key)) return 'shocked';
      return 'normal';
    }

    drawCharacter(canvas, options) {
      if (!canvas) return;

      const characterId = options && options.characterId ? options.characterId : 'defaultCharacter';
      const mood = options && options.mood ? options.mood : 'normal';
      const style = this.styles[characterId] || this.styles.defaultCharacter;
      const result = this.prepareCanvas(canvas);
      const ctx = result.ctx;
      const w = result.w;
      const h = result.h;
      const cx = w * 0.5;
      const cy = h * 0.42;
      const headR = h * 0.2;

      this.drawBackground(ctx, w, h, style.accent, false);
      this.drawBody(ctx, cx, h, style);
      this.drawHead(ctx, cx, cy, headR, style);
      this.drawHair(ctx, cx, cy, headR, style);
      this.drawFace(ctx, cx, cy, headR, style, mood);
      this.drawAccessory(ctx, characterId, cx, cy, headR, style);
      this.drawFrame(ctx, w, h, style.accent);
    }

    drawMonster(canvas, options) {
      if (!canvas) return;

      const accent = options && options.accent ? options.accent : '#8b2a2a';
      const name = options && options.name ? options.name : '妖物';
      const mood = options && options.mood ? options.mood : 'normal';
      const result = this.prepareCanvas(canvas);
      const ctx = result.ctx;
      const w = result.w;
      const h = result.h;
      const cx = w * 0.5;
      const cy = h * 0.45;
      const r = h * 0.2;

      this.drawBackground(ctx, w, h, accent, true);

      // Body silhouette
      ctx.fillStyle = '#1a1116';
      ctx.beginPath();
      ctx.moveTo(cx - r * 1.2, cy + r * 1.35);
      ctx.quadraticCurveTo(cx, cy + r * 2.1, cx + r * 1.2, cy + r * 1.35);
      ctx.lineTo(cx + r * 0.8, cy - r * 0.1);
      ctx.lineTo(cx - r * 0.8, cy - r * 0.1);
      ctx.closePath();
      ctx.fill();

      // Head
      ctx.fillStyle = '#231820';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Horns
      ctx.fillStyle = '#2f2028';
      this.drawHorn(ctx, cx - r * 0.65, cy - r * 0.65, -1);
      this.drawHorn(ctx, cx + r * 0.65, cy - r * 0.65, 1);

      // Eyes
      const eyeColor = mood === 'angry' ? '#ff4d4d' : '#ff9999';
      ctx.strokeStyle = eyeColor;
      ctx.lineWidth = Math.max(2, r * 0.12);
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.5, cy - r * 0.05);
      ctx.lineTo(cx - r * 0.2, cy + r * 0.05);
      ctx.moveTo(cx + r * 0.5, cy - r * 0.05);
      ctx.lineTo(cx + r * 0.2, cy + r * 0.05);
      ctx.stroke();

      // Mouth
      ctx.strokeStyle = '#b63a3a';
      ctx.lineWidth = Math.max(2, r * 0.1);
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.45, r * 0.3, 0, Math.PI, false);
      ctx.stroke();

      this.drawFrame(ctx, w, h, accent);

      ctx.fillStyle = 'rgba(240, 236, 224, 0.85)';
      ctx.font = `${Math.max(12, h * 0.08)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(name, cx, h - h * 0.08);
    }

    drawBackground(ctx, w, h, accent, isMonster) {
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.4, h * 0.12, w * 0.5, h * 0.45, h * 0.75);
      grad.addColorStop(0, isMonster ? 'rgba(90, 20, 30, 0.55)' : this.alpha(accent, 0.4));
      grad.addColorStop(1, isMonster ? 'rgba(10, 8, 12, 0.95)' : 'rgba(12, 12, 18, 0.95)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = this.alpha(accent, 0.35);
      ctx.lineWidth = Math.max(1, w * 0.012);
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.48, h * 0.37, 0, Math.PI * 2);
      ctx.stroke();
    }

    drawBody(ctx, cx, h, style) {
      const shoulderY = h * 0.58;
      const bottomY = h * 0.95;
      const width = h * 0.36;

      const grad = ctx.createLinearGradient(0, shoulderY, 0, bottomY);
      grad.addColorStop(0, this.lighten(style.robe, 0.15));
      grad.addColorStop(1, this.darken(style.robe, 0.25));
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(cx - width * 0.7, shoulderY);
      ctx.quadraticCurveTo(cx, shoulderY + h * 0.18, cx + width * 0.7, shoulderY);
      ctx.lineTo(cx + width, bottomY);
      ctx.lineTo(cx - width, bottomY);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = this.alpha(style.accent, 0.65);
      ctx.lineWidth = Math.max(1, h * 0.01);
      ctx.beginPath();
      ctx.moveTo(cx, shoulderY + h * 0.02);
      ctx.lineTo(cx, bottomY - h * 0.04);
      ctx.stroke();
    }

    drawHead(ctx, cx, cy, r, style) {
      const skinGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.25, r * 0.1, cx, cy, r);
      skinGrad.addColorStop(0, this.lighten(style.skin, 0.2));
      skinGrad.addColorStop(1, this.darken(style.skin, 0.15));
      ctx.fillStyle = skinGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    drawHair(ctx, cx, cy, r, style) {
      ctx.fillStyle = style.hair;

      // Top hair
      ctx.beginPath();
      ctx.moveTo(cx - r * 1.05, cy - r * 0.15);
      ctx.quadraticCurveTo(cx, cy - r * 1.35, cx + r * 1.05, cy - r * 0.15);
      ctx.lineTo(cx + r * 0.9, cy - r * 0.42);
      ctx.quadraticCurveTo(cx, cy - r * 0.95, cx - r * 0.9, cy - r * 0.42);
      ctx.closePath();
      ctx.fill();

      // Side locks
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.95, cy + r * 0.12, r * 0.24, r * 0.48, -0.25, 0, Math.PI * 2);
      ctx.ellipse(cx + r * 0.95, cy + r * 0.12, r * 0.24, r * 0.48, 0.25, 0, Math.PI * 2);
      ctx.fill();
    }

    drawFace(ctx, cx, cy, r, style, mood) {
      const eyeY = cy + r * 0.06;
      const leftEyeX = cx - r * 0.35;
      const rightEyeX = cx + r * 0.35;
      const eyeR = r * 0.07;

      ctx.strokeStyle = style.eye;
      ctx.fillStyle = style.eye;
      ctx.lineWidth = Math.max(1.5, r * 0.06);

      if (mood === 'angry') {
        this.drawLineEye(ctx, leftEyeX, eyeY, eyeR, -1, true);
        this.drawLineEye(ctx, rightEyeX, eyeY, eyeR, 1, true);
      } else if (mood === 'smile') {
        this.drawArcEye(ctx, leftEyeX, eyeY, eyeR);
        this.drawArcEye(ctx, rightEyeX, eyeY, eyeR);
      } else if (mood === 'shocked') {
        this.drawRoundEye(ctx, leftEyeX, eyeY, eyeR * 1.2, true);
        this.drawRoundEye(ctx, rightEyeX, eyeY, eyeR * 1.2, true);
      } else if (mood === 'hurt') {
        this.drawLineEye(ctx, leftEyeX, eyeY, eyeR, -1, false);
        this.drawCrossEye(ctx, rightEyeX, eyeY, eyeR * 0.9);
      } else {
        this.drawRoundEye(ctx, leftEyeX, eyeY, eyeR, false);
        this.drawRoundEye(ctx, rightEyeX, eyeY, eyeR, false);
      }

      // Blush
      if (mood === 'smile') {
        ctx.fillStyle = 'rgba(220, 130, 140, 0.35)';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.5, cy + r * 0.28, r * 0.15, r * 0.09, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + r * 0.5, cy + r * 0.28, r * 0.15, r * 0.09, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mouth
      ctx.strokeStyle = this.darken(style.eye, 0.08);
      ctx.lineWidth = Math.max(1.2, r * 0.05);
      ctx.beginPath();
      if (mood === 'smile') {
        ctx.arc(cx, cy + r * 0.42, r * 0.22, 0.1, Math.PI - 0.1);
      } else if (mood === 'angry') {
        ctx.arc(cx, cy + r * 0.5, r * 0.2, Math.PI + 0.18, -0.18, true);
      } else if (mood === 'shocked') {
        ctx.arc(cx, cy + r * 0.44, r * 0.11, 0, Math.PI * 2);
      } else if (mood === 'hurt') {
        ctx.moveTo(cx - r * 0.15, cy + r * 0.48);
        ctx.lineTo(cx + r * 0.15, cy + r * 0.5);
      } else {
        ctx.moveTo(cx - r * 0.14, cy + r * 0.47);
        ctx.lineTo(cx + r * 0.14, cy + r * 0.47);
      }
      ctx.stroke();
    }

    drawAccessory(ctx, characterId, cx, cy, r, style) {
      ctx.strokeStyle = style.accent;
      ctx.fillStyle = style.accent;
      ctx.lineWidth = Math.max(1.2, r * 0.06);

      if (characterId === 'chen_dao') {
        // Scar
        ctx.strokeStyle = this.alpha('#9e3d3d', 0.7);
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.12, cy + r * 0.05);
        ctx.lineTo(cx + r * 0.26, cy + r * 0.26);
        ctx.stroke();
      } else if (characterId === 'su_lingyun') {
        // Hairpin
        ctx.strokeStyle = this.lighten(style.accent, 0.05);
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.65, cy - r * 0.75);
        ctx.lineTo(cx + r * 0.75, cy - r * 0.35);
        ctx.stroke();
      } else if (characterId === 'qing_he') {
        // Bamboo leaf pin
        ctx.fillStyle = '#7fa24e';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.7, cy - r * 0.5, r * 0.14, r * 0.07, -0.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (characterId === 'yang_youwei') {
        // Moon crest
        ctx.strokeStyle = this.lighten(style.accent, 0.2);
        ctx.beginPath();
        ctx.arc(cx, cy - r * 0.34, r * 0.16, -0.8, 1.7);
        ctx.stroke();
      } else if (characterId === 'wang_daoyuan') {
        // Mustache
        ctx.strokeStyle = this.darken(style.hair, 0.15);
        ctx.beginPath();
        ctx.arc(cx - r * 0.16, cy + r * 0.37, r * 0.12, 0.2, 2.9);
        ctx.arc(cx + r * 0.16, cy + r * 0.37, r * 0.12, 0.2, 2.9);
        ctx.stroke();
      }
    }

    drawFrame(ctx, w, h, accent) {
      ctx.strokeStyle = this.alpha(accent, 0.7);
      ctx.lineWidth = Math.max(1.5, w * 0.018);
      ctx.strokeRect(w * 0.03, h * 0.03, w * 0.94, h * 0.94);

      ctx.strokeStyle = this.alpha('#f0ece0', 0.2);
      ctx.lineWidth = Math.max(1, w * 0.008);
      ctx.strokeRect(w * 0.06, h * 0.06, w * 0.88, h * 0.88);
    }

    drawHorn(ctx, x, y, direction) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + direction * 14, y - 18, x + direction * 6, y + 16);
      ctx.closePath();
      ctx.fill();
    }

    drawRoundEye(ctx, x, y, r, hollow) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      if (hollow) {
        ctx.stroke();
      } else {
        ctx.fill();
      }
    }

    drawLineEye(ctx, x, y, r, direction, angry) {
      const tilt = angry ? r * 1.3 : r * 0.7;
      ctx.beginPath();
      ctx.moveTo(x - r, y + direction * tilt * 0.2);
      ctx.lineTo(x + r, y - direction * tilt * 0.2);
      ctx.stroke();
    }

    drawArcEye(ctx, x, y, r) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0.15, Math.PI - 0.15);
      ctx.stroke();
    }

    drawCrossEye(ctx, x, y, r) {
      ctx.beginPath();
      ctx.moveTo(x - r, y - r);
      ctx.lineTo(x + r, y + r);
      ctx.moveTo(x + r, y - r);
      ctx.lineTo(x - r, y + r);
      ctx.stroke();
    }

    prepareCanvas(canvas) {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const attrW = Number.parseInt(canvas.getAttribute('width'), 10) || 180;
      const attrH = Number.parseInt(canvas.getAttribute('height'), 10) || 180;
      const w = Math.max(1, Math.floor(rect.width || canvas.clientWidth || attrW));
      const h = Math.max(1, Math.floor(rect.height || canvas.clientHeight || attrH));
      const targetW = Math.floor(w * dpr);
      const targetH = Math.floor(h * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      return { ctx, w, h };
    }

    alpha(hex, opacity) {
      const rgb = this.hexToRgb(hex);
      if (!rgb) return `rgba(255,255,255,${opacity})`;
      return `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})`;
    }

    lighten(hex, amount) {
      return this.mix(hex, '#ffffff', amount);
    }

    darken(hex, amount) {
      return this.mix(hex, '#000000', amount);
    }

    mix(a, b, amount) {
      const c1 = this.hexToRgb(a) || { r: 255, g: 255, b: 255 };
      const c2 = this.hexToRgb(b) || { r: 0, g: 0, b: 0 };
      const p = Math.max(0, Math.min(1, amount));
      const r = Math.round(c1.r + (c2.r - c1.r) * p);
      const g = Math.round(c1.g + (c2.g - c1.g) * p);
      const bl = Math.round(c1.b + (c2.b - c1.b) * p);
      return `rgb(${r}, ${g}, ${bl})`;
    }

    hexToRgb(hex) {
      if (!hex || typeof hex !== 'string') return null;
      const clean = hex.replace('#', '').trim();
      if (![3, 6].includes(clean.length)) return null;
      const full = clean.length === 3
        ? clean.split('').map((c) => c + c).join('')
        : clean;
      const intVal = Number.parseInt(full, 16);
      if (Number.isNaN(intVal)) return null;
      return {
        r: (intVal >> 16) & 255,
        g: (intVal >> 8) & 255,
        b: intVal & 255
      };
    }
  }

  window.CharacterGraphicsEngine = CharacterGraphicsEngine;
  window.characterGraphics = new CharacterGraphicsEngine();
})();
