// ===== 《我把你当师姐》游戏引擎核心 =====

// 事件总线
class EventBus {
  constructor() { this.listeners = {}; }
  on(event, cb) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
  }
  emit(event, data) {
    (this.listeners[event] || []).forEach(cb => cb(data));
  }
  off(event, cb) {
    if (!this.listeners[event]) return;
    if (!cb) {
      delete this.listeners[event];
      return;
    }
    this.listeners[event] = this.listeners[event].filter(f => f !== cb);
  }
}

// 默认玩家状态
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

// 境界数据
const REALMS = [
  { name: '炼气', levels: 9, hpBase: 100, spBase: 50, atkBase: 12, defBase: 5 },
  { name: '筑基', levels: 9, hpBase: 500, spBase: 200, atkBase: 50, defBase: 25 }
];

function getRealmDisplay(realm) {
  const nums = ['零','一','二','三','四','五','六','七','八','九'];
  return realm.name + nums[realm.level] + '层';
}

// 游戏主控制器
class Game {
  constructor() {
    this.events = new EventBus();
    this.player = createDefaultPlayer();
    this.currentScene = 'title';
    this.previousScene = null;
    this.story = null;
    this.combat = null;
    this.cultivation = null;
    this.inventory = null;
    this.saveSystem = null;
    this.renderer = null;
    this.relationship = null;
    this.textSpeed = 50;
    this.chapters = {};
  }

  init() {
    // 系统初始化由 app.js 完成
  }

  registerChapter(id, data) {
    this.chapters[id] = data;
  }

  // 场景切换
  switchScene(sceneName) {
    document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('scene-' + sceneName);
    if (el) {
      el.classList.add('active');
      this.previousScene = this.currentScene;
      this.currentScene = sceneName;
    }
    // HUD显示控制
    const hud = document.getElementById('hud');
    if (sceneName === 'title') {
      hud.classList.add('hidden');
    } else {
      hud.classList.remove('hidden');
    }
    this.events.emit('sceneChanged', sceneName);
  }

  // 新游戏
  newGame() {
    this.player = createDefaultPlayer();
    this.switchScene('story');
    this.renderer.updateHUD();
    this.story.loadNode(this.player.storyNode);
  }

  // 读档
  loadGame() {
    this.saveSystem.showLoadPanel();
  }

  // 存档
  saveGame() {
    this.saveSystem.showSavePanel();
  }

  closeSavePanel() {
    this.switchScene(this.previousScene || 'story');
  }

  // 设置
  showSettings() {
    this.switchScene('settings');
  }
  closeSettings() {
    const speed = document.getElementById('setting-text-speed');
    if (speed) this.textSpeed = parseInt(speed.value);
    this.switchScene(this.previousScene || 'title');
  }

  // 背包
  toggleInventory() {
    if (this.currentScene === 'inventory') {
      this.switchScene(this.previousScene || 'story');
    } else {
      this.previousScene = this.currentScene;
      this.switchScene('inventory');
      this.inventory.render();
    }
  }

  // 修炼
  toggleCultivation() {
    if (this.currentScene === 'cultivation') {
      this.closeCultivation();
    } else {
      this.previousScene = this.currentScene;
      this.switchScene('cultivation');
      this.cultivation.render();
    }
  }
  closeCultivation() {
    this.switchScene(this.previousScene || 'story');
  }

  // 修改玩家属性
  modifyStat(stat, value) {
    const s = this.player.stats;
    if (stat === 'hp') s.hp = Math.max(0, Math.min(s.maxHp, s.hp + value));
    else if (stat === 'sp') s.sp = Math.max(0, Math.min(s.maxSp, s.sp + value));
    else if (stat === 'mood') s.mood = Math.max(0, Math.min(s.maxMood, s.mood + value));
    else if (stat === 'killIntent') s.killIntent = Math.max(0, s.killIntent + value);
    else if (stat === 'exp') {
      s.exp += value;
      this.checkLevelUp();
    }
    else if (stat === 'attack') s.attack += value;
    else if (stat === 'defense') s.defense += value;
    this.renderer.updateHUD();
  }

  // 设置剧情标记
  setFlag(key, value) {
    this.player.flags[key] = value;
  }
  getFlag(key) {
    return this.player.flags[key];
  }

  // 添加物品
  addItem(itemId, count) {
    count = count || 1;
    const existing = this.player.inventory.find(i => i.id === itemId);
    if (existing) {
      existing.count += count;
    } else {
      this.player.inventory.push({ id: itemId, count: count });
    }
    this.events.emit('itemAdded', { itemId, count });
  }

  // 移除物品
  removeItem(itemId, count) {
    count = count || 1;
    const idx = this.player.inventory.findIndex(i => i.id === itemId);
    if (idx === -1) return false;
    this.player.inventory[idx].count -= count;
    if (this.player.inventory[idx].count <= 0) {
      this.player.inventory.splice(idx, 1);
    }
    return true;
  }

  hasItem(itemId, count) {
    count = count || 1;
    const item = this.player.inventory.find(i => i.id === itemId);
    return item && item.count >= count;
  }

  // 货币
  addCurrency(amount) {
    this.player.currency += amount;
    this.renderer.updateHUD();
  }

  // 升级检查
  checkLevelUp() {
    const s = this.player.stats;
    while (s.exp >= s.expToNext) {
      s.exp -= s.expToNext;
      const r = this.player.realm;
      r.level++;
      if (r.level > 9) {
        // 突破到下一大境界
        const idx = REALMS.findIndex(rm => rm.name === r.name);
        if (idx < REALMS.length - 1) {
          const next = REALMS[idx + 1];
          r.name = next.name;
          r.level = 1;
          s.maxHp = next.hpBase;
          s.maxSp = next.spBase;
          s.attack = next.atkBase;
          s.defense = next.defBase;
        } else {
          r.level = 9; // 已到顶
          s.exp = 0;
        }
      } else {
        // 小境界提升
        const realmData = REALMS.find(rm => rm.name === r.name);
        const ratio = r.level / 9;
        const nextRealm = REALMS[REALMS.indexOf(realmData) + 1] || realmData;
        s.maxHp = Math.floor(realmData.hpBase + (nextRealm.hpBase - realmData.hpBase) * ratio);
        s.maxSp = Math.floor(realmData.spBase + (nextRealm.spBase - realmData.spBase) * ratio);
        s.attack = Math.floor(realmData.atkBase + (nextRealm.atkBase - realmData.atkBase) * ratio);
        s.defense = Math.floor(realmData.defBase + (nextRealm.defBase - realmData.defBase) * ratio);
      }
      s.hp = s.maxHp;
      s.sp = s.maxSp;
      s.expToNext = Math.floor(s.expToNext * 1.5);
      r.display = getRealmDisplay(r);
      this.events.emit('levelUp', r);
    }
  }

  // 学习技能
  learnSkill(skillId) {
    if (!this.player.skills.includes(skillId)) {
      this.player.skills.push(skillId);
      this.events.emit('skillLearned', skillId);
    }
  }

  // 好感度
  modifyRelationship(charId, value) {
    if (!this.player.relationships[charId]) this.player.relationships[charId] = 0;
    this.player.relationships[charId] += value;
    this.events.emit('relationshipChanged', { charId, value: this.player.relationships[charId] });
  }

  getRelationship(charId) {
    return this.player.relationships[charId] || 0;
  }

  // 应用效果列表
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

  // 检查条件
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

// 全局实例
const game = new Game();
