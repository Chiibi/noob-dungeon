import Phaser from 'phaser'
import { Event } from '~/events/Event'
import { sceneEvents } from '~/events/EventCenter'
import Chest from '~/items/Chests'

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      faune(x: number, y: number, texture: string, frame?: string | number): Faune
    }
  }
}

enum HealthState {
  IDLE,
  DAMAGE,
  DEAD,
}

export default class Faune extends Phaser.Physics.Arcade.Sprite {
  private healthState = HealthState.IDLE
  private damageTime = 0

  private _health = 3
  private _coins = 0

  private _knives?: Phaser.Physics.Arcade.Group
  private _activeChest?: Chest

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame)
  }

  protected preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta)

    switch (this.healthState) {
      case HealthState.DAMAGE:
        this.damageTime += delta
        if (this.damageTime >= 250) {
          this.healthState = HealthState.IDLE
          this.setTint(0xffffff)
          this.damageTime = 0
        }
      default:
        break
    }
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    if (this.healthState === HealthState.DAMAGE || this.healthState === HealthState.DEAD) {
      return
    }

    if (!cursors) {
      return
    }
    if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
      if (this._activeChest) {
        const coins = this._activeChest.open()
        this._coins += coins

        sceneEvents.emit(Event.PLAYER_COINS_CHANGED, this._coins)
      } else {
        this.throwKnife()
      }

      return
    }

    const speed = 100

    const leftDown = cursors.left?.isDown
    const rightDown = cursors.right?.isDown
    const upDown = cursors.up?.isDown
    const downDown = cursors.down?.isDown

    if (leftDown) {
      this.setScale(-1, 1)
      this.body.offset.x = 24
      this.setVelocity(-speed, 0)
      this.anims.play('faune-run-side', true)
    } else if (rightDown) {
      this.setScale(1, 1)
      this.body.offset.x = 8
      this.setVelocity(speed, 0)
      this.anims.play('faune-run-side', true)
    } else if (upDown) {
      this.setVelocity(0, -speed)
      this.anims.play('faune-run-up', true)
    } else if (downDown) {
      this.setVelocity(0, speed)
      this.anims.play('faune-run-down', true)
    } else {
      const parts = this.anims.currentAnim?.key.split('-')
      if (parts) {
        parts[1] = 'idle'
        this.anims.play(parts.join('-'))
      }

      this.setVelocity(0, 0)
    }

    if (leftDown || rightDown || upDown || downDown) {
      this._activeChest = undefined
    }
  }

  private throwKnife() {
    if (!this._knives) return

    const parts = this.anims.currentAnim?.key.split('-')
    const direction = parts[2]

    const vec = new Phaser.Math.Vector2(0, 0)
    switch (direction) {
      case 'up':
        vec.y = -1
        break
      case 'down':
        vec.y = 1
        break
      default:
      case 'side':
        if (this.scaleX < 0) vec.x = -1
        else vec.x = 1
        break
    }

    const angle = vec.angle()
    const knife = this._knives?.get(this.x, this.y, 'knife') as Phaser.Physics.Arcade.Image

    if (direction !== 'side') {
      knife.body.setSize(knife.height, knife.width)
    } else {
      knife.body.setSize(knife.width, knife.height)
      knife.body
    }
    knife.x += vec.x * 16
    knife.y += vec.y * 16
    knife.setActive(true)
    knife.setVisible(true)
    knife.setRotation(angle)
    knife.setVelocity(vec.x * 270, vec.y * 270)
  }

  handleDamage(dir: Phaser.Math.Vector2) {
    if (this._health <= 0) {
      return
    }

    if (this.healthState === HealthState.DAMAGE || this.healthState === HealthState.DEAD) {
      return
    }

    --this._health

    if (this._health <= 0) {
      this.healthState = HealthState.DEAD
      this.anims.play('faune-faint')

      this.setVelocity(0, 0)
    } else {
      this.setVelocity(dir.x, dir.y)

      this.setTint(0xff0000)

      this.healthState = HealthState.DAMAGE
      this.damageTime = 0
    }
  }

  setKnives(knives: Phaser.Physics.Arcade.Group) {
    this._knives = knives
  }

  setChest(chest: Chest) {
    this._activeChest = chest
  }

  get health() {
    return this._health
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'faune',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    var sprite = new Faune(this.scene, x, y, texture, frame)

    this.displayList.add(sprite)
    this.updateList.add(sprite)

    this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)

    sprite.body.setSize(sprite.width * 0.5, sprite.height * 0.4)
    sprite.body.setOffset(8, 16)

    return sprite
  }
)
