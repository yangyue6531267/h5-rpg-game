// ===== 回合制战斗系统 =====

class CombatSystem {
  constructor(game) {
    this.game = game;
    this.enemy = null;
    this.context = null;
    this.turn = 0;
    this.isPlayerTurn = true;
    this.tradeHPActive = false; // 以伤换伤状态
    this.combatOver = false;
  }

  startCombat(monsterData, context) {
    this.enemy = {
      ...monsterData,
      currentHp: monsterData.stats.hp,
      buffs: []
    };
    this.context = context;
    this.turn = 0;
    this.isPlayerTurn = true;
    this.tradeHPActive = false;
    this.combatOver = false;

    this.game.switchScene('combat');
    this.game.renderer.clearCombatLog();
    this.game.renderer.addCombatLog('⚔️ ' + this.enemy.name + ' 出现了！', 'dmg');
    if (this.enemy.systemQuip) {
      this.game.renderer.addCombatLog('【系统】' + this.enemy.systemQuip, '');
    }
    this.updateUI();
    this.enableActions(true);
    this.bindActions();
  }

  updateUI() {
    this.game.renderer.updateCombatUI(this.game.player.stats, this.enemy);
  }

  bindActions() {
    document.querySelectorAll('.btn-combat').forEach(btn => {
      btn.onclick = () => {
        if (!this.isPlayerTurn || this.combatOver) return;
        const action = btn.dataset.action;
        this.playerAction(action);
      };
    });
  }

  enableActions(enabled) {
    document.querySelectorAll('.btn-combat').forEach(btn => {
      btn.disabled = !enabled;
    });
  }

  // 玩家行动
  playerAction(action) {
    this.enableActions(false);
    const p = this.game.player.stats;

    switch (action) {
      case 'attack':
        this.doPlayerAttack(false);
        break;
      case 'skill':
        this.showSkillMenu();
        return; // 不立即结束回合
      case 'trade':
        this.doTradeHP();
        break;
      case 'item':
        this.showItemMenu();
        return;
      case 'defend':
        this.doDefend();
        break;
      case 'flee':
        this.doFlee();
        return;
    }
  }

  // 普通攻击
  doPlayerAttack(isTrade) {
    const p = this.game.player.stats;
    let dmg = Math.max(1, p.attack - this.enemy.stats.defense + this.randInt(-3, 3));
    let isCrit = Math.random() < 0.15;

    if (isTrade) {
      dmg = Math.floor(dmg * 1.8);
      isCrit = true; // 以伤换伤必暴击
    }
    if (isCrit) dmg = Math.floor(dmg * 1.5);

    this.enemy.currentHp = Math.max(0, this.enemy.currentHp - dmg);
    this.game.renderer.addCombatLog(
      '陈道' + (isTrade ? '以命搏命，' : '') + '攻击 ' + this.enemy.name + '，造成 ' + dmg + ' 点伤害！' + (isCrit ? '💥暴击！' : ''),
      isCrit ? 'crit' : 'dmg'
    );
    this.game.renderer.showDamageNumber('enemy', dmg, isCrit);
    this.updateUI();

    // 检查Boss阶段
    this.checkBossPhase();

    // 检查敌人是否死亡
    if (this.enemy.currentHp <= 0) {
      this.victory();
      return;
    }

    // 敌人回合
    setTimeout(() => this.enemyTurn(), 800);
  }

  // 以伤换伤（核心机制）
  doTradeHP() {
    const p = this.game.player.stats;
    // 先受到敌人一次攻击（不闪避）
    const enemyDmg = Math.max(1, this.enemy.stats.attack - Math.floor(p.defense * 0.3));
    p.hp = Math.max(1, p.hp - enemyDmg); // 至少保留1HP（锁血）
    this.game.renderer.addCombatLog(
      '陈道主动承受攻击！受到 ' + enemyDmg + ' 点伤害！',
      'dmg'
    );
    this.game.renderer.showDamageNumber('player', enemyDmg, false);

    // 杀意值上升
    this.game.modifyStat('killIntent', 10);
    this.game.renderer.addCombatLog('【杀意沸腾！反击伤害 +80%，必定暴击】', 'crit');

    // 然后发动强力反击
    setTimeout(() => {
      this.doPlayerAttack(true);
    }, 500);
  }

