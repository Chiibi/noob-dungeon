import Phaser from 'phaser'
import { createCharacterAnims } from '~/anims/CharacterAnims'
import { createLizardAnims } from '~/anims/EnemyAnims'
import Lizard from '~/enemies/Lizard'
import { debugDraw } from '~/utils/debug'

export default class MainScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private faune!: Phaser.Physics.Arcade.Sprite

  constructor() {
    super('MainScene')
  }

  preload() {
    this.cursors = this.input.keyboard.createCursorKeys()
  }

  create() {
    createLizardAnims(this.anims)
    createCharacterAnims(this.anims)

    const map = this.make.tilemap({ key: 'dungeon' })
    const tileset = map.addTilesetImage('dungeon', 'tiles', 16, 16)

    map.createLayer('Ground', tileset)
    const wallsLayer = map.createLayer('Walls', tileset)

    wallsLayer.setCollisionByProperty({ collides: true })

    // debugDraw(wallsLayer, this)

    this.faune = this.physics.add.sprite(128, 128, 'faune', 'walk-down-3.png')
    this.faune.body.setSize(this.faune.width * 0.5, this.faune.height * 0.4)
    this.faune.body.setOffset(8, 16)

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
  }

  update(time: number, delta: number): void {
    if (!this.cursors || !this.faune) {
      return
    }

    const speed = 100

    if (this.cursors.left?.isDown) {
      this.faune.setScale(-1, 1)
      this.faune.body.offset.x = 24
      this.faune.anims.play('faune-run-side', true)
      this.faune.setVelocity(-speed, 0)
    } else if (this.cursors.right?.isDown) {
      this.faune.setScale(1, 1)
      this.faune.body.offset.x = 8
      this.faune.anims.play('faune-run-side', true)
      this.faune.setVelocity(speed, 0)
    } else if (this.cursors.up?.isDown) {
      this.faune.anims.play('faune-run-up', true)
      this.faune.setVelocity(0, -speed)
    } else if (this.cursors.down?.isDown) {
      this.faune.anims.play('faune-run-down', true)
      this.faune.setVelocity(0, speed)
    } else {
      const parts = this.faune.anims.currentAnim?.key.split('-')
      if (parts) {
        parts[1] = 'idle'
        this.faune.anims.play(parts.join('-'))
      }

      this.faune.setVelocity(0, 0)
    }
  }
}
