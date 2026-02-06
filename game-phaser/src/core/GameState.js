// ===== 游戏状态管理（纯数据，无 DOM） =====

import { EventBus } from './EventBus.js';
import { getRealmDisplay, checkLevelUp } from './RealmSystem.js';
import { SkillsData } from '../data/skills.js';
import { ItemsData } from '../data/items.js';
import { CharactersData } from '../data/characters.js';
import {
  ChapterData_ch01,
  ChapterData_ch02,
  ChapterData_ch03,
  ChapterData_ch04,
  ChapterData_ch05
} from '../data/chapters/index.js';

function createDefaultPlayer() {
  return {
    name: '陈道',
    realm: { name: '炼气', level: 1, display: '炼气一层' },
    stats: {
      hp: 100, maxHp: 100,
      sp: 50, maxSp: 50,
      mood: 70, maxMood: 100,
      killIntent: 0,
      attack: 12, defense: 5, speed: 8,
      exp: 0, expToNext: 100
    },
    skills: ['basic_sword'],
    inventory: [],
    equipment: { weapon: null, armor: null, accessory: null },
    currency: 0,
    relationships: {},
    flags: {},
    chapter: 1,
    storyNode: 'ch01_start'
  };
}

export class GameState {
  constructor() {
    this.events = new EventBus();
    this.player = createDefaultPlayer();
    this.textSpeed = 50;
    this.chapters = {};
    this._registerChapters();
  }

  _registerChapters() {
    this.chapters.ch01 = ChapterData_ch01;
    this.chapters.ch02 = ChapterData_ch02;
    this.chapters.ch03 = ChapterData_ch03;
    this.chapters.ch04 = ChapterData_ch04;
    this.chapters.ch05 = ChapterData_ch05;
  }

  // 新游戏
  newGame() {
    this.player = createDefaultPlayer();
    this.events.emit('newGame');
    this.events.emit('stateChanged');
  }

  // 修改属性
  modifyStat(stat, value) {
    const s = this.player.stats;
    if (stat === 'hp') {
      s.hp = Math.max(0, Math.min(s.maxHp, s.hp + value));
    } else if (stat === 'sp') {
      s.sp = Math.max(0, Math.min(s.maxSp, s.sp + value));
    } else if (stat === 'mood') {
      s.mood = Math.max(0, Math.min(s.maxMood, s.mood + value));
    } else if (stat === 'killIntent') {
      s.killIntent = Math.max(0, s.killIntent + value);
    } else if (stat === 'exp') {
      s.exp += value;
      checkLevelUp(this.player, this.events);
    } else if (stat === 'attack') {
      s.attack += value;
    } else if (stat === 'defense') {
      s.defense += value;
    }
    this.events.emit('stateChanged');
  }

  // 标记
  setFlag(key, value) {
    this.player.flags[key] = value;
  }

  getFlag(key) {
    return this.player.flags[key];
  }

  // 物品
  addItem(itemId, count = 1) {
    const existing = this.player.inventory.find(i => i.id === itemId);
    if (existing) {
      existing.count += count;
    } else {
      this.player.inventory.push({ id: itemId, count });
    }
    this.events.emit('itemAdded', { itemId, count });
    this.events.emit('stateChanged');
  }

  removeItem(itemId, count = 1) {
    const idx = this.player.inventory.findIndex(i => i.id === itemId);
    if (idx === -1) return false;
    this.player.inventory[idx].count -= count;
    if (this.player.inventory[idx].count <= 0) {
      this.player.inventory.splice(idx, 1);
    }
    this.events.emit('stateChanged');
    return true;
  }

  hasItem(itemId, count = 1) {
    const item = this.player.inventory.find(i => i.id === itemId);
    return item && item.count >= count;
  }

  // 货币
  addCurrency(amount) {
    this.player.currency += amount;
    this.events.emit('stateChanged');
  }

  // 技能
  learnSkill(skillId) {
    if (!this.player.skills.includes(skillId)) {
      this.player.skills.push(skillId);
      this.events.emit('skillLearned', skillId);
      this.events.emit('stateChanged');
    }
  }

  // 好感度
  modifyRelationship(charId, value) {
    if (!this.player.relationships[charId]) this.player.relationships[charId] = 0;
    this.player.relationships[charId] += value;
    this.events.emit('relationshipChanged', { charId, value: this.player.relationships[charId] });
    this.events.emit('stateChanged');
  }

  getRelationship(charId) {
    return this.player.relationships[charId] || 0;
  }

  getRelationLabel(charId, value) {
    const ch = CharactersData[charId];
    if (ch && ch.relationshipThresholds) {
      const thresholds = Object.keys(ch.relationshipThresholds)
        .map(Number).sort((a, b) => b - a);
      for (const t of thresholds) {
        if (value >= t) return ch.relationshipThresholds[t];
      }
    }
    if (value >= 60) return '亲密';
    if (value >= 30) return '友好';
    if (value >= 0) return '中立';
    if (value >= -30) return '冷淡';
    return '敌意';
  }

  // 效果系统
  applyEffects(effects) {
    if (!effects) return;
    effects.forEach(e => {
      switch (e.type) {
        case 'hp': this.modifyStat('hp', e.value); break;
        case 'sp': this.modifyStat('sp', e.value); break;
        case 'mood': this.modifyStat('mood', e.value); break;
        case 'killIntent': this.modifyStat('killIntent', e.value); break;
        case 'exp': this.modifyStat('exp', e.value); break;
        case 'flag': this.setFlag(e.key, e.value); break;
        case 'item': this.addItem(e.itemId, e.count); break;
        case 'currency': this.addCurrency(e.value); break;
        case 'relationship': this.modifyRelationship(e.charId, e.value); break;
        case 'skill': this.learnSkill(e.skillId); break;
      }
    });
  }

  // 条件检测
  checkRequirements(reqs) {
    if (!reqs || reqs.length === 0) return true;
    return reqs.every(r => {
      switch (r.type) {
        case 'stat': return this.player.stats[r.stat] >= r.min;
        case 'flag': return this.player.flags[r.key] === r.value;
        case 'item': return this.hasItem(r.itemId, r.count);
        case 'relationship': return this.getRelationship(r.charId) >= r.min;
        default: return true;
      }
    });
  }
}
