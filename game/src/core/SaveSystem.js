// ===== 存档系统（纯数据，无 DOM） =====

export class SaveSystem {
  constructor() {
    this.SAVE_KEY = 'moshan_rpg_save_';
    this.AUTO_KEY = 'moshan_rpg_auto';
    this.MAX_SLOTS = 3;
  }

  serialize(player) {
    return JSON.stringify({
      player: player,
      timestamp: Date.now(),
      version: '2.0'
    });
  }

  deserialize(json) {
    try {
      return JSON.parse(json);
    } catch (e) {
      console.error('存档解析失败:', e);
      return null;
    }
  }

  autoSave(player) {
    try {
      localStorage.setItem(this.AUTO_KEY, this.serialize(player));
    } catch (e) {
      console.warn('自动存档失败:', e);
    }
  }

  saveToSlot(slot, player) {
    try {
      localStorage.setItem(this.SAVE_KEY + slot, this.serialize(player));
      return true;
    } catch (e) {
      console.error('存档失败:', e);
      return false;
    }
  }

  loadFromSlot(slot) {
    const key = slot === 'auto' ? this.AUTO_KEY : this.SAVE_KEY + slot;
    const json = localStorage.getItem(key);
    if (!json) return null;
    return this.deserialize(json);
  }

  getSlotInfo(slot) {
    const key = slot === 'auto' ? this.AUTO_KEY : this.SAVE_KEY + slot;
    const json = localStorage.getItem(key);
    if (!json) return null;
    const data = this.deserialize(json);
    if (!data) return null;
    return {
      name: data.player.name,
      realm: data.player.realm.display,
      chapter: data.player.chapter,
      timestamp: new Date(data.timestamp).toLocaleString('zh-CN')
    };
  }

  getAllSlotInfo() {
    const slots = [];
    // 自动存档
    slots.push({ id: 'auto', label: '自动存档', info: this.getSlotInfo('auto') });
    // 手动存档
    for (let i = 1; i <= this.MAX_SLOTS; i++) {
      slots.push({ id: i, label: '存档 ' + i, info: this.getSlotInfo(i) });
    }
    return slots;
  }
}
