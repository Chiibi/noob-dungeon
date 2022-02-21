import Phaser from 'phaser'
import { Event } from '../events/Event'
import { sceneEvents } from '../events/EventCenter'

export default class GameUI extends Phaser.Scene {
  private _hearts!: Phaser.GameObjects.Group
  private _coin = 0

  constructor() {
    super({ key: 'game-ui' })
  }

  create() {
    const coinsLabel = this.add.text(5, 20, '0')

    sceneEvents.on(Event.PLAYER_COINS_CHANGED, (coins: number) => {
      coinsLabel.text = coins.toString()
    })

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

    sceneEvents.on(Event.PLAYER_HP_CHANGED, this.handlePlayerHealthChanged, this)

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      sceneEvents.off(Event.PLAYER_HP_CHANGED, this.handlePlayerHealthChanged, this)
      sceneEvents.off(Event.PLAYER_COINS_CHANGED)
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
