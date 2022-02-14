import Phaser from 'phaser'

export default class Preload extends Phaser.Scene {
  constructor() {
    super('Preload')
  }

  preload() {
    this.load.image('tiles', 'tiles/dungeon_tiles.png')
    this.load.tilemapTiledJSON('dungeon', 'tiles/dungeon-01.json')

    this.load.atlas('faune', 'character/fauna.png', 'character/fauna.json')
    this.load.atlas('lizard', 'enemies/lizard.png', 'enemies/lizard.json')
  }

  create() {
    this.scene.start('MainScene')
  }
}
