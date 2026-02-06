// ===== StoryScene：剧情/对话/选择系统 =====

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { COLORS, FONTS, MSG_STYLES } from '../config/theme.js';
import { CharactersData } from '../data/characters.js';
import { MonstersData } from '../data/monsters.js';

export class StoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StoryScene' });
  }

  create() {
    this.gameState = this.registry.get('gameState');
    this.saveSystem = this.registry.get('saveSystem');
    this.typewriterTimer = null;
    this.isTyping = false;
    this.fullText = '';

    // 背景
    this.bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.bgDark);

    // 角色立绘区域（左/右）
    this.leftPortrait = this.add.sprite(160, 260, '__DEFAULT').setScale(3).setVisible(false);
    this.rightPortrait = this.add.sprite(GAME_WIDTH - 160, 260, '__DEFAULT').setScale(3).setVisible(false);

    // 对话框容器
    this.dialogueContainer = this.add.container(0, GAME_HEIGHT - 160);
    this.createDialogueBox();

    // 选择面板容器
    this.choiceContainer = this.add.container(0, 0).setVisible(false);

    // 系统弹窗容器
    this.systemContainer = this.add.container(0, 0).setVisible(false);

    // 过渡容器
    this.transitionContainer = this.add.container(0, 0).setVisible(false);

    // 淡入
    this.cameras.main.fadeIn(500, 10, 10, 15);

    // 加载当前剧情节点
    this.loadNode(this.gameState.player.storyNode);
  }

  createDialogueBox() {
    // 对话框背景
    this.dlgBg = this.add.rectangle(GAME_WIDTH / 2, 80, GAME_WIDTH - 40, 140, 0x0a0a0f, 0.9)
      .setStrokeStyle(1, COLORS.gold, 0.3);
    this.dialogueContainer.add(this.dlgBg);

    // 说话人名字
    this.speakerText = this.add.text(40, 15, '', {
      fontFamily: FONTS.main, fontSize: FONTS.size.md, color: COLORS.goldStr, fontStyle: 'bold'
    });
    this.dialogueContainer.add(this.speakerText);

    // 对话正文
    this.dialogueText = this.add.text(40, 40, '', {
      fontFamily: FONTS.main, fontSize: FONTS.size.md, color: COLORS.textMain,
      wordWrap: { width: GAME_WIDTH - 100 }, lineSpacing: 6
    });
    this.dialogueContainer.add(this.dialogueText);

    // 继续提示
    this.continueHint = this.add.text(GAME_WIDTH - 60, 130, '▼', {
      fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: COLORS.goldStr
    }).setAlpha(0);
    this.dialogueContainer.add(this.continueHint);

    // 闪烁动画
    this.tweens.add({
      targets: this.continueHint,
      alpha: { from: 0, to: 0.8 },
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // 点击继续
    this.dlgBg.setInteractive();
    this.dlgBg.on('pointerdown', () => this.onDialogueClick());
  }

  loadNode(nodeId) {
    const chMatch = nodeId.match(/^ch(\d+)/);
    if (!chMatch) return;
    const chId = 'ch' + chMatch[1].padStart(2, '0');
    const chapterData = this.gameState.chapters[chId];
    if (!chapterData) { console.error('章节未找到:', chId); return; }

    this.gameState.player.chapter = parseInt(chMatch[1]);
    this.gameState.player.storyNode = nodeId;

    const node = chapterData.nodes[nodeId];
    if (!node) { console.error('节点未找到:', nodeId); return; }
    this.currentNode = node;

    // 应用效果
    if (node.effects) {
      this.gameState.applyEffects(node.effects);
    }

    // 自动存档
    this.saveSystem.autoSave(this.gameState.player);

    // 根据类型渲染
    switch (node.type) {
      case 'narration': this.showNarration(node); break;
      case 'dialogue': this.showDialogue(node); break;
      case 'choice': this.showChoice(node); break;
      case 'system': this.showSystemPopup(node); break;
      case 'combat': this.startCombat(node); break;
      case 'transition': this.showTransition(node); break;
      case 'cultivation': this.openCultivation(node); break;
    }
  }

  showNarration(node) {
    this.choiceContainer.setVisible(false);
    this.systemContainer.setVisible(false);
    this.transitionContainer.setVisible(false);
    this.dialogueContainer.setVisible(true);

    this.leftPortrait.setVisible(false);
    this.rightPortrait.setVisible(false);
    this.speakerText.setText('');
    this.nextCallback = () => {
      if (node.next) this.loadNode(node.next);
    };
    this.typewrite(node.text);
  }

  showDialogue(node) {
    this.choiceContainer.setVisible(false);
    this.systemContainer.setVisible(false);
    this.transitionContainer.setVisible(false);
    this.dialogueContainer.setVisible(true);

    // 显示角色名
    const charData = CharactersData[node.speaker];
    const name = charData ? charData.name : node.speaker;
    this.speakerText.setText(name);

    // 显示角色立绘
    const spriteKey = `char_${node.speaker}`;
    if (this.textures.exists(spriteKey)) {
      this.leftPortrait.setTexture(spriteKey, 0).setVisible(true);
      this.leftPortrait.play(`${spriteKey}_idle`);
    } else {
      this.leftPortrait.setVisible(false);
    }

    this.nextCallback = () => {
      if (node.next) this.loadNode(node.next);
    };
    this.typewrite(node.text);
  }

  showChoice(node) {
    this.dialogueContainer.setVisible(true);
    this.choiceContainer.setVisible(true);
    this.systemContainer.setVisible(false);
    this.transitionContainer.setVisible(false);

    // 显示提示文本
    this.speakerText.setText('');
    this.dialogueText.setText(node.text);
    this.isTyping = false;
    this.continueHint.setAlpha(0);

    // 清除旧选项
    this.choiceContainer.removeAll(true);

    // 创建选项按钮
    const startY = GAME_HEIGHT / 2 - (node.choices.length * 25);
    node.choices.forEach((choice, i) => {
      const meetsReq = this.gameState.checkRequirements(choice.requirements);
      const y = startY + i * 50;

      const bg = this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH - 120, 40, COLORS.bgCard, 0.9)
        .setStrokeStyle(1, meetsReq ? COLORS.btnBorder : 0x333333);

      const txt = this.add.text(GAME_WIDTH / 2, y, choice.text, {
        fontFamily: FONTS.main, fontSize: FONTS.size.md,
        color: meetsReq ? COLORS.textMain : '#555555'
      }).setOrigin(0.5);

      this.choiceContainer.add([bg, txt]);

      if (meetsReq) {
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => {
          bg.setStrokeStyle(1, COLORS.gold);
          txt.setColor(COLORS.goldStr);
        });
        bg.on('pointerout', () => {
          bg.setStrokeStyle(1, COLORS.btnBorder);
          txt.setColor(COLORS.textMain);
        });
        bg.on('pointerdown', () => {
          if (choice.effects) {
            this.gameState.applyEffects(choice.effects);
          }
          const nextNode = meetsReq ? choice.next : (choice.failNext || choice.next);
          this.choiceContainer.setVisible(false);
          if (nextNode) this.loadNode(nextNode);
        });
      }
    });
  }

  showSystemPopup(node) {
    this.dialogueContainer.setVisible(false);
    this.choiceContainer.setVisible(false);
    this.transitionContainer.setVisible(false);
    this.systemContainer.removeAll(true);
    this.systemContainer.setVisible(true);

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // 背景遮罩
    const overlay = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);
    this.systemContainer.add(overlay);

    // 弹窗面板
    const panelH = 80 + node.messages.length * 30;
    const panel = this.add.rectangle(cx, cy, 500, panelH, COLORS.bgPanel, 0.95)
      .setStrokeStyle(2, COLORS.systemGreen, 0.6);
    this.systemContainer.add(panel);

    // 标题
    const title = this.add.text(cx, cy - panelH / 2 + 20, node.title, {
      fontFamily: FONTS.main, fontSize: FONTS.size.lg, color: COLORS.systemGreenStr, fontStyle: 'bold'
    }).setOrigin(0.5);
    this.systemContainer.add(title);

    // 消息列表
    node.messages.forEach((msg, i) => {
      const style = MSG_STYLES[msg.style] || MSG_STYLES.info;
      const msgText = this.add.text(cx, cy - panelH / 2 + 50 + i * 28, msg.text, {
        fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: style.color
      }).setOrigin(0.5);
      this.systemContainer.add(msgText);
    });

    // 确认按钮
    const btnY = cy + panelH / 2 - 25;
    const btnBg = this.add.rectangle(cx, btnY, 120, 30, COLORS.bgCard)
      .setStrokeStyle(1, COLORS.systemGreen, 0.6)
      .setInteractive({ useHandCursor: true });
    const btnTxt = this.add.text(cx, btnY, '确  认', {
      fontFamily: FONTS.main, fontSize: FONTS.size.sm, color: COLORS.systemGreenStr
    }).setOrigin(0.5);
    this.systemContainer.add([btnBg, btnTxt]);

    btnBg.on('pointerover', () => btnBg.setFillStyle(COLORS.btnHover));
    btnBg.on('pointerout', () => btnBg.setFillStyle(COLORS.bgCard));
    btnBg.on('pointerdown', () => {
      this.systemContainer.setVisible(false);
      if (node.next) this.loadNode(node.next);
    });

    // 缩放进入动画
    this.systemContainer.setScale(0.8).setAlpha(0);
    this.tweens.add({
      targets: this.systemContainer,
      scale: 1, alpha: 1,
      duration: 250, ease: 'Back.easeOut'
    });
  }

  showTransition(node) {
    this.dialogueContainer.setVisible(false);
    this.choiceContainer.setVisible(false);
    this.systemContainer.setVisible(false);
    this.transitionContainer.removeAll(true);
    this.transitionContainer.setVisible(true);

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const overlay = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.9);
    this.transitionContainer.add(overlay);

    const text = this.add.text(cx, cy, node.text, {
      fontFamily: FONTS.main, fontSize: FONTS.size.xl, color: COLORS.goldStr,
      wordWrap: { width: GAME_WIDTH - 100 }, align: 'center'
    }).setOrigin(0.5).setAlpha(0);
    this.transitionContainer.add(text);

    this.tweens.add({
      targets: text,
      alpha: 1, y: cy - 10,
      duration: 1000, ease: 'Power2',
      onComplete: () => {
        this.tweens.add({
          targets: text,
          alpha: 0,
          duration: 1000,
          delay: 2000,
          onComplete: () => {
            this.transitionContainer.setVisible(false);
            if (node.nextChapter) {
              this.loadNode(node.nextChapter + '_start');
            } else if (node.next) {
              this.loadNode(node.next);
            }
          }
        });
      }
    });
  }

  startCombat(node) {
    const monsterData = MonstersData[node.enemyId];
    if (!monsterData) {
      console.error('怪物未找到:', node.enemyId);
      if (node.winNext) this.loadNode(node.winNext);
      return;
    }

    this.scene.start('CombatScene', {
      monsterData,
      context: {
        winNext: node.winNext,
        loseNext: node.loseNext,
        canFlee: node.canFlee !== false,
        fleeNext: node.fleeNext
      }
    });
    // HUD 隐藏由 CombatScene 控制
  }

  openCultivation(node) {
    this.scene.launch('CultivationScene');
    this.scene.bringToTop('HUDScene');
    // 监听修炼完成
    const onDone = () => {
      this.gameState.events.off('cultivationDone', onDone);
      if (node.next) this.loadNode(node.next);
    };
    this.gameState.events.on('cultivationDone', onDone);
  }

  // 打字机效果
  typewrite(text) {
    this.fullText = text;
    this.dialogueText.setText('');
    this.isTyping = true;
    this.continueHint.setAlpha(0);
    let charIndex = 0;

    if (this.typewriterTimer) this.typewriterTimer.remove();

    this.typewriterTimer = this.time.addEvent({
      delay: this.gameState.textSpeed,
      callback: () => {
        charIndex++;
        this.dialogueText.setText(text.substring(0, charIndex));
        if (charIndex >= text.length) {
          this.isTyping = false;
          this.typewriterTimer.remove();
          this.continueHint.setAlpha(0.8);
        }
      },
      loop: true
    });
  }

  onDialogueClick() {
    if (this.isTyping) {
      // 跳过打字机
      if (this.typewriterTimer) this.typewriterTimer.remove();
      this.dialogueText.setText(this.fullText);
      this.isTyping = false;
      this.continueHint.setAlpha(0.8);
    } else if (this.nextCallback) {
      const cb = this.nextCallback;
      this.nextCallback = null;
      cb();
    }
  }

  shutdown() {
    if (this.typewriterTimer) this.typewriterTimer.remove();
  }
}
