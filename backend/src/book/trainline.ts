import { BookerInterface, Credentials } from './interface'
import * as fetch from 'node-fetch'
import TravelEntity from '../entities/travel.entity'
import { NotifierInterface } from '../notify/interface'
import { getHourFromDate, getHumanDate } from '../utils/date'
import * as debug from 'debug'

const trainlineStations: TrainlineStation[] = require('../../trainline_stations.json')
export interface TrainlineStation {
  trainlineId: string
  sncfId: string
  name: string
}

const endpoint = 'https://www.trainline.fr/api/v5_1'
const headers = {
  Accept: 'application/json',
  'X-CT-Request-Context': 'user',
  'User-Agent': 'CaptainTrain/63(6301) Android/10(29)',
  'X-CT-Client-Id': '9e60bd6b-af2a-4d4f-be1a-77c554cc87d2',
  'Accept-Language': 'en',
}

type LoginRequest = {
  id: number
  email: string
  password: string
}
type LoginResponse = {
  user: {
    id: string
    first_name: string
    last_name: string
    oldest_departure_date: string // ISO string
    suggested_travels: any[]
    passenger_ids: string[]
    suggested_station_ids: string[] // trainline ids
  }
  meta: {
    token: string
  }
  passengers: {
    id: string
    is_selected: boolean
    first_name: string
    last_name: string
    card_ids: any[]
  }[]
  cards: {
    id: string // trainline id
    created_at: string // iso date
    number: string // sncf number
    reference: 'SNCF.HappyCard' | 'SNCF.CarteVoyageur' | string
  }[]
  errors?: {
    email?: string[]
  }
}
type SearchTrainRequest = {
  search: {
    arrival_station_id: string
    card_ids: string[],
    cuis: {},
    departure_date: string, // ISO date
    departure_station_id: string
    exchangeable_part: null,
    exchangeable_pnr_id: null,
    is_next_available: false,
    is_previous_available: false,
    passenger_ids: string[],
    return_date: null,
    source: null,
    systems: ('sncf' | string)[]
    via_station_id: null
  }
}
type SearchTrainResponse = {
  folders?: {
    id: string
    trip_ids: string[]
    search_id: string
    departure_date: string
    departure_station_id: string // long trainline id
    arrival_date: string
    arrival_station_id: string // long trainline id
    cents: number // should be 0 if the train is free
    system: 'sncf' | 'flixbus' | 'busbud' | 'pao_sncf' | 'pao_ouigo' | string
  }[]
  trips?: {
    id: string
    segment_ids: string[]
    folder_id: string
    departure_date: string
    departure_station_id: string // short trainline id (e.g. 4718)
    arrival_date: string
    arrival_station_id: string // short trainline id (e.g. 4718)
    cents: number // should be 0 if the train is free
    short_unsellable_reason?: string
    long_unsellable_reason?: "Il n’y a plus de places TGVmax disponibles sur ce trajet." | string
  }[]
  segments?: {
    id: string
    trip_id: string
    train?: 'tgv_inoui' | string
    train_name?: 'TGV INOUI' | string
    train_number?: string
    departure_date: string
    departure_station_id: string // short trainline id (e.g. 4718)
    arrival_date: string
    arrival_station_id: string // short trainline id (e.g. 4718)
    carrier: 'sncf' | string
    brand: 'tgvmax' | string
    co2_emission?: number
  }[]
  stations?: {
    id: string // short or long
    name: string // long name (e.g. Lyon (Perrache))
    slug: string // e.g. lyon
  }[]
  search?: {
    id: string
    is_next_available?: boolean
    is_previous_available?: boolean
  }
  error?: string
}
type BookRequest = {
  book: {
    options: Record<string, { // key is segment id
      comfort_class: "pao.default"
      seat: 'no_preference' | 'aisle' | 'twin' | 'lower_deck'
    }>,
    outward_folder_id: string
    search_id: string
  }
}
type BookResponse = {
  pnrs?: { // there is generally only 1 PNR if it's one-way ticket
    id: string
    system: 'pao_sncf' | string
  }[]
  folders?: {
    id: string
    pnr_id: string
    trip_ids: string[]
  }[]
  book?: {
    id: string
    pnr_ids: string[]
  }
}
type PaymentRequest = {
  payment: {
    can_save_payment_card: false,
    card_form_session: null,
    cents: 0,
    currency: 'EUR',
    cvv_code: null,
    device_data: null,
    digitink_value: null,
    expiration_month: null,
    expiration_year: null,
    holder: null,
    is_new_customer: false,
    mean: 'free',
    nonce: null,
    number: null,
    order_id: null,
    payment_card_id: null,
    paypal_country: null,
    paypal_email: null,
    paypal_first_name: null,
    paypal_last_name: null,
    pnr_ids: string[], // this is the only one that matters here
    pro_save_card: false,
    ravelin_device_id: null,
    status: null,
    verification_form: null,
    verification_url: null,
    wants_all_marketing: null
  }
}
type PaymentResponse = {
  payment?: {
    id: string
    status: 'waiting_for_confirmation' | string
  }
}
type ConfirmRequest = {
	payment: {
		after_sales_charge_ids: [],
		can_save_payment_card: false,
		card_form_session: null,
		cents: 0,
		coupon_ids: [],
		currency: 'EUR',
		cvv_code: null,
		device_data: null,
		digitink_value: null,
		exchange_ids: [],
		expiration_month: null,
		expiration_year: null,
		holder: null,
		is_new_customer: false,
		mean: 'free',
		nonce: null,
		number: null,
		order_id: null,
		payment_card_id: null,
		paypal_country: null,
		paypal_email: null,
		paypal_first_name: null,
		paypal_last_name: null,
		pnr_ids: string[], // this is the only one that matters here
		pro_save_card: false,
		ravelin_device_id: null,
		status: 'waiting_for_confirmation',
		subscription_ids: [],
		verification_form: null,
		verification_url: null,
		wants_all_marketing: null
	}
}
type ConfirmResponse = {
  segments?: {
    id: string
    car?: string
    seat?: string
    train_number?: string
  }[]
}

