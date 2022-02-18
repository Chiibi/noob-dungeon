import Phaser from 'phaser'

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

    const speed = 100

    if (cursors.left?.isDown) {
      this.setScale(-1, 1)
      this.body.offset.x = 24
      this.setVelocity(-speed, 0)
      this.anims.play('faune-run-side', true)
    } else if (cursors.right?.isDown) {
      this.setScale(1, 1)
      this.body.offset.x = 8
      this.setVelocity(speed, 0)
      this.anims.play('faune-run-side', true)
    } else if (cursors.up?.isDown) {
      this.setVelocity(0, -speed)
      this.anims.play('faune-run-up', true)
    } else if (cursors.down?.isDown) {
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
