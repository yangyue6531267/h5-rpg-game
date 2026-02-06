// ===== 《我把你当师姐》Phaser 3 入口 =====

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config/gameConfig.js';
import { COLORS } from './config/theme.js';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { StoryScene } from './scenes/StoryScene.js';
import { CombatScene } from './scenes/CombatScene.js';
import { CultivationScene } from './scenes/CultivationScene.js';
import { InventoryScene } from './scenes/InventoryScene.js';
import { SaveScene } from './scenes/SaveScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';
import { HUDScene } from './scenes/HUDScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: COLORS.bgDark,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  dom: {
    createContainer: true
  },
  scene: [
    BootScene,
    TitleScene,
    StoryScene,
    CombatScene,
    CultivationScene,
    InventoryScene,
    SaveScene,
    SettingsScene,
    HUDScene
  ]
};

const game = new Phaser.Game(config);
