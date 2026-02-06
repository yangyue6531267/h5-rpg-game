// ===== 剧情/对话系统 =====

class StorySystem {
  constructor(game) {
    this.game = game;
    this.currentNode = null;
    this.currentChapterData = null;
  }

  // 加载剧情节点
  loadNode(nodeId) {
    // 解析 chXX_xxx 格式获取章节号
    const chMatch = nodeId.match(/^ch(\d+)/);
    if (!chMatch) return;
    const chId = 'ch' + chMatch[1].padStart(2, '0');

    // 获取章节数据
    const chapterData = this.game.chapters[chId];
    if (!chapterData) {
      console.error('章节数据未找到:', chId);
      return;
    }
    this.currentChapterData = chapterData;

    // 更新章节号
    this.game.player.chapter = parseInt(chMatch[1]);
    this.game.player.storyNode = nodeId;

    const node = chapterData.nodes[nodeId];
    if (!node) {
      console.error('节点未找到:', nodeId);
      return;
    }
    this.currentNode = node;

    // 确保在剧情场景
    if (this.game.currentScene !== 'story' && node.type !== 'system') {
      this.game.switchScene('story');
    }

    // 应用节点进入效果
    if (node.effects) {
      this.game.applyEffects(node.effects);
    }

    // 根据节点类型渲染
    switch (node.type) {
      case 'narration':
        this.renderNarration(node);
        break;
      case 'dialogue':
        this.renderDialogue(node);
        break;
      case 'choice':
        this.renderChoice(node);
        break;
      case 'system':
        this.renderSystem(node);
        break;
      case 'combat':
        this.startCombat(node);
        break;
      case 'transition':
        this.renderTransition(node);
        break;
      case 'cultivation':
        this.renderCultivation(node);
        break;
      default:
        console.warn('未知节点类型:', node.type);
    }

    this.game.renderer.updateHUD();
  }

  renderNarration(node) {
    this.game.renderer.renderNarration(node.text, () => {
      if (node.next) this.loadNode(node.next);
    });
  }

  renderDialogue(node) {
    this.game.renderer.renderDialogue(
      node.speaker, node.portrait || 'normal', node.text,
      () => { if (node.next) this.loadNode(node.next); }
    );
  }

  renderChoice(node) {
    // 处理带条件的选项
    const processedChoices = node.choices.map(c => {
      const meetsReq = this.game.checkRequirements(c.requirements);
      return {
        ...c,
        next: meetsReq ? c.next : (c.failNext || c.next),
        _meetsReq: meetsReq
      };
    });
    this.game.renderer.renderChoices(node.text, processedChoices);
  }

  renderSystem(node) {
    this.game.renderer.renderSystemPopup(
      node.title, node.messages,
      () => { if (node.next) this.loadNode(node.next); }
    );
  }

  startCombat(node) {
    // 获取怪物数据
    const monsterData = window.MonstersData ? window.MonstersData[node.enemyId] : null;
    if (!monsterData) {
      console.error('怪物数据未找到:', node.enemyId);
      if (node.winNext) this.loadNode(node.winNext);
      return;
    }
    this.game.combat.startCombat(monsterData, {
      winNext: node.winNext,
      loseNext: node.loseNext,
      canFlee: node.canFlee !== false,
      fleeNext: node.fleeNext,
      preDialogue: node.preDialogue,
      postDialogue: node.postDialogue
    });
  }

  renderTransition(node) {
    this.game.renderer.renderTransition(node.text, node.nextChapter, () => {
      if (node.nextChapter) {
        const nextChId = node.nextChapter;
        const startNode = nextChId + '_start';
        this.loadNode(startNode);
      } else if (node.next) {
        this.loadNode(node.next);
      }
    });
  }

  renderCultivation(node) {
    // 打开修炼界面，完成后继续剧情
    this.game.toggleCultivation();
    // 修炼完成后的回调
    this.game.events.on('cultivationDone', () => {
      this.game.events.off('cultivationDone');
      if (node.next) this.loadNode(node.next);
    });
  }

  // 系统弹窗确认后继续
  continueFromSystem() {
    if (this.currentNode && this.currentNode.next) {
      this.game.switchScene('story');
      this.loadNode(this.currentNode.next);
    }
  }
}
