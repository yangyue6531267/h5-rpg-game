// ===== CombatManager：战斗逻辑（复用原 combat.js 公式） =====

import { SkillsData } from '../data/skills.js';
import { ItemsData } from '../data/items.js';

export class CombatManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.enemy = null;
    this.context = null;
    this.turn = 0;
    this.combatOver = false;
  }

  init(monsterData, context) {
    this.enemy = {
      ...monsterData,
      currentHp: monsterData.stats.hp,
      buffs: []
    };
    this.context = context;
    this.turn = 0;
    this.combatOver = false;
  }

  // 普通攻击
  playerAttack(isTrade = false) {
    const p = this.gameState.player.stats;
    let dmg = Math.max(1, p.attack - this.enemy.stats.defense + this.randInt(-3, 3));
    let isCrit = Math.random() < 0.15;

    if (isTrade) {
      dmg = Math.floor(dmg * 1.8);
      isCrit = true;
    }
    if (isCrit) dmg = Math.floor(dmg * 1.5);

    this.enemy.currentHp = Math.max(0, this.enemy.currentHp - dmg);

    return { dmg, isCrit, isTrade, enemyDead: this.enemy.currentHp <= 0 };
  }

  // 以伤换伤
  tradeHP() {
    const p = this.gameState.player.stats;
    const enemyDmg = Math.max(1, this.enemy.stats.attack - Math.floor(p.defense * 0.3));
    p.hp = Math.max(1, p.hp - enemyDmg);
    this.gameState.modifyStat('killIntent', 10);
    return { enemyDmg };
  }

  // 使用技能
  useSkill(skillId) {
    const skill = SkillsData[skillId];
    if (!skill) return null;

    const p = this.gameState.player.stats;
    p.sp -= (skill.spCost || 0);

    let dmg = Math.max(1, (skill.power || p.attack) + p.attack * (skill.multiplier || 1) - this.enemy.stats.defense);
    dmg += this.randInt(-2, 5);
    const isCrit = Math.random() < (skill.critRate || 0.2);
    if (isCrit) dmg = Math.floor(dmg * 1.5);

    this.enemy.currentHp = Math.max(0, this.enemy.currentHp - dmg);

    return { dmg, isCrit, skill, enemyDead: this.enemy.currentHp <= 0 };
  }

  // 防御
  defend() {
    const p = this.gameState.player.stats;
    const heal = Math.floor(p.maxHp * 0.05);
    p.hp = Math.min(p.maxHp, p.hp + heal);
    return { heal };
  }

  // 使用物品
  useCombatItem(itemId) {
    const data = ItemsData[itemId];
    if (!data) return null;
    this.gameState.removeItem(itemId, 1);
    const results = { healHp: 0, healSp: 0, itemName: data.name };
    if (data.healHp) {
      this.gameState.modifyStat('hp', data.healHp);
      results.healHp = data.healHp;
    }
    if (data.healSp) {
      this.gameState.modifyStat('sp', data.healSp);
      results.healSp = data.healSp;
    }
    return results;
  }

  // 逃跑
  tryFlee() {
    if (!this.context.canFlee) return { success: false, allowed: false };
    const chance = this.gameState.player.stats.speed > this.enemy.stats.speed ? 0.7 : 0.3;
    return { success: Math.random() < chance, allowed: true };
  }

  // 敌人回合
  enemyTurn(playerDefending = false) {
    if (this.combatOver) return null;
    this.turn++;
    const e = this.enemy;
    const p = this.gameState.player.stats;

    let dmg = Math.max(1, e.stats.attack - p.defense + this.randInt(-2, 3));
    if (playerDefending) dmg = Math.floor(dmg * 0.5);

    let skillName = '攻击';
    if (e.skills && e.skills.length > 0 && Math.random() < 0.3) {
      skillName = e.skills[Math.floor(Math.random() * e.skills.length)];
      dmg = Math.floor(dmg * 1.3);
    }

    p.hp = Math.max(0, p.hp - dmg);
    this.gameState.events.emit('stateChanged');

    return { dmg, skillName, playerDead: p.hp <= 0 };
  }

  // Boss阶段检查
  checkBossPhase() {
    if (!this.enemy.phases) return null;
    for (const phase of this.enemy.phases) {
      if (!phase._triggered && this.enemy.currentHp <= this.enemy.stats.hp * phase.hpThreshold) {
        phase._triggered = true;
        if (phase.buffSelf) {
          this.enemy.stats.attack = Math.floor(this.enemy.stats.attack * 1.3);
        }
        return phase;
      }
    }
    return null;
  }

  // 胜利结算
  getVictoryRewards() {
    const e = this.enemy;
    const rewards = { exp: 0, currency: 0, drops: [] };
    if (e.exp) {
      rewards.exp = e.exp;
      this.gameState.modifyStat('exp', e.exp);
    }
    if (e.currency) {
      rewards.currency = e.currency;
      this.gameState.addCurrency(e.currency);
    }
    if (e.drops) {
      e.drops.forEach(drop => {
        if (Math.random() < drop.chance) {
          this.gameState.addItem(drop.item, 1);
          rewards.drops.push(drop.name);
        }
      });
    }
    this.combatOver = true;
    return rewards;
  }

  // 失败处理
  handleDefeat() {
    this.combatOver = true;
    if (this.context.loseNext) {
      this.gameState.player.stats.hp = Math.floor(this.gameState.player.stats.maxHp * 0.3);
    }
  }

  // 获取可战斗物品
  getCombatItems() {
    return this.gameState.player.inventory.filter(i => {
      const data = ItemsData[i.id];
      return data && data.usableInCombat;
    }).map(i => ({ ...i, data: ItemsData[i.id] }));
  }

  // 获取可用攻击技能
  getAttackSkills() {
    return this.gameState.player.skills
      .map(sid => ({ id: sid, ...SkillsData[sid] }))
      .filter(s => s.type === 'attack');
  }

  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
