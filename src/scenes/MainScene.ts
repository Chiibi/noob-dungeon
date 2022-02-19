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
  private knives!: Phaser.Physics.Arcade.Group
  private lizards!: Phaser.Physics.Arcade.Group

  private _playerLizardsCollider?: Phaser.Physics.Arcade.Collider

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

    this.knives = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
    })

    const wallsLayer = map.createLayer('Walls', tileset)

    wallsLayer.setCollisionByProperty({ collides: true })

    // debugDraw(wallsLayer, this)
    this.faune = this.add.faune(128, 128, 'faune', 'walk-down-3.png')
    this.faune.setKnives(this.knives)

    this.cameras.main.startFollow(this.faune, true)

    this.lizards = this.physics.add.group({
      classType: Lizard,
      createCallback: (go) => {
        const LizardGo = go as Lizard
        LizardGo.body.onCollide = true
      },
    })

    this.lizards.get(256, 150, 'lizard')

    this.physics.add.collider(this.faune, wallsLayer)
    this.physics.add.collider(this.lizards, wallsLayer)
    this.physics.add.collider(this.knives, wallsLayer, this.handleKnifeWallCollision, undefined, this)
    this.physics.add.collider(this.knives, this.lizards, this.handleKnifeLizardCollision, undefined, this)

    this._playerLizardsCollider = this.physics.add.collider(
      this.lizards,
      this.faune,
      this.handlePlayerLizardCollision,
      undefined,
      this
    )
  }

  update(time: number, delta: number): void {
    if (this.faune) this.faune.update(this.cursors)
  }

  private handlePlayerLizardCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
    const lizard = obj2 as Lizard
    const dx = this.faune.x - lizard.x
    const dy = this.faune.y - lizard.y

    this.faune.handleDamage(new Phaser.Math.Vector2(dx, dy).normalize().scale(200))

    sceneEvents.emit('player-health-changed', this.faune.health)

    if (this.faune.health <= 0) {
      this._playerLizardsCollider?.destroy()
    }
  }

  private handleKnifeWallCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
    this.knives.killAndHide(obj1)
  }

  private handleKnifeLizardCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
    this.knives.killAndHide(obj1)
    this.lizards.killAndHide(obj2)
  }
}
