import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, JoinColumn, CreateDateColumn, ManyToOne, DeleteResult, InsertResult, SaveOptions } from "typeorm"
import Crawler from '../utils/crawler'
import NotifierEntity from './notifier.entity'
import * as debug from 'debug'
const logger = debug('entity:travel')

const crawlers = new Map<number, Crawler>()

@Entity({name: "travels"})
export default class TravelEntity extends BaseEntity {

  private crawler: Crawler

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

  @CreateDateColumn()
  createdAt: Date
  
  initCrawler (): void {
    logger(`Init crawler for ${this.id} (${this.from}-${this.to}_${this.date}) (notifier: '${this.notifier.name}')`)
    crawlers.set(this.id, new Crawler(this, this.notifier.init()))
  }

  static async insertAndCrawl(...args): Promise<TravelEntity> {
    // @ts-ignore
    const res = await this.insert(...args)
    const id = res.generatedMaps[0].id
    const travel = await this.findOne({ id }, { relations: ['notifier'] })
    travel.initCrawler()
    return travel
  }

  static deleteById(id: string | number): Promise<DeleteResult> {
    if (typeof id === 'string') id = parseInt(id)
    crawlers.get(id).destroy()
    crawlers.delete(id)
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