  // 使用技能
  showSkillMenu() {
    const menu = document.getElementById('combat-skill-menu');
    menu.innerHTML = '';
    menu.classList.remove('hidden');

    const skills = this.game.player.skills;
    const skillsData = window.SkillsData || {};

    skills.forEach(skillId => {
      const skill = skillsData[skillId];
      if (!skill) return;
      const btn = document.createElement('button');
      btn.className = 'btn-combat';
      const canUse = this.game.player.stats.sp >= (skill.spCost || 0);
      btn.disabled = !canUse;
      btn.textContent = skill.name + ' (灵力:' + (skill.spCost || 0) + ')';
      btn.onclick = () => {
        menu.classList.add('hidden');
        this.useSkill(skill);
      };
      menu.appendChild(btn);
    });

    // 取消按钮
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-combat';
    cancelBtn.textContent = '← 返回';
    cancelBtn.onclick = () => {
      menu.classList.add('hidden');
      this.enableActions(true);
    };
    menu.appendChild(cancelBtn);
  }

  useSkill(skill) {
    const p = this.game.player.stats;
    p.sp -= (skill.spCost || 0);

    let dmg = Math.max(1, (skill.power || p.attack) + p.attack * (skill.multiplier || 1) - this.enemy.stats.defense);
    dmg += this.randInt(-2, 5);
    const isCrit = Math.random() < (skill.critRate || 0.2);
    if (isCrit) dmg = Math.floor(dmg * 1.5);

    this.enemy.currentHp = Math.max(0, this.enemy.currentHp - dmg);
    this.game.renderer.addCombatLog(
      '陈道施展【' + skill.name + '】！造成 ' + dmg + ' 点伤害！' + (isCrit ? '💥暴击！' : ''),
      isCrit ? 'crit' : 'dmg'
    );
    this.game.renderer.showDamageNumber('enemy', dmg, isCrit);
    this.updateUI();

    this.checkBossPhase();
    if (this.enemy.currentHp <= 0) {
      this.victory();
      return;
    }
    setTimeout(() => this.enemyTurn(), 800);
  }

  // 防御
  doDefend() {
    const p = this.game.player.stats;
    const heal = Math.floor(p.maxHp * 0.05);
    p.hp = Math.min(p.maxHp, p.hp + heal);
    this.game.renderer.addCombatLog('陈道防御姿态，恢复 ' + heal + ' 点血量。', 'heal');
    this.updateUI();
    setTimeout(() => this.enemyTurn(true), 800); // 防御状态减伤
  }

