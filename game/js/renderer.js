// ===== UI 渲染引擎 =====

class Renderer {
  constructor(game) {
    this.game = game;
    this.typewriterTimer = null;
    this.characterGraphics = window.characterGraphics || null;
  }

  // 更新HUD状态栏
  updateHUD() {
    const p = this.game.player;
    const s = p.stats;
    document.getElementById('hud-player-name').textContent = p.name;
    document.getElementById('hud-realm').textContent = p.realm.display;
    this.updateBar('hp', s.hp, s.maxHp);
    this.updateBar('sp', s.sp, s.maxSp);
    this.updateBar('mood', s.mood, s.maxMood);
    document.getElementById('hud-currency').textContent = '💰 ' + p.currency + ' 符钱';
    document.getElementById('hud-chapter').textContent = '📖 第' + this.numToChinese(p.chapter) + '章';
  }

  updateBar(type, current, max) {
    const fill = document.getElementById('bar-' + type + '-fill');
    const text = document.getElementById('bar-' + type + '-text');
    if (fill) fill.style.width = Math.max(0, (current / max) * 100) + '%';
    if (text) text.textContent = current + '/' + max;
  }

  // 打字机效果显示文字
  typeText(element, text, speed, callback) {
    if (this.typewriterTimer) clearInterval(this.typewriterTimer);
    element.textContent = '';
    let i = 0;
    const spd = speed || this.game.textSpeed;
    this.typewriterTimer = setInterval(() => {
      if (i < text.length) {
        element.textContent += text[i];
        i++;
      } else {
        clearInterval(this.typewriterTimer);
        this.typewriterTimer = null;
        if (callback) callback();
      }
    }, spd);
  }

  // 立即显示全部文字（跳过打字机）
  skipTypeText(element, text) {
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    element.textContent = text;
  }

  // 渲染剧情旁白
  renderNarration(text, onDone) {
    const speakerEl = document.getElementById('story-speaker');
    const textEl = document.getElementById('story-text');
    const choicesEl = document.getElementById('story-choices');
    const continueEl = document.getElementById('story-continue');

    this.hideStoryPortrait();
    speakerEl.textContent = '';
    choicesEl.innerHTML = '';
    continueEl.classList.add('hidden');

    this.typeText(textEl, text, null, () => {
      continueEl.classList.remove('hidden');
      continueEl.onclick = () => {
        continueEl.classList.add('hidden');
        if (onDone) onDone();
      };
    });

    // 点击跳过打字机
    textEl.onclick = () => {
      if (this.typewriterTimer) {
        this.skipTypeText(textEl, text);
        continueEl.classList.remove('hidden');
        continueEl.onclick = () => {
          continueEl.classList.add('hidden');
          if (onDone) onDone();
        };
      }
    };
  }

  // 渲染对话
  renderDialogue(speaker, portrait, text, onDone) {
    const speakerEl = document.getElementById('story-speaker');
    const textEl = document.getElementById('story-text');
    const choicesEl = document.getElementById('story-choices');
    const continueEl = document.getElementById('story-continue');

    const charData = window.CharactersData ? window.CharactersData[speaker] : null;
    const name = charData ? charData.name : speaker;
    this.showStoryPortrait(speaker, portrait);

    speakerEl.textContent = name;
    choicesEl.innerHTML = '';
    continueEl.classList.add('hidden');

    this.typeText(textEl, text, null, () => {
      continueEl.classList.remove('hidden');
      continueEl.onclick = () => {
        continueEl.classList.add('hidden');
        if (onDone) onDone();
      };
    });

    textEl.onclick = () => {
      if (this.typewriterTimer) {
        this.skipTypeText(textEl, text);
        continueEl.classList.remove('hidden');
        continueEl.onclick = () => {
          continueEl.classList.add('hidden');
          if (onDone) onDone();
        };
      }
    };
  }

