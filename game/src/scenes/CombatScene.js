// ===== CombatScene：横版对峙战斗 =====

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { COLORS, FONTS } from '../config/theme.js';
import { CombatManager } from '../combat/CombatManager.js';
import { CombatAnimations } from '../combat/CombatAnimations.js';

export class CombatScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CombatScene' });
  }

  init(data) {
    this.monsterData = data.monsterData;
    this.combatContext = data.context;
  }

  create() {
    this.gameState = this.registry.get('gameState');
    this.manager = new CombatManager(this.gameState);
    this.anims_ = new CombatAnimations(this);
    this.isPlayerTurn = true;
    this.actionLocked = false;
    this.defending = false;

    this.manager.init(this.monsterData, this.combatContext);

    // 隐藏 HUD（战斗有自己的HP条）
    const hud = this.scene.get('HUDScene');
    if (hud && hud.setVisible) hud.setVisible(false);

    this.createBattleground();
    this.createSprites();
    this.createUI();
    this.createActionButtons();

    // 淡入
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // 战斗开始日志
    this.addLog(`⚔️ ${this.manager.enemy.name} 出现了！`, COLORS.redStr);
    if (this.manager.enemy.systemQuip) {
      this.addLog(`【系统】${this.manager.enemy.systemQuip}`, COLORS.systemGreenStr);
    }
  }

  createBattleground() {
    // 背景
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.bgDark);

    // 地面线
    const ground = this.add.graphics();
    ground.lineStyle(1, COLORS.btnBorder, 0.3);
    ground.lineBetween(0, 320, GAME_WIDTH, 320);

    // 装饰横线
    ground.lineStyle(1, COLORS.gold, 0.1);
    ground.lineBetween(100, 310, GAME_WIDTH - 100, 310);
  }

  createSprites() {
    // 敌方 Sprite（左侧）
    const enemyKey = `monster_${this.monsterData.id}`;
    if (this.textures.exists(enemyKey)) {
      this.enemySprite = this.add.sprite(240, 260, enemyKey).setScale(3);
      this.enemySprite.play(`${enemyKey}_idle`);
    } else {
      this.enemySprite = this.add.rectangle(240, 260, 48, 64, 0x4a2020);
    }

    // 玩家 Sprite（右侧）
    const playerKey = 'char_chen_dao';
    if (this.textures.exists(playerKey)) {
      this.playerSprite = this.add.sprite(720, 260, playerKey).setScale(3).setFlipX(true);
      this.playerSprite.play(`${playerKey}_idle`);
    } else {
      this.playerSprite = this.add.rectangle(720, 260, 48, 64, 0x33476d);
    }
  }

  createUI() {
    // 敌方信息
    this.add.text(40, 45, this.manager.enemy.name, {
      fontFamily: FONTS.main, fontSize: FONTS.size.md, color: COLORS.textBright
    });
    this.add.text(40, 65, `Lv.${this.manager.enemy.level}`, {
      fontFamily: FONTS.main, fontSize: FONTS.size.xs, color: COLORS.textDim
    });

    // 敌方HP条
    this.enemyHpBg = this.add.rectangle(40, 85, 200, 10, COLORS.barBg).setOrigin(0, 0.5);
    this.enemyHpBar = this.add.rectangle(40, 85, 200, 10, COLORS.hpBar).setOrigin(0, 0.5);
    this.enemyHpText = this.add.text(245, 85, '', {
      fontFamily: FONTS.main, fontSize: 11, color: COLORS.redStr
    }).setOrigin(0, 0.5);

    // 玩家HP/SP条（底部）
    const pY = GAME_HEIGHT - 95;
    this.add.text(40, pY - 5, '陈道', {
      fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: COLORS.textBright
    });

    this.playerHpBg = this.add.rectangle(100, pY, 160, 8, COLORS.barBg).setOrigin(0, 0.5);
    this.playerHpBar = this.add.rectangle(100, pY, 160, 8, COLORS.hpBar).setOrigin(0, 0.5);
    this.playerHpText = this.add.text(265, pY, '', {
      fontFamily: FONTS.main, fontSize: 10, color: COLORS.redStr
    }).setOrigin(0, 0.5);

    this.playerSpBg = this.add.rectangle(100, pY + 14, 160, 8, COLORS.barBg).setOrigin(0, 0.5);
    this.playerSpBar = this.add.rectangle(100, pY + 14, 160, 8, COLORS.spBar).setOrigin(0, 0.5);
    this.playerSpText = this.add.text(265, pY + 14, '', {
      fontFamily: FONTS.main, fontSize: 10, color: COLORS.blueStr
    }).setOrigin(0, 0.5);

    // 战斗日志
    this.logTexts = [];
    this.logContainer = this.add.container(40, 340);

    this.updateBars();
  }

  createActionButtons() {
    this.actionContainer = this.add.container(0, GAME_HEIGHT - 50);
    this.subMenuContainer = this.add.container(0, 0).setVisible(false);

    const actions = [
      { text: '攻击', action: () => this.doAttack() },
      { text: '技能', action: () => this.showSkillMenu() },
      { text: '以伤换伤', action: () => this.doTradeHP() },
      { text: '防御', action: () => this.doDefend() },
      { text: '物品', action: () => this.showItemMenu() },
      { text: '逃跑', action: () => this.doFlee() }
    ];

    const startX = 80;
    const spacing = 150;

    actions.forEach((act, i) => {
      const x = startX + (i % 6) * spacing;
      const btn = this.createCombatBtn(x, 0, act.text, act.action);
      this.actionContainer.add(btn);
    });
  }

  createCombatBtn(x, y, text, callback) {
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 130, 32, COLORS.bgCard, 0.9)
      .setStrokeStyle(1, COLORS.btnBorder);
    const txt = this.add.text(0, 0, text, {
      fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: COLORS.textMain
    }).setOrigin(0.5);

    container.add([bg, txt]);
    container.setSize(130, 32);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.setStrokeStyle(1, COLORS.gold);
      txt.setColor(COLORS.goldStr);
    });
    container.on('pointerout', () => {
      bg.setStrokeStyle(1, COLORS.btnBorder);
      txt.setColor(COLORS.textMain);
    });
    container.on('pointerdown', () => {
      if (!this.actionLocked) callback();
    });

    return container;
  }

  // === 玩家行动 ===

  async doAttack() {
    if (this.actionLocked || !this.isPlayerTurn) return;
    this.lockActions();

    await this.anims_.playerAttack(this.playerSprite, this.enemySprite);
    const result = this.manager.playerAttack();
    await this.anims_.hitEffect(this.enemySprite);
    this.anims_.showDamage(this.enemySprite.x, this.enemySprite.y - 40, result.dmg, result.isCrit);
    this.anims_.screenShake();

    this.addLog(
      `陈道攻击 ${this.manager.enemy.name}，造成 ${result.dmg} 点伤害！${result.isCrit ? '💥暴击！' : ''}`,
      result.isCrit ? COLORS.goldStr : '#ffffff'
    );
    this.updateBars();

    this.checkPostAttack(result.enemyDead);
  }

  async doTradeHP() {
    if (this.actionLocked || !this.isPlayerTurn) return;
    this.lockActions();

    // 先受伤
    const tradeResult = this.manager.tradeHP();
    await this.anims_.tradeHPSequence(this.playerSprite, this.enemySprite);
    await this.anims_.hitEffect(this.playerSprite);
    this.anims_.showDamage(this.playerSprite.x, this.playerSprite.y - 40, tradeResult.enemyDmg, false);

    this.addLog(`陈道主动承受攻击！受到 ${tradeResult.enemyDmg} 点伤害！`, COLORS.redStr);
    this.addLog('【杀意沸腾！反击伤害 +80%，必定暴击】', COLORS.goldStr);
    this.updateBars();

    // 然后反击
    await this.delay(400);
    await this.anims_.playerAttack(this.playerSprite, this.enemySprite);
    const result = this.manager.playerAttack(true);
    await this.anims_.hitEffect(this.enemySprite);
    this.anims_.showDamage(this.enemySprite.x, this.enemySprite.y - 40, result.dmg, true);
    this.anims_.screenShake();

    this.addLog(
      `陈道以命搏命，造成 ${result.dmg} 点伤害！💥暴击！`,
      COLORS.goldStr
    );
    this.updateBars();

    this.checkPostAttack(result.enemyDead);
  }

  async doDefend() {
    if (this.actionLocked || !this.isPlayerTurn) return;
    this.lockActions();
    this.defending = true;

    const result = this.manager.defend();
    this.anims_.showDamage(this.playerSprite.x, this.playerSprite.y - 40, result.heal, false, true);
    this.addLog(`陈道防御姿态，恢复 ${result.heal} 点血量。`, COLORS.greenStr);
    this.updateBars();

    await this.delay(600);
    this.doEnemyTurn();
  }

  showSkillMenu() {
    if (this.actionLocked || !this.isPlayerTurn) return;
    const skills = this.manager.getAttackSkills();
    this.showSubMenu(skills.map(s => ({
      text: `${s.name} (灵力:${s.spCost})`,
      enabled: this.gameState.player.stats.sp >= s.spCost,
      action: () => this.useSkill(s.id)
    })));
  }

  showItemMenu() {
    if (this.actionLocked || !this.isPlayerTurn) return;
    const items = this.manager.getCombatItems();
    if (items.length === 0) {
      this.showSubMenu([{ text: '没有可用物品', enabled: false, action: () => {} }]);
      return;
    }
    this.showSubMenu(items.map(i => ({
      text: `${i.data.name} x${i.count}`,
      enabled: true,
      action: () => this.useItem(i.id)
    })));
  }

  showSubMenu(options) {
    this.subMenuContainer.removeAll(true);
    this.subMenuContainer.setVisible(true);

    const startY = GAME_HEIGHT - 100 - options.length * 35;
    options.forEach((opt, i) => {
      const y = startY + i * 35;
      const bg = this.add.rectangle(GAME_WIDTH / 2, y, 300, 30, COLORS.bgCard, 0.95)
        .setStrokeStyle(1, opt.enabled ? COLORS.btnBorder : 0x333333);
      const txt = this.add.text(GAME_WIDTH / 2, y, opt.text, {
        fontFamily: FONTS.main, fontSize: FONTS.size.sm,
        color: opt.enabled ? COLORS.textMain : '#555'
      }).setOrigin(0.5);
      this.subMenuContainer.add([bg, txt]);

      if (opt.enabled) {
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => { bg.setStrokeStyle(1, COLORS.gold); txt.setColor(COLORS.goldStr); });
        bg.on('pointerout', () => { bg.setStrokeStyle(1, COLORS.btnBorder); txt.setColor(COLORS.textMain); });
        bg.on('pointerdown', () => { this.subMenuContainer.setVisible(false); opt.action(); });
      }
    });

    // 返回按钮
    const cancelY = startY + options.length * 35;
    const cancelBg = this.add.rectangle(GAME_WIDTH / 2, cancelY, 300, 30, COLORS.bgCard, 0.95)
      .setStrokeStyle(1, COLORS.btnBorder).setInteractive({ useHandCursor: true });
    const cancelTxt = this.add.text(GAME_WIDTH / 2, cancelY, '← 返回', {
      fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: COLORS.textDim
    }).setOrigin(0.5);
    this.subMenuContainer.add([cancelBg, cancelTxt]);
    cancelBg.on('pointerdown', () => this.subMenuContainer.setVisible(false));
  }

  async useSkill(skillId) {
    this.lockActions();
    const result = this.manager.useSkill(skillId);
    if (!result) return;

    await this.anims_.playerAttack(this.playerSprite, this.enemySprite);
    this.anims_.skillEffect(this.enemySprite.x, this.enemySprite.y, skillId);
    await this.anims_.hitEffect(this.enemySprite);
    this.anims_.showDamage(this.enemySprite.x, this.enemySprite.y - 40, result.dmg, result.isCrit);
    this.anims_.screenShake();

    this.addLog(
      `陈道施展【${result.skill.name}】！造成 ${result.dmg} 点伤害！${result.isCrit ? '💥暴击！' : ''}`,
      result.isCrit ? COLORS.goldStr : COLORS.blueStr
    );
    this.updateBars();

    this.checkPostAttack(result.enemyDead);
  }

  async useItem(itemId) {
    this.lockActions();
    const result = this.manager.useCombatItem(itemId);
    if (!result) return;

    if (result.healHp) {
      this.anims_.showDamage(this.playerSprite.x, this.playerSprite.y - 40, result.healHp, false, true);
      this.addLog(`使用【${result.itemName}】，恢复 ${result.healHp} 点血量！`, COLORS.greenStr);
    }
    if (result.healSp) {
      this.addLog(`恢复 ${result.healSp} 点灵力！`, COLORS.blueStr);
    }
    this.updateBars();

    await this.delay(600);
    this.doEnemyTurn();
  }

  async doFlee() {
    if (this.actionLocked || !this.isPlayerTurn) return;
    this.lockActions();

    const result = this.manager.tryFlee();
    if (!result.allowed) {
      this.addLog('无法逃跑！', COLORS.redStr);
      this.unlockActions();
      return;
    }

    if (result.success) {
      this.addLog('成功逃跑！', COLORS.textMain);
      await this.delay(800);
      this.endCombat('flee');
    } else {
      this.addLog('逃跑失败！', COLORS.redStr);
      await this.delay(600);
      this.doEnemyTurn();
    }
  }

  // === 敌人回合 ===

  async doEnemyTurn() {
    if (this.manager.combatOver) return;

    const result = this.manager.enemyTurn(this.defending);
    this.defending = false;
    if (!result) return;

    const enemyKey = `monster_${this.monsterData.id}`;
    if (this.enemySprite.play) {
      this.enemySprite.play(`${enemyKey}_attack`);
    }
    await this.anims_.enemyAttack(this.enemySprite, this.playerSprite);
    await this.anims_.hitEffect(this.playerSprite);
    this.anims_.showDamage(this.playerSprite.x, this.playerSprite.y - 40, result.dmg, false);

    if (this.enemySprite.play) {
      this.enemySprite.play(`${enemyKey}_idle`);
    }

    this.addLog(
      `${this.manager.enemy.name} 使用【${result.skillName}】，造成 ${result.dmg} 点伤害！`,
      COLORS.redStr
    );
    this.updateBars();

    if (result.playerDead) {
      await this.delay(500);
      this.defeat();
    } else {
      await this.delay(400);
      this.unlockActions();
    }
  }

  // === 战斗流程控制 ===

  async checkPostAttack(enemyDead) {
    // Boss 阶段
    const phase = this.manager.checkBossPhase();
    if (phase) {
      this.anims_.bossPhaseEffect();
      if (phase.dialogue) {
        this.addLog(`💬 ${phase.dialogue}`, COLORS.textBright);
      }
      if (phase.buffSelf) {
        this.addLog(`⚡ ${this.manager.enemy.name} 进入${phase.buffSelf}状态！攻击力提升！`, COLORS.redStr);
      }
      await this.delay(800);
    }

    if (enemyDead) {
      await this.delay(300);
      this.victory();
    } else {
      await this.delay(600);
      this.doEnemyTurn();
    }
  }

  async victory() {
    this.manager.combatOver = true;
    if (this.enemySprite.play) {
      const enemyKey = `monster_${this.monsterData.id}`;
      this.enemySprite.play(`${enemyKey}_dead`);
    }
    await this.anims_.deathEffect(this.enemySprite);

    this.addLog(`🎉 击败了 ${this.manager.enemy.name}！`, COLORS.greenStr);

    const rewards = this.manager.getVictoryRewards();
    if (rewards.exp) this.addLog(`获得经验 +${rewards.exp}`, COLORS.greenStr);
    if (rewards.currency) this.addLog(`获得符钱 +${rewards.currency}`, COLORS.goldStr);
    rewards.drops.forEach(name => this.addLog(`获得【${name}】！`, COLORS.goldStr));

    await this.delay(2000);
    this.endCombat('win');
  }

  async defeat() {
    this.manager.handleDefeat();
    this.addLog('💀 陈道倒下了……', COLORS.redStr);

    await this.delay(2000);

    if (this.combatContext.loseNext) {
      this.endCombat('lose');
    } else {
      // 游戏结束
      this.endCombat('gameover');
    }
  }

  endCombat(result) {
    // 恢复 HUD
    const hud = this.scene.get('HUDScene');
    if (hud && hud.setVisible) hud.setVisible(true);

    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if (result === 'win' && this.combatContext.winNext) {
        this.scene.start('StoryScene');
        const storyScene = this.scene.get('StoryScene');
        if (storyScene) {
          this.time.delayedCall(100, () => {
            storyScene.loadNode(this.combatContext.winNext);
          });
        }
      } else if (result === 'lose' && this.combatContext.loseNext) {
        this.scene.start('StoryScene');
        const storyScene = this.scene.get('StoryScene');
        if (storyScene) {
          this.time.delayedCall(100, () => {
            storyScene.loadNode(this.combatContext.loseNext);
          });
        }
      } else if (result === 'flee' && this.combatContext.fleeNext) {
        this.scene.start('StoryScene');
        const storyScene = this.scene.get('StoryScene');
        if (storyScene) {
          this.time.delayedCall(100, () => {
            storyScene.loadNode(this.combatContext.fleeNext);
          });
        }
      } else {
        this.scene.start('TitleScene');
        this.scene.stop('HUDScene');
      }
    });
  }

  // === UI 更新 ===

  updateBars() {
    const p = this.gameState.player.stats;
    const e = this.manager.enemy;

    // 敌方HP
    const eHpRatio = Math.max(0, e.currentHp / e.stats.hp);
    this.tweens.add({ targets: this.enemyHpBar, width: 200 * eHpRatio, duration: 300, ease: 'Power2' });
    this.enemyHpText.setText(`${e.currentHp}/${e.stats.hp}`);

    // 玩家HP
    const pHpRatio = Math.max(0, p.hp / p.maxHp);
    this.tweens.add({ targets: this.playerHpBar, width: 160 * pHpRatio, duration: 300, ease: 'Power2' });
    this.playerHpText.setText(`${p.hp}/${p.maxHp}`);

    // 玩家SP
    const pSpRatio = Math.max(0, p.sp / p.maxSp);
    this.tweens.add({ targets: this.playerSpBar, width: 160 * pSpRatio, duration: 300, ease: 'Power2' });
    this.playerSpText.setText(`${p.sp}/${p.maxSp}`);
  }

  addLog(text, color = '#d4d0c8') {
    // 最多显示4条日志
    if (this.logTexts.length >= 4) {
      const old = this.logTexts.shift();
      old.destroy();
    }

    const txt = this.add.text(0, 0, text, {
      fontFamily: FONTS.main, fontSize: FONTS.size.xs, color: color,
      wordWrap: { width: GAME_WIDTH - 100 }
    });
    this.logContainer.add(txt);
    this.logTexts.push(txt);

    // 重新排列
    this.logTexts.forEach((t, i) => {
      t.y = i * 18;
    });
  }

  lockActions() {
    this.actionLocked = true;
    this.isPlayerTurn = false;
  }

  unlockActions() {
    this.actionLocked = false;
    this.isPlayerTurn = true;
  }

  delay(ms) {
    return new Promise(resolve => this.time.delayedCall(ms, resolve));
  }
}