export class TrainlineSearcher implements BookerInterface {
  protected credentials: Credentials
  protected token?: LoginResponse
  protected travel: Pick<TravelEntity, 'from' | 'to' | 'date' | 'minHour' | 'maxHour'>
  protected logger: debug

  protected departureId: string
  protected arrivalId: string

  constructor(travel: TrainlineSearcher['travel'], credentials: Credentials) {
    this.travel = travel
    this.credentials = credentials
    this.logger = debug(`searcher:trainline:${this.travel.from}-${this.travel.to}_${this.travel.date}`)
    this.logger(`Init searcher`)

    this.departureId = trainlineStations.find(s => s.sncfId === this.travel.from).trainlineId
    if (!this.departureId) {
      this.logger(`Cannot get trainline id for station "${this.travel.from}"`)
      return
    }
    this.arrivalId = trainlineStations.find(s => s.sncfId === this.travel.to).trainlineId
    if (!this.arrivalId) {
      this.logger(`Cannot get trainline id for station "${this.travel.to}"`)
      return
    }
  }

  async destroy () {}

  public async list () {
    if (!(await this.checkToken())) {
      await this.login()
    }
    const date = new Date(this.travel.date)
    if (typeof this.travel.minHour !== 'undefined') {
      date.setHours(this.travel.minHour)
    }

    const trips = await this.search({
      departure: date,
      departureStationId: this.departureId,
      arrivalStationId: this.arrivalId,
    })
    if (!trips.trips) {
      this.logger('Response has no trips', trips)
      return []
    }
    const bookableTrips = trips.trips
      .filter(trip => trip.cents === 0 && trip.long_unsellable_reason === undefined) // filter only tgv max trips
      .filter((trip) => {
        // sometimes trainline returns trains that doesn't respect the request
        const date = new Date(trip.departure_date)

        if (this.travel.date.getDay() !== date.getDay() || this.travel.date.getMonth() !== date.getMonth()) {
          return false
        }

        if (this.travel.minHour && date.getHours() < this.travel.minHour) {
          return false
        }
        if (this.travel.maxHour && date.getHours() > this.travel.maxHour) {
          return false
        }
        return true
      })
      .filter((a, i, trips) => {
         // deduplicate travels
        const tripIndex = trips.findIndex((b) => (a.departure_date === b.departure_date && a.arrival_date === b.arrival_date))
        if (tripIndex === i) {
          return true
        }
      })
      .sort((a, b) => a.departure_date.localeCompare(b.departure_date))
      .map(trip => Object.assign(trip, { searchId: trips.search.id }))
    if (bookableTrips.length === 0) {
      this.logger('No bookable trip')
      return []
    }
    this.logger(`Found ${bookableTrips.length} trips`)
    return bookableTrips
  }

