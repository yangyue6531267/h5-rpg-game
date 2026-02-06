// ===== 背包/装备系统 =====

class InventorySystem {
  constructor(game) {
    this.game = game;
    this.currentTab = 'items';
  }

  render() {
    this.bindTabs();
    this.renderTab(this.currentTab);
  }

  bindTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTab = btn.dataset.tab;
        this.renderTab(this.currentTab);
      };
    });
  }

  renderTab(tab) {
    const content = document.getElementById('inventory-content');
    switch (tab) {
      case 'items': this.renderItems(content); break;
      case 'equipment': this.renderEquipment(content); break;
      case 'skills': this.renderSkills(content); break;
      case 'relations': this.renderRelations(content); break;
    }
  }

  renderItems(el) {
    const inv = this.game.player.inventory;
    const itemsData = window.ItemsData || {};
    if (inv.length === 0) {
      el.innerHTML = '<p style="color:var(--text-dim);padding:1rem">背包空空如也……</p>';
      return;
    }
    el.innerHTML = '';
    inv.forEach(item => {
      const data = itemsData[item.id] || { name: item.id, description: '' };
      const div = document.createElement('div');
      div.className = 'inv-item';
      div.innerHTML = `
        <div>
          <span class="inv-item-name">${data.emoji || '📦'} ${data.name}</span>
          <span class="inv-item-count">x${item.count}</span>
        </div>
        <div style="font-size:0.8rem;color:var(--text-dim)">${data.description || ''}</div>
      `;
      // 可使用的物品
      if (data.usable && this.game.currentScene !== 'combat') {
        const useBtn = document.createElement('button');
        useBtn.className = 'btn-hud';
        useBtn.textContent = '使用';
        useBtn.onclick = () => this.useItem(item.id, data);
        div.appendChild(useBtn);
      }
      el.appendChild(div);
    });
  }

  useItem(itemId, data) {
    this.game.removeItem(itemId, 1);
    if (data.healHp) this.game.modifyStat('hp', data.healHp);
    if (data.healSp) this.game.modifyStat('sp', data.healSp);
    if (data.effects) this.game.applyEffects(data.effects);
    this.game.renderer.updateHUD();
    this.render();
  }

  renderEquipment(el) {
    const eq = this.game.player.equipment;
    const itemsData = window.ItemsData || {};
    el.innerHTML = '';
    const slots = [
      { key: 'weapon', label: '⚔️ 武器' },
      { key: 'armor', label: '🛡️ 护甲' },
      { key: 'accessory', label: '💍 饰品' }
    ];
    slots.forEach(slot => {
      const div = document.createElement('div');
      div.className = 'inv-item';
      const equipped = eq[slot.key];
      const data = equipped ? (itemsData[equipped] || { name: equipped }) : null;
      div.innerHTML = `
        <span class="inv-item-name">${slot.label}：${data ? data.name : '（空）'}</span>
      `;
      el.appendChild(div);
    });
  }

  renderSkills(el) {
    const skills = this.game.player.skills;
    const skillsData = window.SkillsData || {};
    el.innerHTML = '';
    if (skills.length === 0) {
      el.innerHTML = '<p style="color:var(--text-dim);padding:1rem">尚未习得任何功法</p>';
      return;
    }
    skills.forEach(sid => {
      const sk = skillsData[sid] || { name: sid };
      const div = document.createElement('div');
      div.className = 'inv-item';
      div.innerHTML = `
        <div>
          <span class="inv-item-name" style="color:var(--accent-blue)">🌀 ${sk.name}</span>
        </div>
        <div style="font-size:0.8rem;color:var(--text-dim)">
          ${sk.description || ''} | 灵力消耗：${sk.spCost || 0}
        </div>
      `;
      el.appendChild(div);
    });
  }

  renderRelations(el) {
    const rels = this.game.player.relationships;
    const charsData = window.CharactersData || {};
    el.innerHTML = '';
    const charIds = Object.keys(rels);
    if (charIds.length === 0) {
      el.innerHTML = '<p style="color:var(--text-dim);padding:1rem">尚未结识任何人物</p>';
      return;
    }
    charIds.forEach(cid => {
      const ch = charsData[cid] || { name: cid };
      const val = rels[cid];
      const label = this.getRelationLabel(cid, val);
      const div = document.createElement('div');
      div.className = 'inv-item';
      const emoji = ch.portraits ? (ch.portraits.normal || '') : '';
      div.innerHTML = `
        <div>
          <span class="inv-item-name">${emoji} ${ch.name}</span>
          <span style="color:${val >= 0 ? 'var(--accent-gold)' : 'var(--accent-red)'};font-size:0.85rem">
            好感度：${val} (${label})
          </span>
        </div>
      `;
      el.appendChild(div);
    });
  }

  getRelationLabel(charId, value) {
    const charsData = window.CharactersData || {};
    const ch = charsData[charId];
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
}
