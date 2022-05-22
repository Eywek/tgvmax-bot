import fetch from 'node-fetch'
import { NotifierInterface } from '../notify/interface'
import debug from 'debug'
import { BookerInterface } from './interface'
import TravelEntity from '../entities/travel.entity'
import { getDate, getHourFromDate } from '../utils/date'

type Ticket = {
  id: string
  departureDate: Date
  arrivalDate: Date
  duration: number
  totalPrice: number
}

export default class OuiSNCFBooker implements BookerInterface {
  private travel: TravelEntity
  private endpoint: string
  private interval: NodeJS.Timeout
  private notifier: NotifierInterface
  private logger: debug.Debugger

  constructor (travel: TravelEntity, notifier: NotifierInterface) {
    this.travel = travel
    this.notifier = notifier
    this.endpoint = `https://www.oui.sncf/calendar/cdp/api/proposals/v3/outward/${this.travel.from}/${this.travel.to}/${this.travel.date}/12-HAPPY_CARD/2/fr/fr?currency=EUR&onlyDirectTrains=false`
    this.interval = setInterval(this.check.bind(this), 1000 * 60 * 30)
    this.interval.unref()
    this.logger = debug(`booker:ouisncf:${this.travel.from}-${this.travel.to}_${this.travel.date}`)
    this.logger(`Init booker`)

    this.check()
  }

  async destroy () {
    clearInterval(this.interval)
  }

  private get from () {
    // TODO: return real name
    return this.travel.from
  }

  private get to () {
    // TODO: return real name
    return this.travel.to
  }

  private async check () {
    const res = await fetch(this.endpoint, {})
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
      .filter(ticket => !this.travel.minHour || ticket.departureDate.getHours() >= this.travel.minHour)
      .filter(ticket => !this.travel.maxHour || ticket.departureDate.getHours() < this.travel.maxHour)
      .sort((a, b) => a.departureDate.getTime() - b.departureDate.getTime())
    this.logger(`Found ${tickets.length} tickets`)
    if (tickets.length === 0) return

    return this.notifier.send(this.formatMessage(tickets))
  }

  private formatMessage (tickets: Array<Ticket>): string {
    let content = `Des billets TGVMax sont disponible pour le ${getDate(this.travel.date)}:`
    tickets.forEach((ticket) => {
      content += `\n- ${this.from}-${this.to}: ${getHourFromDate(ticket.departureDate)}-${getHourFromDate(ticket.arrivalDate)}`
    })
    if (this.travel.book) {
      content += `\n\n Ce booker ne supporte pas la reservation, vous devez le faire vous-meme.`
    }
    return content
  }
}
