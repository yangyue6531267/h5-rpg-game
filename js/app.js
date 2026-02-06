// ===== 游戏入口 =====

(function bootstrapGame() {
  function initModules() {
    game.renderer = new Renderer(game);
    game.saveSystem = new SaveSystem(game);
    game.story = new StorySystem(game);
    game.combat = new CombatSystem(game);
    game.cultivation = new CultivationSystem(game);
    game.inventory = new InventorySystem(game);
    game.relationship = new RelationshipSystem(game);
  }

  function registerChapters() {
    const chapterIds = ['ch01', 'ch02', 'ch03', 'ch04', 'ch05'];
    chapterIds.forEach((id) => {
      const globalKey = 'ChapterData_' + id;
      const data = window[globalKey];
      if (!data) {
        console.warn('章节数据缺失:', id);
        return;
      }
      game.registerChapter(id, data);
    });
  }

  function bindGlobalEvents() {
    // 进入剧情时自动存档
    game.events.on('sceneChanged', (scene) => {
      if (scene === 'story') {
        game.saveSystem.autoSave();
      }
    });

    // 升级提示
    game.events.on('levelUp', (realm) => {
      game.renderer.renderSystemPopup('境界提升', [
        { text: `【突破：${realm.display}】`, style: 'buff' },
        { text: '【系统：恭喜，终于不是纯新手了。】', style: 'snark' }
      ], () => {
        game.switchScene('story');
      });
    });

    // 页面关闭前自动存档
    window.addEventListener('beforeunload', () => {
      game.saveSystem.autoSave();
    });
  }

  function initUIState() {
    const slider = document.getElementById('setting-text-speed');
    if (slider) {
      slider.value = String(game.textSpeed);
      slider.addEventListener('input', () => {
        game.textSpeed = parseInt(slider.value, 10);
      });
    }
    game.renderer.updateHUD();
    game.switchScene('title');
  }

  window.addEventListener('DOMContentLoaded', () => {
    initModules();
    registerChapters();
    bindGlobalEvents();
    initUIState();
    console.log('墨山道RPG 初始化完成');
  });
})();