  // 使用物品
  showItemMenu() {
    const menu = document.getElementById('combat-item-menu');
    menu.innerHTML = '';
    menu.classList.remove('hidden');

    const items = this.game.player.inventory.filter(i => {
      const data = window.ItemsData ? window.ItemsData[i.id] : null;
      return data && data.usableInCombat;
    });

    if (items.length === 0) {
      const p = document.createElement('p');
      p.textContent = '没有可用的战斗物品';
      p.style.color = 'var(--text-dim)';
      menu.appendChild(p);
    }

    items.forEach(inv => {
      const data = window.ItemsData[inv.id];
      const btn = document.createElement('button');
      btn.className = 'btn-combat';
      btn.textContent = data.name + ' x' + inv.count;
      btn.onclick = () => {
        menu.classList.add('hidden');
        this.useCombatItem(inv.id, data);
      };
      menu.appendChild(btn);
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-combat';
    cancelBtn.textContent = '← 返回';
    cancelBtn.onclick = () => {
      menu.classList.add('hidden');
      this.enableActions(true);
    };
    menu.appendChild(cancelBtn);
  }

  useCombatItem(itemId, data) {
    this.game.removeItem(itemId, 1);
    if (data.healHp) {
      this.game.modifyStat('hp', data.healHp);
      this.game.renderer.addCombatLog('使用【' + data.name + '】，恢复 ' + data.healHp + ' 点血量！', 'heal');
    }
    if (data.healSp) {
      this.game.modifyStat('sp', data.healSp);
      this.game.renderer.addCombatLog('使用【' + data.name + '】，恢复 ' + data.healSp + ' 点灵力！', 'heal');
    }
    this.updateUI();
    setTimeout(() => this.enemyTurn(), 800);
  }

  // 逃跑
  doFlee() {
    if (!this.context.canFlee) {
      this.game.renderer.addCombatLog('无法逃跑！', 'dmg');
      this.enableActions(true);
      return;
    }
    const chance = this.game.player.stats.speed > this.enemy.stats.speed ? 0.7 : 0.3;
    if (Math.random() < chance) {
      this.game.renderer.addCombatLog('成功逃跑！', '');
      this.combatOver = true;
      setTimeout(() => {
        this.game.switchScene('story');
        if (this.context.fleeNext) {
          this.game.story.loadNode(this.context.fleeNext);
        }
      }, 1000);
    } else {
      this.game.renderer.addCombatLog('逃跑失败！', 'dmg');
      setTimeout(() => this.enemyTurn(), 800);
    }
  }

  // 敌人回合
  enemyTurn(playerDefending) {
    if (this.combatOver) return;
    this.turn++;
    const e = this.enemy;
    const p = this.game.player.stats;

    // 简单AI：随机选择攻击或技能
    let dmg = Math.max(1, e.stats.attack - p.defense + this.randInt(-2, 3));
    if (playerDefending) dmg = Math.floor(dmg * 0.5);

    let skillName = '攻击';
    if (e.skills && e.skills.length > 0 && Math.random() < 0.3) {
      skillName = e.skills[Math.floor(Math.random() * e.skills.length)];
      dmg = Math.floor(dmg * 1.3);
    }

    p.hp = Math.max(0, p.hp - dmg);
    this.game.renderer.addCombatLog(
      e.name + ' 使用【' + skillName + '】，造成 ' + dmg + ' 点伤害！',
      'dmg'
    );
    this.game.renderer.showDamageNumber('player', dmg, false);
    this.updateUI();
    this.game.renderer.updateHUD();

    // 检查玩家死亡
    if (p.hp <= 0) {
      this.defeat();
      return;
    }

    // 回到玩家回合
    setTimeout(() => this.enableActions(true), 500);
  }

  // Boss阶段检查
  checkBossPhase() {
    if (!this.enemy.phases) return;
    this.enemy.phases.forEach(phase => {
      if (!phase._triggered && this.enemy.currentHp <= this.enemy.stats.hp * phase.hpThreshold) {
        phase._triggered = true;
        if (phase.dialogue) {
          this.game.renderer.addCombatLog('💬 ' + phase.dialogue, '');
        }
        if (phase.buffSelf) {
          this.enemy.stats.attack = Math.floor(this.enemy.stats.attack * 1.3);
          this.game.renderer.addCombatLog('⚡ ' + this.enemy.name + ' 进入' + phase.buffSelf + '状态！攻击力提升！', 'crit');
        }
      }
    });
  }

  // 胜利
  victory() {
    this.combatOver = true;
    const e = this.enemy;
    this.game.renderer.addCombatLog('🎉 击败了 ' + e.name + '！', 'heal');

    // 经验奖励
    if (e.exp) {
      this.game.modifyStat('exp', e.exp);
      this.game.renderer.addCombatLog('获得经验 +' + e.exp, 'heal');
    }
    // 货币奖励
    if (e.currency) {
      this.game.addCurrency(e.currency);
      this.game.renderer.addCombatLog('获得符钱 +' + e.currency, 'heal');
    }
    // 掉落物品
    if (e.drops) {
      e.drops.forEach(drop => {
        if (Math.random() < drop.chance) {
          this.game.addItem(drop.item, 1);
          this.game.renderer.addCombatLog('获得【' + drop.name + '】！', 'crit');
        }
      });
    }

    this.game.renderer.updateHUD();

    setTimeout(() => {
      this.game.switchScene('story');
      if (this.context.winNext) {
        this.game.story.loadNode(this.context.winNext);
      }
    }, 2000);
  }

  // 失败
  defeat() {
    this.combatOver = true;
    this.game.renderer.addCombatLog('💀 陈道倒下了……', 'dmg');

    setTimeout(() => {
      if (this.context.loseNext) {
        // 有失败剧情分支
        this.game.player.stats.hp = Math.floor(this.game.player.stats.maxHp * 0.3);
        this.game.switchScene('story');
        this.game.story.loadNode(this.context.loseNext);
      } else {
        // 游戏结束，回标题
        alert('修行路断……\n\n"血条归零的那一刻，陈道终于理解了什么叫做——游戏结束。"');
        this.game.switchScene('title');
      }
    }, 2000);
  }

  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