  private async search(input: {
    departure: Date
    departureStationId: string,
    arrivalStationId: string
  }): Promise<SearchTrainResponse> {
    const res = await fetch(endpoint + '/search', {
      method: 'POST',
      headers: {
        ...headers,
        'authorization': `Token token="${this.token.meta.token}"`,
        accept: 'application/json, text/javascript, */*; q=0.01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        search: {
          arrival_station_id: input.arrivalStationId,
          card_ids: this.token.passengers[0].card_ids,
          cuis: {},
          departure_date: input.departure.toISOString(),
          departure_station_id: input.departureStationId,
          exchangeable_part: null,
          exchangeable_pnr_id: null,
          is_next_available: false,
          is_previous_available: false,
          passenger_ids: [ this.token.passengers[0].id ],
          return_date: null,
          source: null,
          systems: [
            'sncf',
          ],
          via_station_id: null
        }
      } as SearchTrainRequest),
    })

    const trips: SearchTrainResponse = await res.json()
    return trips
  }

  private async login() {
    this.logger('login')
    const res = await fetch(endpoint + '/account/signin', {
      method: 'POST',
      headers: {
        ...headers,
        accept: 'application/json, text/javascript, */*; q=0.01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        id: 1,
        email: this.credentials.username,
        password: this.credentials.password,
      } as LoginRequest)
    })
    let token: LoginResponse = await res.json()
    this.token = token
    this.token.passengers = token.passengers.filter(p => p.is_selected)
  }

  private async checkToken(): Promise<boolean> {
    if (!this.token) {
      return false
    }

    const res = await fetch(endpoint + '/user', {
      headers: {
        ...headers,
        'authorization': `Token token="${this.token.meta.token}"`,
      }
    })
    return res.ok
  }

  public formatTrip (trip: SearchTrainResponse['trips'][number]) {
    return {
      from: trip.departure_station_id,
      fromFormatted: trainlineStations.find(s => s.trainlineId === trip.departure_station_id).name,
      to: trip.arrival_station_id,
      toFormatted: trainlineStations.find(s => s.trainlineId === trip.arrival_station_id).name,
      departureDate: trip.departure_date,
      formattedDepartureDate: getHumanDate(new Date(trip.departure_date)),
      arrivalDate: trip.arrival_date,
      formattedArrivalDate: getHumanDate(new Date(trip.arrival_date))
    }
  }
}

export default class TrainlineBooker extends TrainlineSearcher {
  private interval: NodeJS.Timeout
  protected travel: TravelEntity
  private notifier: NotifierInterface

  constructor(travel: TravelEntity, notifier: NotifierInterface, credentials: Credentials) {
    super(travel, credentials)
    this.notifier = notifier
    this.logger = debug(`booker:trainline:${this.travel.from}-${this.travel.to}_${this.travel.date}`)
    this.logger(`Init booker`)

    this.interval = setInterval(this.check.bind(this), 1000 * 60 * 30)
    this.interval.unref()

    this.check()
  }

  async destroy () {
    super.destroy()
    clearInterval(this.interval)
  }

  private async check() {
    if (this.travel.booked) {
      this.logger('Already booked: ignore')
      return
    }

    const bookableTrips = await super.list()
    if (bookableTrips.length === 0) {
      this.logger('No bookable trip')
      return
    }
    this.logger(`Found ${bookableTrips.length} trips`)

    const trip = bookableTrips[0]

    await this.notifier.send(this.formatMessageAvailable(bookableTrips))
    if (!this.travel.book) {
      return
    }

    this.logger(`Book trip ${trip.id}`)
    const book = await this.book({ segmentIds: trip.segment_ids, folderId: trip.folder_id, searchId: trip.searchId })
    if (typeof book.book === 'undefined') {
      this.logger(`Unable to book`, book)
      return
    }

    this.logger(`Pay pnr ${book.book.pnr_ids.join(',')}`)
    const payment = await this.payment({ pnrIds: book.book.pnr_ids })

    this.logger(`Confirm payment ${payment.payment.id}`)
    const confirm = await this.confirm({ paymentId: payment.payment.id, pnrIds: book.book.pnr_ids })

    this.logger(`Trip booked!`)
    this.travel.booked = true
    await this.travel.save()

    return this.notifier.send(this.formatMessageBooked(trip, confirm))
  }

