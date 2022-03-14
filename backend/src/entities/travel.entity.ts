import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, JoinColumn, CreateDateColumn, ManyToOne, DeleteResult, InsertResult, SaveOptions, AfterRemove, RemoveEvent } from "typeorm"
import { BookerInterface } from '../book/interface'
import NotifierEntity from './notifier.entity'
import BookerEntity from './booker.entity'
import CronTravelEntity from './cronTravel.entity'
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
  minMinute?: number

  @Column({ nullable: true })
  maxHour?: number

  @Column({ nullable: true })
  maxMinute?: number

  @ManyToOne(type => NotifierEntity, notifier => notifier.travels)
  @JoinColumn()
  notifier: NotifierEntity

  @Column({ default: false })
  book: boolean

  @Column({ default: false })
  booked: boolean

  @ManyToOne(type => BookerEntity, booker => booker.travels)
  @JoinColumn()
  booker: BookerEntity

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(type => CronTravelEntity, cron => cron.travels, { nullable: true })
  cron?: CronTravelEntity
  
  init (): void {
    logger(`Init booker for ${this.id} (${this.from}-${this.to}_${this.date}) (notifier: '${this.notifier.name}')`)
    bookers.set(this.id, this.booker.init(this, this.notifier.init()))
  }

  public async delete() {
    await bookers.get(this.id)?.destroy()
    bookers.delete(this.id)
    await this.remove()
  }

  static async insertAndCrawl(...args): Promise<TravelEntity> {
    // @ts-ignore
    const res = await this.insert(...args)
    const id = res.generatedMaps[0].id
    const travel = await this.findOne({ id }, { relations: ['notifier', 'booker'] })
    travel.init()
    return travel
  }

  static async deleteOld(): Promise<void> {
    let d = new Date()
    d.setHours(0, 0, 0, 0)
    const travels = await this.createQueryBuilder()
      .select()
      .where(`strftime('%s', date) < '${d.getTime() / 1000}'`)
      .getMany()
    for (const travel of travels) {
      logger(`delete travel ${travel.id}`)
      await travel.delete()
    }
  }

}