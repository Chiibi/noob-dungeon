import Phaser from 'phaser'

import Preload from './scenes/Preload'
import MainScene from './scenes/MainScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
    },
  },
  scene: [Preload, MainScene],
}

export default new Phaser.Game(config)