  // 渲染选择
  renderChoices(text, choices) {
    const speakerEl = document.getElementById('story-speaker');
    const textEl = document.getElementById('story-text');
    const choicesEl = document.getElementById('story-choices');
    const continueEl = document.getElementById('story-continue');

    this.hideStoryPortrait();
    speakerEl.textContent = '';
    continueEl.classList.add('hidden');
    textEl.textContent = text;
    choicesEl.innerHTML = '';

    choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      const meetsReq = this.game.checkRequirements(choice.requirements);
      if (!meetsReq) {
        btn.classList.add('disabled');
        btn.textContent = choice.text;
        return choicesEl.appendChild(btn);
      }
      btn.textContent = choice.text;
      btn.onclick = () => {
        this.game.applyEffects(choice.effects);
        this.game.story.loadNode(choice.next);
      };
      choicesEl.appendChild(btn);
    });
  }

  // 渲染系统弹窗
  renderSystemPopup(title, messages, onDone) {
    this.game.switchScene('system');
    document.getElementById('system-title').textContent = title || '系统提示';
    const container = document.getElementById('system-messages');
    container.innerHTML = '';

    let i = 0;
    const showNext = () => {
      if (i >= messages.length) return;
      const msg = messages[i];
      const div = document.createElement('div');
      div.className = 'sys-msg ' + (msg.style || 'info');
      div.textContent = msg.text;
      container.appendChild(div);
      i++;
      if (i < messages.length) {
        setTimeout(showNext, 200);
      }
    };
    showNext();

    // 确认按钮回调
    const btn = container.parentElement.querySelector('.btn-system');
    btn.onclick = () => {
      this.game.switchScene('story');
      if (onDone) onDone();
    };
  }

  // 渲染章节过渡
  renderTransition(text, nextChapter, onDone) {
    const textEl = document.getElementById('story-text');
    const speakerEl = document.getElementById('story-speaker');
    const choicesEl = document.getElementById('story-choices');
    const continueEl = document.getElementById('story-continue');

    this.hideStoryPortrait();
    speakerEl.textContent = '';
    choicesEl.innerHTML = '';
    textEl.textContent = '';
    textEl.style.textAlign = 'center';
    textEl.style.color = 'var(--accent-gold)';
    textEl.style.fontSize = '1.2rem';

    this.typeText(textEl, text, 80, () => {
      continueEl.classList.remove('hidden');
      continueEl.textContent = nextChapter ? '▼ 进入下一章' : '▼ 继续';
      continueEl.onclick = () => {
        textEl.style.textAlign = '';
        textEl.style.color = '';
        textEl.style.fontSize = '';
        continueEl.classList.add('hidden');
        continueEl.textContent = '▼ 点击继续';
        if (onDone) onDone();
      };
    });
  }

  // 战斗UI更新
  updateCombatUI(playerStats, enemy) {
    // 敌人信息
    document.getElementById('enemy-name').textContent = enemy.name + ' (Lv.' + enemy.level + ')';
    const eHpPct = Math.max(0, (enemy.currentHp / enemy.stats.hp) * 100);
    document.getElementById('enemy-hp-fill').style.width = eHpPct + '%';
    document.getElementById('enemy-hp-text').textContent = enemy.currentHp + '/' + enemy.stats.hp;

    // 玩家战斗信息
    const pHpPct = Math.max(0, (playerStats.hp / playerStats.maxHp) * 100);
    document.getElementById('combat-hp-fill').style.width = pHpPct + '%';
    document.getElementById('combat-hp-text').textContent = playerStats.hp + '/' + playerStats.maxHp;
    const pSpPct = Math.max(0, (playerStats.sp / playerStats.maxSp) * 100);
    document.getElementById('combat-sp-fill').style.width = pSpPct + '%';
    document.getElementById('combat-sp-text').textContent = playerStats.sp + '/' + playerStats.maxSp;

    this.renderCombatPortraits(playerStats, enemy);
  }

  // 战斗日志
  addCombatLog(text, type) {
    const log = document.getElementById('combat-log');
    const p = document.createElement('p');
    if (type) p.classList.add(type);
    p.textContent = text;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
  }

  clearCombatLog() {
    document.getElementById('combat-log').innerHTML = '';
  }

  // 伤害数字动画
  showDamageNumber(targetSide, value, isCrit) {
    const target = document.getElementById(targetSide === 'enemy' ? 'combat-enemy' : 'combat-player');
    const num = document.createElement('div');
    num.className = 'damage-number';
    if (isCrit) num.style.color = 'var(--accent-gold)';
    num.textContent = (value > 0 ? '-' : '+') + Math.abs(value);
    target.style.position = 'relative';
    target.appendChild(num);
    setTimeout(() => num.remove(), 1000);
    target.classList.add('shake');
    setTimeout(() => target.classList.remove('shake'), 300);
  }

  getCharacterGraphics() {
    if (!this.characterGraphics && window.characterGraphics) {
      this.characterGraphics = window.characterGraphics;
    }
    return this.characterGraphics;
  }

  showStoryPortrait(characterId, portraitKey) {
    const wrap = document.getElementById('story-portrait-wrap');
    const canvas = document.getElementById('story-portrait-canvas');
    const graphics = this.getCharacterGraphics();
    const hasCharacter = !!(window.CharactersData && window.CharactersData[characterId]);

    if (!wrap || !canvas || !graphics || !hasCharacter) {
      if (wrap) wrap.classList.add('hidden');
      return;
    }

    const mood = graphics.mapPortraitToMood(portraitKey);
    wrap.classList.remove('hidden');
    graphics.drawCharacter(canvas, { characterId: characterId, mood: mood });
  }

  hideStoryPortrait() {
    const wrap = document.getElementById('story-portrait-wrap');
    if (wrap) wrap.classList.add('hidden');
  }

  renderCombatPortraits(playerStats, enemy) {
    const graphics = this.getCharacterGraphics();
    if (!graphics) return;

    const playerCanvas = document.getElementById('combat-player-canvas');
    if (playerCanvas) {
      const hpRate = playerStats.maxHp > 0 ? playerStats.hp / playerStats.maxHp : 1;
      let mood = 'normal';
      if (hpRate <= 0.25) mood = 'hurt';
      else if (this.game.player.stats.killIntent >= 20) mood = 'angry';
      graphics.drawCharacter(playerCanvas, { characterId: 'chen_dao', mood: mood });
    }

    const enemyCanvas = document.getElementById('combat-enemy-canvas');
    if (!enemyCanvas) return;

    if (enemy.characterId && window.CharactersData && window.CharactersData[enemy.characterId]) {
      const enemyHpRate = enemy.stats.hp > 0 ? enemy.currentHp / enemy.stats.hp : 1;
      const enemyMood = enemyHpRate <= 0.3 ? 'angry' : 'normal';
      graphics.drawCharacter(enemyCanvas, { characterId: enemy.characterId, mood: enemyMood });
      return;
    }

    const accent = enemy.portraitAccent || '#8b2a2a';
    const hpRate = enemy.stats.hp > 0 ? enemy.currentHp / enemy.stats.hp : 1;
    const monsterMood = hpRate <= 0.35 ? 'angry' : 'normal';
    graphics.drawMonster(enemyCanvas, { name: enemy.name, accent: accent, mood: monsterMood });
  }

  numToChinese(n) {
    const nums = ['零','一','二','三','四','五','六','七','八','九','十'];
    if (n <= 10) return nums[n];
    if (n < 20) return '十' + (n % 10 === 0 ? '' : nums[n % 10]);
    return nums[Math.floor(n / 10)] + '十' + (n % 10 === 0 ? '' : nums[n % 10]);
  }
}
