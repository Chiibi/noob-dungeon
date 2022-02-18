import Phaser from 'phaser'
import { sceneEvents } from '~/events/EventCenter'

export default class GameUI extends Phaser.Scene {
  private _hearts!: Phaser.GameObjects.Group

  constructor() {
    super({ key: 'game-ui' })
  }

  create() {
    this._hearts = this.add.group({
      classType: Phaser.GameObjects.Image,
    })

    this._hearts.createMultiple({
      key: 'ui-heart-full',
      setXY: {
        x: 10,
        y: 10,
        stepX: 16,
      },
      quantity: 3,
    })

    sceneEvents.on('player-health-changed', this.handlePlayerHealthChanged, this)

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      sceneEvents.off('player-health-changed', this.handlePlayerHealthChanged, this)
    })
  }

  private handlePlayerHealthChanged(health: number) {
    this._hearts.children.each((go, idx) => {
      const heart = go as Phaser.GameObjects.Image
      if (idx >= health) {
        heart.setTexture('ui-heart-empty')
      }
    })
  }
}
