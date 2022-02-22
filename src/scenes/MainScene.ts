import Phaser from 'phaser'
import { createCharacterAnims } from '../anims/CharacterAnims'
import { createLizardAnims } from '../anims/EnemyAnims'
import Lizard from '../enemies/Lizard'
import { debugDraw } from '../utils/debug'
import '../characters/Faune'
import Faune from '../characters/Faune'
import { sceneEvents } from '../events/EventCenter'
import { createChestAnims } from '../anims/TreasureAnims'
import Chest from '../items/Chests'
import { Event } from '../events/Event'

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
    createChestAnims(this.anims)

    const map = this.make.tilemap({ key: 'dungeon' })
    const tileset = map.addTilesetImage('dungeon', 'tiles', 16, 16)

    map.createLayer('Ground', tileset)

    this.knives = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
    })

    const wallsLayer = map.createLayer('Walls', tileset)

    wallsLayer.setCollisionByProperty({ collides: true })

    const chests = this.physics.add.staticGroup({
      classType: Chest,
    })
    const chestsLayer = map.getObjectLayer('Chests')
    chestsLayer.objects.forEach((obj) => {
      chests.get(obj.x! + obj.width! / 2, obj.y! - obj.height! / 2, 'treasure')
    })

    this.faune = this.add.faune(128, 128, 'faune', 'walk-down-3.png')
    this.faune.setKnives(this.knives)

    map.createLayer('WallsEdge', tileset)

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
    this.physics.add.collider(this.knives, wallsLayer, this.handleKnifeImmortalObjCollision, undefined, this)
    this.physics.add.collider(this.knives, this.lizards, this.handleKnifeLizardCollision, undefined, this)
    this.physics.add.collider(this.knives, chests, this.handleKnifeImmortalObjCollision, undefined, this)

    this.physics.add.collider(this.faune, chests, this.handlePlayerChestCollision, undefined, this)

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

  private handlePlayerChestCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
    const chest = obj2 as Chest
    this.faune.setChest(chest)
  }

  private handlePlayerLizardCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
    const lizard = obj2 as Lizard
    const dx = this.faune.x - lizard.x
    const dy = this.faune.y - lizard.y

    this.faune.handleDamage(new Phaser.Math.Vector2(dx, dy).normalize().scale(200))

    sceneEvents.emit(Event.PLAYER_HP_CHANGED, this.faune.health)

    if (this.faune.health <= 0) {
      this._playerLizardsCollider?.destroy()
    }
  }

  private handleKnifeImmortalObjCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
    this.knives.remove(obj1, false, true)
  }

  private handleKnifeLizardCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
    this.knives.remove(obj1, false, true)
    this.lizards.remove(obj2, false, true)
  }
}
