// ===== CombatScene：HD-2D 横版对峙战斗 =====

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { COLORS, FONTS } from '../config/theme.js';
import { CombatManager } from '../combat/CombatManager.js';
import { HD2DCombatAnimations } from '../combat/HD2DCombatAnimations.js';
import { PostFXManager } from '../effects/PostFXManager.js';
import { ParticleLibrary } from '../effects/ParticleLibrary.js';
import { BackgroundRenderer } from '../effects/BackgroundRenderer.js';
import { GlassPanel } from '../ui/GlassPanel.js';
import { HD2DBar } from '../ui/HD2DBar.js';

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
    this.isPlayerTurn = true;
    this.actionLocked = false;
    this.defending = false;

    // HD-2D 效果系统
    this.postFX = new PostFXManager(this);
    this.particleLib = new ParticleLibrary(this);
    this.anims_ = new HD2DCombatAnimations(this, this.particleLib, this.postFX);

    this.manager.init(this.monsterData, this.combatContext);

    // 应用战斗场景后处理
    this.postFX.applyPreset('combat');

    // 隐藏 HUD
    const hud = this.scene.get('HUDScene');
    if (hud && hud.setVisible) hud.setVisible(false);

    this.createBattleground();
    this.createSprites();
    this.createUI();
    this.createActionButtons();

    // 大气粒子
    this.atmosEmitter = this.particleLib.atmosphericDust();

    // 淡入
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // 战斗开始日志
    this.addLog(`⚔️ ${this.manager.enemy.name} 出现了！`, COLORS.redStr);
    if (this.manager.enemy.systemQuip) {
      this.addLog(`【系统】${this.manager.enemy.systemQuip}`, COLORS.systemGreenStr);
    }
  }

  createBattleground() {
    // HD-2D 多层视差背景
    this.bgRenderer = new BackgroundRenderer(this);
    this.bgRenderer.createCombatBG();
  }

  createSprites() {
    // 128×128, scale 2
    const enemyKey = `monster_${this.monsterData.id}`;
    if (this.textures.exists(enemyKey)) {
      this.enemySprite = this.add.sprite(240, 250, enemyKey).setScale(2);
      this.enemySprite.play(`${enemyKey}_idle`);
    } else {
      this.enemySprite = this.add.rectangle(240, 250, 64, 80, 0x4a2020);
    }

    // 主角贴图分配：站立 + 1/2/3技能
    this.playerCustom = {
      idle: 'player_idle_stand',
      skill1: 'player_skill_1',
      skill2: 'player_skill_2',
      skill3: 'player_skill_3'
    };
    this.useCustomPlayerTextures =
      this.textures.exists(this.playerCustom.idle) &&
      this.textures.exists(this.playerCustom.skill1);

    const playerKey = 'char_chen_dao';
    if (this.useCustomPlayerTextures) {
      const source = this.textures.get(this.playerCustom.idle).getSourceImage();
      const maxSide = Math.max(source.width || 128, source.height || 128);
      const displaySize = 180;
      const scale = displaySize / maxSide;
      this.playerSprite = this.add.sprite(720, 250, this.playerCustom.idle).setScale(scale).setFlipX(true);
    } else if (this.textures.exists(playerKey)) {
      this.playerSprite = this.add.sprite(720, 250, playerKey).setScale(2).setFlipX(true);
      this.playerSprite.play(`${playerKey}_idle`);
    } else {
      this.playerSprite = this.add.rectangle(720, 250, 64, 80, 0x33476d);
    }
  }

  createUI() {
    // 敌方信息面板
    const enemyPanel = GlassPanel.create(this, 140, 50, 240, 55, { accentColor: COLORS.red });
    enemyPanel.container.setAlpha(0.9);

    this.add.text(40, 35, this.manager.enemy.name, {
      fontFamily: FONTS.main, fontSize: FONTS.size.md, color: COLORS.textBright
    });
    this.add.text(40, 55, `Lv.${this.manager.enemy.level}`, {
      fontFamily: FONTS.main, fontSize: FONTS.size.xs, color: COLORS.textDim
    });

    this.enemyHpBarWidget = HD2DBar.create(this, 40, 70, 180, 8, {
      barColor: COLORS.hpBar, glowColor: 0xff6666,
    });

    // 玩家信息面板
    const pY = GAME_HEIGHT - 100;
    const playerPanel = GlassPanel.create(this, 160, pY + 5, 280, 50, { accentColor: COLORS.blue });
    playerPanel.container.setAlpha(0.9);

    this.add.text(40, pY - 12, '陈道', {
      fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: COLORS.textBright
    });

    this.playerHpBarWidget = HD2DBar.create(this, 90, pY - 2, 150, 7, {
      barColor: COLORS.hpBar, glowColor: 0xff6666,
    });
    this.playerSpBarWidget = HD2DBar.create(this, 90, pY + 12, 150, 7, {
      barColor: COLORS.spBar, glowColor: 0x88ccff,
    });

    // 战斗日志
    this.logTexts = [];
    this.logContainer = this.add.container(40, 340);

    this.updateBars();
  }

  createActionButtons() {
    this.actionContainer = this.add.container(0, 0);
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
    const btnY = GAME_HEIGHT - 42;

    actions.forEach((act, i) => {
      const x = startX + (i % 6) * spacing;
      const btn = GlassPanel.createButton(this, x, btnY, 130, 32, act.text, () => {
        if (!this.actionLocked) act.action();
      });
      this.actionContainer.add(btn);
    });
  }

  // === 玩家行动 ===

  async doAttack() {
    if (this.actionLocked || !this.isPlayerTurn) return;
    this.lockActions();

    try {
      this.setPlayerActionTexture(this.playerCustom?.skill1);
      await this.anims_.playerAttack(this.playerSprite, this.enemySprite);
      const result = this.manager.playerAttack();
      await this.anims_.hitEffect(this.enemySprite);
      this.anims_.showDamage(this.enemySprite.x, this.enemySprite.y - 50, result.dmg, result.isCrit);
      this.anims_.screenShake();

      this.addLog(
        `陈道攻击 ${this.manager.enemy.name}，造成 ${result.dmg} 点伤害！${result.isCrit ? '💥暴击！' : ''}`,
        result.isCrit ? COLORS.goldStr : '#ffffff'
      );
      this.restorePlayerIdleTexture();
      this.updateBars();
      this.checkPostAttack(result.enemyDead);
    } catch (e) {
      console.error('doAttack error:', e);
      this.restorePlayerIdleTexture();
      this.updateBars();
      this.unlockActions();
    }
  }

  async doTradeHP() {
    if (this.actionLocked || !this.isPlayerTurn) return;
    this.lockActions();

    try {
      const tradeResult = this.manager.tradeHP();
      this.setPlayerActionTexture(this.playerCustom?.skill2);
      await this.anims_.tradeHPSequence(this.playerSprite, this.enemySprite);
      await this.anims_.hitEffect(this.playerSprite);
      this.anims_.showDamage(this.playerSprite.x, this.playerSprite.y - 50, tradeResult.enemyDmg, false);

      this.addLog(`陈道主动承受攻击！受到 ${tradeResult.enemyDmg} 点伤害！`, COLORS.redStr);
      this.addLog('【杀意沸腾！反击伤害 +80%，必定暴击】', COLORS.goldStr);
      this.updateBars();

      await this.delay(400);
      await this.anims_.playerAttack(this.playerSprite, this.enemySprite);
      const result = this.manager.playerAttack(true);
      await this.anims_.hitEffect(this.enemySprite);
      this.anims_.showDamage(this.enemySprite.x, this.enemySprite.y - 50, result.dmg, true);
      this.anims_.screenShake();

      this.addLog(`陈道以命搏命，造成 ${result.dmg} 点伤害！💥暴击！`, COLORS.goldStr);
      this.restorePlayerIdleTexture();
      this.updateBars();
      this.checkPostAttack(result.enemyDead);
    } catch (e) {
      console.error('doTradeHP error:', e);
      this.restorePlayerIdleTexture();
      this.updateBars();
      this.unlockActions();
    }
  }

  async doDefend() {
    if (this.actionLocked || !this.isPlayerTurn) return;
    this.lockActions();
    this.defending = true;

    const result = this.manager.defend();
    this.anims_.showDamage(this.playerSprite.x, this.playerSprite.y - 50, result.heal, false, true);
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

    const startY = GAME_HEIGHT - 100 - options.length * 38;
    options.forEach((opt, i) => {
      const y = startY + i * 38;
      if (opt.enabled) {
        const btn = GlassPanel.createButton(this, GAME_WIDTH / 2, y, 300, 32, opt.text, () => {
          this.subMenuContainer.setVisible(false);
          opt.action();
        });
        this.subMenuContainer.add(btn);
      } else {
        const bg = this.add.rectangle(GAME_WIDTH / 2, y, 300, 32, 0x1a1a28, 0.8);
        const txt = this.add.text(GAME_WIDTH / 2, y, opt.text, {
          fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: '#555'
        }).setOrigin(0.5);
        this.subMenuContainer.add([bg, txt]);
      }
    });

    const cancelY = startY + options.length * 38;
    const cancelBtn = GlassPanel.createButton(this, GAME_WIDTH / 2, cancelY, 300, 32, '← 返回', () => {
      this.subMenuContainer.setVisible(false);
    }, { color: COLORS.textDim });
    this.subMenuContainer.add(cancelBtn);
  }

  async useSkill(skillId) {
    this.lockActions();
    const result = this.manager.useSkill(skillId);
    if (!result) { this.unlockActions(); return; }

    try {
      this.setPlayerActionTexture(this.getSkillTextureKey(skillId));
      await this.anims_.playerAttack(this.playerSprite, this.enemySprite);
      this.anims_.skillEffect(this.enemySprite.x, this.enemySprite.y, skillId);
      await this.anims_.hitEffect(this.enemySprite);
      this.anims_.showDamage(this.enemySprite.x, this.enemySprite.y - 50, result.dmg, result.isCrit);
      this.anims_.screenShake();

      this.addLog(
        `陈道施展【${result.skill.name}】！造成 ${result.dmg} 点伤害！${result.isCrit ? '💥暴击！' : ''}`,
        result.isCrit ? COLORS.goldStr : COLORS.blueStr
      );
      this.restorePlayerIdleTexture();
      this.updateBars();
      this.checkPostAttack(result.enemyDead);
    } catch (e) {
      console.error('useSkill error:', e);
      this.restorePlayerIdleTexture();
      this.updateBars();
      this.unlockActions();
    }
  }

  async useItem(itemId) {
    this.lockActions();
    const result = this.manager.useCombatItem(itemId);
    if (!result) { this.unlockActions(); return; }

    try {
      if (result.healHp) {
        this.anims_.showDamage(this.playerSprite.x, this.playerSprite.y - 50, result.healHp, false, true);
        this.addLog(`使用【${result.itemName}】，恢复 ${result.healHp} 点血量！`, COLORS.greenStr);
      }
      if (result.healSp) {
        this.addLog(`恢复 ${result.healSp} 点灵力！`, COLORS.blueStr);
      }
      this.updateBars();

      await this.delay(600);
      this.doEnemyTurn();
    } catch (e) {
      console.error('useItem error:', e);
      this.updateBars();
      this.unlockActions();
    }
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
    if (!result) { this.unlockActions(); return; }

    try {
      const enemyKey = `monster_${this.monsterData.id}`;
      if (this.enemySprite.play && this.anims.exists(`${enemyKey}_attack`)) {
        this.enemySprite.play(`${enemyKey}_attack`);
      }
      await this.anims_.enemyAttack(this.enemySprite, this.playerSprite);
      await this.anims_.hitEffect(this.playerSprite);
      this.anims_.showDamage(this.playerSprite.x, this.playerSprite.y - 50, result.dmg, false);

      if (this.enemySprite.play && this.anims.exists(`${enemyKey}_idle`)) {
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
    } catch (e) {
      console.error('doEnemyTurn error:', e);
      this.updateBars();
      if (result.playerDead) {
        this.defeat();
      } else {
        this.unlockActions();
      }
    }
  }

  // === 战斗流程控制 ===

  async checkPostAttack(enemyDead) {
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
      this.endCombat('gameover');
    }
  }

  endCombat(result) {
    if (this.atmosEmitter) this.atmosEmitter.destroy();
    this.postFX.clearAll();

    const hud = this.scene.get('HUDScene');
    if (hud && hud.setVisible) hud.setVisible(true);

    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if (result === 'win' && this.combatContext.winNext) {
        this.scene.start('StoryScene');
        const storyScene = this.scene.get('StoryScene');
        if (storyScene) {
          this.time.delayedCall(100, () => storyScene.loadNode(this.combatContext.winNext));
        }
      } else if (result === 'lose' && this.combatContext.loseNext) {
        this.scene.start('StoryScene');
        const storyScene = this.scene.get('StoryScene');
        if (storyScene) {
          this.time.delayedCall(100, () => storyScene.loadNode(this.combatContext.loseNext));
        }
      } else if (result === 'flee' && this.combatContext.fleeNext) {
        this.scene.start('StoryScene');
        const storyScene = this.scene.get('StoryScene');
        if (storyScene) {
          this.time.delayedCall(100, () => storyScene.loadNode(this.combatContext.fleeNext));
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

    this.enemyHpBarWidget.setValue(Math.max(0, e.currentHp / e.stats.hp), e.currentHp, e.stats.hp);
    this.playerHpBarWidget.setValue(Math.max(0, p.hp / p.maxHp), p.hp, p.maxHp);
    this.playerSpBarWidget.setValue(Math.max(0, p.sp / p.maxSp), p.sp, p.maxSp);
  }

  addLog(text, color = '#d4d0c8') {
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

    this.logTexts.forEach((t, i) => { t.y = i * 18; });
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

  // === 主角技能贴图映射 ===

  getSkillTextureKey(skillId) {
    if (!this.useCustomPlayerTextures) return null;
    if (skillId === 'double_turbo' && this.textures.exists(this.playerCustom.skill2)) {
      return this.playerCustom.skill2;
    }
    if (skillId === 'tongtian_sword_v1' && this.textures.exists(this.playerCustom.skill3)) {
      return this.playerCustom.skill3;
    }
    if (this.textures.exists(this.playerCustom.skill1)) {
      return this.playerCustom.skill1;
    }
    return this.playerCustom.idle;
  }

  setPlayerActionTexture(textureKey) {
    if (!this.useCustomPlayerTextures || !this.playerSprite || !textureKey) return;
    if (this.textures.exists(textureKey) && this.playerSprite.setTexture) {
      this.playerSprite.setTexture(textureKey);
    }
  }

  restorePlayerIdleTexture() {
    if (!this.useCustomPlayerTextures || !this.playerSprite) return;
    if (this.textures.exists(this.playerCustom.idle) && this.playerSprite.setTexture) {
      this.playerSprite.setTexture(this.playerCustom.idle);
    }
  }
}