  private async book(input: {
    segmentIds: string[]
    folderId: string
    searchId: string
  }): Promise<BookResponse> {
    const options: Record<string, any> = {}
    for (const sid of input.segmentIds) {
      options[sid] = {
        comfort_class: 'pao.default',
        seat: 'no_preference', // TODO: set a preference when creating the booker
      }
    }
    const res = await fetch(endpoint + '/book', {
      method: 'POST',
      headers: {
        ...headers,
        'authorization': `Token token="${this.token.meta.token}"`,
        accept: 'application/json, text/javascript, */*; q=0.01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        book: {
          options: options,
          outward_folder_id: input.folderId,
          search_id: input.searchId,
        }
      } as BookRequest),
    })
    const book: BookResponse = await res.json()
    return book
  }

  private async payment(input: { pnrIds: string[] }) {
    const res = await fetch(endpoint + '/payments', {
      method: 'POST',
      headers: {
        ...headers,
        'authorization': `Token token="${this.token.meta.token}"`,
        accept: 'application/json, text/javascript, */*; q=0.01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        payment: {
          can_save_payment_card: false,
          card_form_session: null,
          cents: 0,
          currency: 'EUR',
          cvv_code: null,
          device_data: null,
          digitink_value: null,
          expiration_month: null,
          expiration_year: null,
          holder: null,
          is_new_customer: false,
          mean: 'free',
          nonce: null,
          number: null,
          order_id: null,
          payment_card_id: null,
          paypal_country: null,
          paypal_email: null,
          paypal_first_name: null,
          paypal_last_name: null,
          pnr_ids: input.pnrIds,
          pro_save_card: false,
          ravelin_device_id: null,
          status: null,
          verification_form: null,
          verification_url: null,
          wants_all_marketing: null
        }
      } as PaymentRequest),
    })
    const payment: PaymentResponse = await res.json()
    return payment
  }

  private async confirm(input: { paymentId: string, pnrIds: string[] }) {
    const res = await fetch(endpoint + '/payments/' + input.paymentId + '/confirm', {
      method: 'POST',
      headers: {
        ...headers,
        'authorization': `Token token="${this.token.meta.token}"`,
        accept: 'application/json, text/javascript, */*; q=0.01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        payment: {
          after_sales_charge_ids: [],
          can_save_payment_card: false,
          card_form_session: null,
          cents: 0,
          coupon_ids: [],
          currency: 'EUR',
          cvv_code: null,
          device_data: null,
          digitink_value: null,
          exchange_ids: [],
          expiration_month: null,
          expiration_year: null,
          holder: null,
          is_new_customer: false,
          mean: 'free',
          nonce: null,
          number: null,
          order_id: null,
          payment_card_id: null,
          paypal_country: null,
          paypal_email: null,
          paypal_first_name: null,
          paypal_last_name: null,
          pnr_ids: input.pnrIds,
          pro_save_card: false,
          ravelin_device_id: null,
          status: 'waiting_for_confirmation',
          subscription_ids: [],
          verification_form: null,
          verification_url: null,
          wants_all_marketing: null
        }
      } as ConfirmRequest)
    })
    const confirm: ConfirmResponse = await res.json()
    return confirm
  }

  private formatMessageAvailable (trips: SearchTrainResponse['trips']): string {
    let content = `Des billets TGVMax sont disponible pour le ${this.travel.date}:`
    trips.forEach((trip) => {
      const formattedTrip = this.formatTrip(trip)
      content += `\n- ${formattedTrip.fromFormatted}-${formattedTrip.toFormatted}: ${formattedTrip.formattedDepartureDate}-${formattedTrip.formattedArrivalDate}`
    })
    if (this.travel.book) {
      content += `\n\nUne reservation va etre tentee pour le premier train.`
    }
    return content
  }

  private formatMessageBooked(trip: SearchTrainResponse['trips'][0], confirm: ConfirmResponse): string {
    let content = `Un billet a ete reserve pour le ${getHumanDate(new Date(trip.departure_date))} et une arrivee le ${getHumanDate(new Date(trip.arrival_date))}:`
    for (const segment of confirm.segments) {
      content += `\n- train ${segment.train_number || 'inconnu'} (voiture ${segment.car || 'inconnue'} siege ${segment.seat || 'inconnu'})`
    }
    return content
  }
}
