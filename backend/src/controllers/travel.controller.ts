import TravelEntity from '../entities/travel.entity'
import * as express from 'express'
import { TrainlineAuthentifier, TrainlineSearcher, TrainlineBooker } from '../book/trainline'
import BookerEntity from '../entities/booker.entity'
import { Readable, Transform } from 'stream'
import { getHumanDate } from '../utils/date'

type AsyncIteratorResult<T> = T extends AsyncIterable<infer U> ? U : T

export default class TravelController {

  static get router () {
    const routerTravels = express.Router()
    routerTravels.get('/', this.list)
    routerTravels.post('/', this.create)
    routerTravels.delete('/:id', this.delete)
    routerTravels.get('/journeys', this.listJourneys)
    routerTravels.post('/journeys/book', this.bookJourney)
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
    if (!req.query.bookerId) return res.status(400).send({ msg: 'You need to provide a bookerId.' })

    const booker = await BookerEntity.findOne(String(req.query.bookerId))
    if (!booker) {
      return res.status(400).send({ msg: 'Unable to find the booker.' })
    }

    const searcher = new TrainlineSearcher({
      from: String(req.query.from),
      to: String(req.query.to),
      date: new Date(String(req.query.date))
    }, { username: booker.username!, password: booker.password! })

    res.setHeader('Content-Type', 'application/ndjson; charset=utf-8')
    const iterable = searcher.getTrips(typeof req.query.untilDate === 'string' ? new Date(req.query.untilDate) : undefined)
    const stream = Readable.from(iterable, { objectMode: true })
    stream.on('end', () => searcher.destroy())

    stream
      .pipe(
        new Transform({
          objectMode: true,
          transform ({ trips, lastDate }: AsyncIteratorResult<ReturnType<TrainlineSearcher['getTrips']>>, encoding, next) {
            this.push(
              JSON.stringify({
                trips: trips.map(trip => searcher.formatTrip(trip)),
                lastDate: getHumanDate(lastDate)
              }) + '\n',
              encoding
            )
            return next()
          }
        }))
      .pipe(res)
  }

  static async bookJourney (req: express.Request, res: express.Response) {
    if (!Array.isArray(req.body.segmentIds)) return res.status(400).send({ msg: 'You need to provide a segmentIds.' })
    if (!req.body.folderId) return res.status(400).send({ msg: 'You need to provide a folderId.' })
    if (!req.body.searchId) return res.status(400).send({ msg: 'You need to provide a searchId.' })
    if (!req.body.bookerId) return res.status(400).send({ msg: 'You need to provide a bookerId.' })

    const booker = await BookerEntity.findOne(String(req.body.bookerId))
    if (!booker) {
      return res.status(400).send({ msg: 'Unable to find the booker.' })
    }

    const confirmation = await TrainlineBooker.bookAndPay(
      new TrainlineAuthentifier({ username: booker.username!, password: booker.password! }),
      {
        segmentIds: req.body.segmentIds,
        folderId: req.body.folderId,
        searchId: req.body.searchId
      }
    )
    if (typeof confirmation === 'undefined') {
      res.statusCode = 500
      return res.send({ message: 'Failed to book' })
    }
    return res.send(confirmation)
  }
}