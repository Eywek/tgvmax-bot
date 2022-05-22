import TravelEntity from '../entities/travel.entity'
import * as express from 'express'
import { TrainlineSearcher } from '../book/trainline'
import BookerEntity from '../entities/booker.entity'

export default class TravelController {

  static get router () {
    const routerTravels = express.Router()
    routerTravels.get('/', this.list)
    routerTravels.post('/', this.create)
    routerTravels.delete('/:id', this.delete)
    routerTravels.get('/journeys', this.listJourneys)
    return routerTravels
  }

  static async list (req: express.Request, res: express.Response) {
    const travels = await TravelEntity.find({ relations: ['notifier', 'booker', 'cron'] })
    return res.send(travels)
  }

  static async create (req: express.Request, res: express.Response) {
    if (!req.body.notifier) return res.status(400).send({ msg: 'You need to provide a notifier.' })
    if (!req.body.booker) return res.status(400).send({ msg: 'You need to provide a booker.' })
    const travel = await TravelEntity.insertAndCrawl(req.body)
    return res.send(travel)
  }

  static async delete (req: express.Request, res: express.Response) {
    const travel = await TravelEntity.findOne({ id: parseInt(req.params.id) })
    if (!travel) return res.status(404).send({ msg: 'Travel is not found' })
    await travel.delete()
    return res.send(travel)
  }

  static async listJourneys (req: express.Request, res: express.Response) {
    if (!req.query.from) return res.status(400).send({ msg: 'You need to provide a from.' })
    if (!req.query.to) return res.status(400).send({ msg: 'You need to provide a to.' })
    if (!req.query.date) return res.status(400).send({ msg: 'You need to provide a date.' })

    const credentials = await BookerEntity.findOne()
    if (!credentials) {
      return res.status(400).send({ msg: 'Unable to find an available booker.' })
    }

    const searcher = new TrainlineSearcher({
      from: req.query.from,
      to: req.query.to,
      date: new Date(req.query.date)
    }, { username: credentials.username!, password: credentials.password! })

    const trips = await searcher.list()
    searcher.destroy()

    return res.send(trips.map(searcher.formatTrip))
  }
}