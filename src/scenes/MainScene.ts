import Phaser from 'phaser'
import { createCharacterAnims } from '~/anims/CharacterAnims'
import { createLizardAnims } from '~/anims/EnemyAnims'
import Lizard from '~/enemies/Lizard'
import { debugDraw } from '~/utils/debug'
import '~/characters/Faune'
import Faune from '~/characters/Faune'
import { sceneEvents } from '~/events/EventCenter'

export default class MainScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private faune!: Faune

  constructor() {
    super('MainScene')
  }

  preload() {
    this.cursors = this.input.keyboard.createCursorKeys()
  }

  create() {
    this.scene.run('game-ui')

    createLizardAnims(this.anims)
    createCharacterAnims(this.anims)

    const map = this.make.tilemap({ key: 'dungeon' })
    const tileset = map.addTilesetImage('dungeon', 'tiles', 16, 16)

    map.createLayer('Ground', tileset)
    const wallsLayer = map.createLayer('Walls', tileset)

    wallsLayer.setCollisionByProperty({ collides: true })

    // debugDraw(wallsLayer, this)
    this.faune = this.add.faune(128, 128, 'faune', 'walk-down-3.png')

    this.cameras.main.startFollow(this.faune, true)

    const lizards = this.physics.add.group({
      classType: Lizard,
      createCallback: (go) => {
        const LizardGo = go as Lizard
        LizardGo.body.onCollide = true
      },
    })

    lizards.get(256, 150, 'lizard')

    this.physics.add.collider(this.faune, wallsLayer)
    this.physics.add.collider(lizards, wallsLayer)
    this.physics.add.collider(lizards, this.faune, this.handlePlayerLizardCollision, undefined, this)
  }

  private handlePlayerLizardCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
    const lizard = obj2 as Lizard
    const dx = this.faune.x - lizard.x
    const dy = this.faune.y - lizard.y

    this.faune.handleDamage(new Phaser.Math.Vector2(dx, dy).normalize().scale(200))

    sceneEvents.emit('player-health-changed', this.faune.health)
  }

  update(time: number, delta: number): void {
    if (this.faune) this.faune.update(this.cursors)
  }
}
