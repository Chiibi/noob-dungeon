import Phaser from 'phaser'

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

export default class Lizard extends Phaser.Physics.Arcade.Sprite {
  private direction = Direction.RIGHT

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string
  ) {
    super(scene, x, y, texture, frame)

    this.anims.play('lizard-idle')
  }

  protected preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta)

    const speed = 50

    switch (this.direction) {
      case Direction.UP:
        this.setVelocity(0, -speed)
        break
      case Direction.DOWN:
        this.setVelocity(0, speed)
        break
      case Direction.LEFT:
        this.setVelocity(-speed, 0)
        break
      case Direction.RIGHT:
        this.setVelocity(speed, 0)
        break

      default:
        this.setVelocity(0, 0)
        break
    }
  }
}
