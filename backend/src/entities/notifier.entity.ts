import { NotifierInterface } from '../notify/interface'
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, OneToMany } from 'typeorm'
import SmsNotifier from '../notify/sms'
import TelegramNotifier from '../notify/telegram'
import TravelEntity from './travel.entity'

enum Type {
  sms = 'sms',
  telegram = 'telegram'
}

@Entity({name: "notifiers"})
export default class NotifierEntity extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  username: string

  @Column()
  password: string

  @Column()
  type: Type

  @OneToMany(type => TravelEntity, travel => travel.notifier)
  travels: TravelEntity[]

  @CreateDateColumn()
  created_at: Date

  toJSON() {
    return Object.assign({}, this, { username: undefined, password: undefined })
  }

  init (): NotifierInterface {
    let notifier
    switch (this.type) {
      case Type.sms:
        notifier = SmsNotifier
        break;
      case Type.telegram:
        notifier = TelegramNotifier
        break;
      default:
        throw new Error(`Invalid notifier type: ${this.type}`)
    }
    return new notifier({
      username: this.username,
      password: this.password
    })
  } 
}