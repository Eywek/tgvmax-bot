import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm'
import BookerEntity from './booker.entity'
import NotifierEntity from './notifier.entity'
import TravelEntity from './travel.entity'
import * as debug from 'debug'
import * as parser from 'cron-parser'
const logger = debug('entity:cronTravel')

@Entity({name: 'cron_travels'})
export default class CronTravelEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  from: string

  @Column()
  to: string

  @Column({ nullable: true })
  minHour?: number

  @Column({ nullable: true })
  minMinute?: number

  @Column({ nullable: true })
  maxHour?: number

  @Column({ nullable: true })
  maxMinute?: number

  @Column()
  cron: string

  @Column()
  maxTravels: number

  @OneToMany(type => TravelEntity, travel => travel.cron)
  travels: TravelEntity[]

  @Column({ nullable: true })
  lastTravelDate?: string

  @ManyToOne(type => NotifierEntity, notifier => notifier.travels) // TODO: oops
  @JoinColumn()
  notifier: NotifierEntity

  @Column({ default: false })
  book: boolean

  @ManyToOne(type => BookerEntity, booker => booker.travels) // TODO: oops
  @JoinColumn()
  booker: BookerEntity

  @CreateDateColumn()
  created_at: Date

  public async run() {
    const travels = await TravelEntity.find({ where: { cron: { id: this.id } } })
    const lastDate = this.lastTravelDate ?? new Date()
    const cron = parser.parseExpression(this.cron, {
      currentDate: lastDate,
    })
    let next: string | undefined
    const newTravels: TravelEntity[] = []

    for (let i = travels.length ; i < this.maxTravels ; i++) {
      const n = cron.next().toDate()
      // trick to get rid of the timezone +-1h
      n.setMinutes(n.getMinutes() - n.getTimezoneOffset())
      next = n.toISOString().split('T')[0]

      newTravels.push(await TravelEntity.insertAndCrawl({
        from: this.from,
        to: this.to,
        minHour: this.minHour,
        minMinute: this.minMinute,
        maxHour: this.maxHour,
        maxMinute: this.maxMinute,
        date: next,
        notifier: this.notifier,
        book: this.book,
        booker: this.booker,
        cron: { id: this.id },
      }))
    }

    this.lastTravelDate = next
    await this.save()
    this.travels = newTravels
  }

  static async insertAndInit(...args): Promise<CronTravelEntity> {
    for (const cron of args) {
      // verify crons syntax
      parser.parseExpression(cron.cron)
    }

    // @ts-ignore
    const res = await this.insert(...args)
    const id = res.generatedMaps[0].id
    const cron = await this.findOne({ id }, { relations: ['notifier', 'booker'] })
    await cron.run()
    return cron
  }

  static async deleteById(id: string | number): Promise<void> {
    if (typeof id === 'string') id = parseInt(id)

    const travels = await TravelEntity.find({ cron: { id } })
    await Promise.all(travels.map(travel => travel.delete()))

    const cron = await CronTravelEntity.findOneOrFail({ id })
    await cron.remove()
  }

  static async reloadCronTravel(id: number) {
    const cron = await CronTravelEntity.findOneOrFail({ id }, { relations: ['notifier', 'booker'] })
    await cron.run()
  }

  static async reloadAll() {
    const crons = await CronTravelEntity.find({ relations: ['notifier', 'booker', 'travels'] })
    await Promise.all(crons.map(async cron => await cron.run()))
    return crons
  }
}