import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, JoinColumn, CreateDateColumn, ManyToOne, DeleteResult, InsertResult, SaveOptions } from "typeorm"
import { BookerInterface } from '../book/interface'
import NotifierEntity from './notifier.entity'
import BookerEntity from './booker.entity'
import * as debug from 'debug'
const logger = debug('entity:travel')

const bookers = new Map<number, BookerInterface>()

@Entity({name: "travels"})
export default class TravelEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  from: string

  @Column()
  to: string

  @Column()
  date: Date

  @Column({ nullable: true })
  minHour?: number

  @Column({ nullable: true })
  maxHour?: number

  @ManyToOne(type => NotifierEntity, notifier => notifier.travels)
  @JoinColumn()
  notifier: NotifierEntity

  @Column({ default: false })
  book: boolean

  @ManyToOne(type => BookerEntity, booker => booker.travels)
  @JoinColumn()
  booker: BookerEntity

  @CreateDateColumn()
  createdAt: Date
  
  init (): void {
    logger(`Init booker for ${this.id} (${this.from}-${this.to}_${this.date}) (notifier: '${this.notifier.name}')`)
    bookers.set(this.id, this.booker.init(this, this.notifier.init()))
  }

  static async insertAndCrawl(...args): Promise<TravelEntity> {
    // @ts-ignore
    const res = await this.insert(...args)
    const id = res.generatedMaps[0].id
    const travel = await this.findOne({ id }, { relations: ['notifier', 'booker'] })
    travel.init()
    return travel
  }

  static async deleteById(id: string | number): Promise<DeleteResult> {
    if (typeof id === 'string') id = parseInt(id)
    await bookers.get(id).destroy()
    bookers.delete(id)
    return this.delete({ id })
  }

  static async deleteOld(): Promise<DeleteResult> {
    let d = new Date()
    d.setHours(0, 0, 0, 0)
    return this.createQueryBuilder()
      .delete()
      .where(`strftime('%s', date) < '${d.getTime() / 1000}'`)
      .execute()
  }

}