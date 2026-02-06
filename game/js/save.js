// ===== 存档系统 =====

class SaveSystem {
  constructor(game) {
    this.game = game;
    this.SAVE_KEY = 'moshan_rpg_save_';
    this.AUTO_KEY = 'moshan_rpg_auto';
    this.MAX_SLOTS = 3;
  }

  // 序列化玩家数据
  serialize() {
    return JSON.stringify({
      player: this.game.player,
      timestamp: Date.now(),
      version: '1.0'
    });
  }

  // 反序列化
  deserialize(json) {
    try {
      return JSON.parse(json);
    } catch (e) {
      console.error('存档解析失败:', e);
      return null;
    }
  }

  // 自动存档
  autoSave() {
    try {
      localStorage.setItem(this.AUTO_KEY, this.serialize());
    } catch (e) {
      console.warn('自动存档失败:', e);
    }
  }

  // 手动存档
  saveToSlot(slot) {
    try {
      localStorage.setItem(this.SAVE_KEY + slot, this.serialize());
      return true;
    } catch (e) {
      console.error('存档失败:', e);
      return false;
    }
  }

  // 读取存档
  loadFromSlot(slot) {
    const key = slot === 'auto' ? this.AUTO_KEY : this.SAVE_KEY + slot;
    const json = localStorage.getItem(key);
    if (!json) return null;
    return this.deserialize(json);
  }

  // 获取存档信息
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

  // 应用存档数据
  applyLoad(data) {
    this.game.player = data.player;
    this.game.renderer.updateHUD();
    this.game.switchScene('story');
    this.game.story.loadNode(this.game.player.storyNode);
  }

  // 显示存档面板
  showSavePanel() {
    document.getElementById('save-panel-title').textContent = '💾 存档';
    this.game.switchScene('save');
    this.renderSlots('save');
  }

  // 显示读档面板
  showLoadPanel() {
    document.getElementById('save-panel-title').textContent = '📂 读档';
    this.game.switchScene('save');
    this.renderSlots('load');
  }

  renderSlots(mode) {
    const container = document.getElementById('save-slots');
    container.innerHTML = '';

    // 自动存档槽
    const autoInfo = this.getSlotInfo('auto');
    const autoSlot = this.createSlotElement('auto', '自动存档', autoInfo, mode);
    container.appendChild(autoSlot);

    // 手动存档槽
    for (let i = 1; i <= this.MAX_SLOTS; i++) {
      const info = this.getSlotInfo(i);
      const slot = this.createSlotElement(i, '存档 ' + i, info, mode);
      container.appendChild(slot);
    }
  }

  createSlotElement(slotId, label, info, mode) {
    const div = document.createElement('div');
    div.className = 'save-slot';

    if (info) {
      div.innerHTML = `
        <div class="save-slot-title">${label}</div>
        <div class="save-slot-info">
          ${info.name} | ${info.realm} | 第${info.chapter}章 | ${info.timestamp}
        </div>
      `;
    } else {
      div.innerHTML = `
        <div class="save-slot-title">${label}</div>
        <div class="save-slot-empty">（空）</div>
      `;
    }

    div.onclick = () => {
      if (mode === 'save') {
        if (slotId === 'auto') return; // 不能手动覆盖自动存档
        if (this.saveToSlot(slotId)) {
          alert('存档成功！');
          this.renderSlots(mode);
        }
      } else {
        // 读档
        if (!info) return;
        const data = this.loadFromSlot(slotId);
        if (data) {
          this.applyLoad(data);
        }
      }
    };

    return div;
  }
}
