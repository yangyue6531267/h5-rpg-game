// 游戏画布配置
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

// Phaser Scale 配置
export const SCALE_CONFIG = {
  mode: Phaser.Scale.FIT,
  autoCenter: Phaser.Scale.CENTER_BOTH,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  min: {
    width: 480,
    height: 270
  }
};
