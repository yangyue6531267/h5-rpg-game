// ===== InventoryScene：背包系统 =====

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { COLORS, FONTS } from '../config/theme.js';
import { ItemsData } from '../data/items.js';
import { SkillsData } from '../data/skills.js';
import { CharactersData } from '../data/characters.js';

export class InventoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'InventoryScene' });
  }

  create() {
    this.gameState = this.registry.get('gameState');
    this.currentTab = 'items';

    // 半透明遮罩
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setInteractive();

    const panelW = 550;
    const panelH = 420;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.add.rectangle(cx, cy, panelW, panelH, COLORS.bgPanel, 0.95)
      .setStrokeStyle(2, COLORS.gold, 0.4);

    // 标题
    this.add.text(cx, cy - panelH / 2 + 20, '背包', {
      fontFamily: FONTS.main, fontSize: FONTS.size.lg, color: COLORS.goldStr
    }).setOrigin(0.5);

    // 标签页
    this.tabs = ['items', 'equipment', 'skills', 'relations'];
    this.tabLabels = ['物品', '装备', '功法', '人物'];
    this.tabButtons = [];

    this.tabs.forEach((tab, i) => {
      const x = cx - panelW / 2 + 60 + i * 130;
      const y = cy - panelH / 2 + 50;
      const txt = this.add.text(x, y, this.tabLabels[i], {
        fontFamily: FONTS.main, fontSize: FONTS.size.sm,
        color: tab === this.currentTab ? COLORS.goldStr : COLORS.textDim
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      txt.on('pointerdown', () => this.switchTab(tab));
      this.tabButtons.push({ tab, text: txt });
    });

    // 内容区域
    this.contentContainer = this.add.container(cx - panelW / 2 + 30, cy - panelH / 2 + 75);

    // 关闭按钮
    const closeBtn = this.add.text(cx + panelW / 2 - 20, cy - panelH / 2 + 15, '✕', {
      fontFamily: FONTS.main, fontSize: FONTS.size.lg, color: COLORS.textDim
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerover', () => closeBtn.setColor(COLORS.redStr));
    closeBtn.on('pointerout', () => closeBtn.setColor(COLORS.textDim));
    closeBtn.on('pointerdown', () => this.scene.stop());

    this.renderContent();
  }

  switchTab(tab) {
    this.currentTab = tab;
    this.tabButtons.forEach(tb => {
      tb.text.setColor(tb.tab === tab ? COLORS.goldStr : COLORS.textDim);
    });
    this.renderContent();
  }

  renderContent() {
    this.contentContainer.removeAll(true);

    switch (this.currentTab) {
      case 'items': this.renderItems(); break;
      case 'equipment': this.renderEquipment(); break;
      case 'skills': this.renderSkills(); break;
      case 'relations': this.renderRelations(); break;
    }
  }

  renderItems() {
    const inv = this.gameState.player.inventory;
    if (inv.length === 0) {
      this.contentContainer.add(this.add.text(0, 0, '背包空空如也……', {
        fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: COLORS.textDim
      }));
      return;
    }

    inv.forEach((item, i) => {
      const data = ItemsData[item.id] || { name: item.id, emoji: '📦', description: '' };
      const y = i * 55;

      const nameText = this.add.text(0, y, `${data.emoji || '📦'} ${data.name} x${item.count}`, {
        fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: COLORS.textMain
      });
      const descText = this.add.text(0, y + 20, data.description || '', {
        fontFamily: FONTS.main, fontSize: FONTS.size.xs, color: COLORS.textDim,
        wordWrap: { width: 400 }
      });
      this.contentContainer.add([nameText, descText]);

      if (data.usable) {
        const useBtn = this.add.text(440, y + 5, '使用', {
          fontFamily: FONTS.main, fontSize: FONTS.size.xs, color: COLORS.greenStr
        }).setInteractive({ useHandCursor: true });
        useBtn.on('pointerover', () => useBtn.setColor(COLORS.goldStr));
        useBtn.on('pointerout', () => useBtn.setColor(COLORS.greenStr));
        useBtn.on('pointerdown', () => {
          this.gameState.removeItem(item.id, 1);
          if (data.healHp) this.gameState.modifyStat('hp', data.healHp);
          if (data.healSp) this.gameState.modifyStat('sp', data.healSp);
          if (data.effects) this.gameState.applyEffects(data.effects);
          this.renderContent(); // 刷新
        });
        this.contentContainer.add(useBtn);
      }
    });
  }

  renderEquipment() {
    const eq = this.gameState.player.equipment;
    const slots = [
      { key: 'weapon', label: '⚔️ 武器' },
      { key: 'armor', label: '🛡️ 护甲' },
      { key: 'accessory', label: '💍 饰品' }
    ];

    slots.forEach((slot, i) => {
      const y = i * 40;
      const equipped = eq[slot.key];
      const data = equipped ? ItemsData[equipped] : null;
      this.contentContainer.add(this.add.text(0, y, `${slot.label}：${data ? data.name : '（空）'}`, {
        fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: COLORS.textMain
      }));
    });
  }

  renderSkills() {
    const skills = this.gameState.player.skills;
    if (skills.length === 0) {
      this.contentContainer.add(this.add.text(0, 0, '尚未习得任何功法', {
        fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: COLORS.textDim
      }));
      return;
    }

    skills.forEach((sid, i) => {
      const sk = SkillsData[sid] || { name: sid };
      const y = i * 45;
      this.contentContainer.add(this.add.text(0, y, `🌀 ${sk.name}`, {
        fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: COLORS.blueStr
      }));
      this.contentContainer.add(this.add.text(0, y + 18, `${sk.description || ''} | 灵力消耗: ${sk.spCost || 0}`, {
        fontFamily: FONTS.main, fontSize: FONTS.size.xs, color: COLORS.textDim,
        wordWrap: { width: 460 }
      }));
    });
  }

  renderRelations() {
    const rels = this.gameState.player.relationships;
    const charIds = Object.keys(rels);

    if (charIds.length === 0) {
      this.contentContainer.add(this.add.text(0, 0, '尚未结识任何人物', {
        fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: COLORS.textDim
      }));
      return;
    }

    charIds.forEach((cid, i) => {
      const ch = CharactersData[cid] || { name: cid };
      const val = rels[cid];
      const label = this.gameState.getRelationLabel(cid, val);
      const y = i * 35;
      const color = val >= 0 ? COLORS.goldStr : COLORS.redStr;

      this.contentContainer.add(this.add.text(0, y, `${ch.portraits?.normal || ''} ${ch.name}`, {
        fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: COLORS.textMain
      }));
      this.contentContainer.add(this.add.text(200, y, `好感度: ${val} (${label})`, {
        fontFamily: FONTS.main, fontSize: FONTS.size.xs, color: color
      }));
    });
  }
}
