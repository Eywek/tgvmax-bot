import * as fetch from 'node-fetch'
import { NotifierInterface } from '../notify/interface'
import * as debug from 'debug'

type Ticket = {
  id: string
  departureDate: Date
  arrivalDate: Date
  duration: number
  totalPrice: number
}
type Options = {
  from: string
  to: string
  date: Date
  minHour?: number
  maxHour?: number
}
const defaultOptions: Options = {
  from: undefined,
  to: undefined,
  date: undefined,
  minHour: 0,
  maxHour: 23
}

export default class Crawler {
  private options: Options
  private endpoint: string
  private interval: NodeJS.Timeout
  private notifier: NotifierInterface
  private logger: debug

  constructor (options: Options, notifier: NotifierInterface) {
    this.options = { ...defaultOptions, ...options }
    this.notifier = notifier
    this.endpoint = `https://www.oui.sncf/calendar/cdp/api/proposals/v3/outward/${this.options.from}/${this.options.to}/${this.date}/12-HAPPY_CARD/2/fr/fr?currency=EUR&onlyDirectTrains=false`
    this.interval = setInterval(this.check.bind(this), 1000 * 60 * 30)
    this.interval.unref()
    this.logger = debug(`crawler:${this.options.from}-${this.options.to}_${this.date}`)
    this.logger(`Init crawler`)

    this.check()
  }

  destroy () {
    clearInterval(this.interval)
  }

  private get date () {
    return this.options.date.toISOString().split('T')[0]
  }

  private get from () {
    // TODO: return real name
    return this.options.from
  }

  private get to () {
    // TODO: return real name
    return this.options.to
  }

  private async check () {
    const res = await fetch(this.endpoint)
    let tickets: Array<Ticket> = await res.json()
    // @ts-ignore
    if (tickets.errorCode) return
    tickets = tickets
      .map(ticket => {
        ticket.arrivalDate = new Date(ticket.arrivalDate)
        ticket.departureDate = new Date(ticket.departureDate)
        return ticket
      })
      .filter(ticket => ticket.totalPrice === 0)
      .filter(ticket => !this.options.minHour || ticket.departureDate.getHours() >= this.options.minHour)
      .filter(ticket => !this.options.maxHour || ticket.departureDate.getHours() < this.options.maxHour)
      .sort((a, b) => a.departureDate.getTime() - b.departureDate.getTime())
    this.logger(`Found ${tickets.length} tickets`)
    if (tickets.length === 0) return

    return this.notifier.send(this.formatMessage(tickets))
  }

  private getHourFromDate (date: Date) {
    return date.getHours().toString().padStart(2, '0') + 'h' +
      date.getMinutes().toString().padStart(2, '0')
  }

  private formatMessage (tickets: Array<Ticket>): string {
    let content = `Des billets TGVMax sont disponible pour le ${this.date}:`
    tickets.forEach((ticket) => {
      content += `\n- ${this.from}-${this.to}: ${this.getHourFromDate(ticket.departureDate)}-${this.getHourFromDate(ticket.arrivalDate)}`
    })
    return content
  }
}
