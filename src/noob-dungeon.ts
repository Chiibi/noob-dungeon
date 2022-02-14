import Phaser from 'phaser'

import Preload from './scenes/Preload'
import MainScene from './scenes/MainScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 400,
  height: 250,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true,
    },
  },
  scene: [Preload, MainScene],
  scale: {
    zoom: 2,
  },
}

export default new Phaser.Game(config)
