import { NotifierInterface } from "src/notify/interface"
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, OneToMany } from "typeorm"
import { BookerInterface, BookerType, createBooker } from "../book/interface"
import TravelEntity from './travel.entity'

@Entity({name: "bookers"})
export default class BookerEntity extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({ nullable: true })
  username?: string

  @Column({ nullable: true })
  password?: string

  @Column({ type: 'varchar' })
  type: BookerType

  @OneToMany(type => TravelEntity, travel => travel.booker)
  travels: TravelEntity[]

  @CreateDateColumn()
  created_at: Date

  toJSON() {
    return Object.assign({}, this, { password: undefined })
  }

  init (travel: TravelEntity, notifier: NotifierInterface): BookerInterface {
    const booker = createBooker(this.type, travel, notifier, {
      username: this.username,
      password: this.password
    })
    return booker
  } 
}