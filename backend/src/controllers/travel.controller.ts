import TravelEntity from '../entities/travel.entity'
import * as express from 'express'

export default class TravelController {

  static get router () {
    const routerTravels = express.Router()
    routerTravels.get('/', this.list)
    routerTravels.post('/', this.create)
    routerTravels.delete('/:id', this.delete)
    return routerTravels
  }

  static async list (req: express.Request, res: express.Response) {
    const travels = await TravelEntity.find({ relations: ['notifier', 'booker'] })
    return res.send(travels)
  }

  static async create (req: express.Request, res: express.Response) {
    if (!req.body.notifier) return res.status(400).send({ msg: 'You need to provide a notifier.' })
    if (!req.body.booker) return res.status(400).send({ msg: 'You need to provide a booker.' })
    const travel = await TravelEntity.insertAndCrawl(req.body)
    return res.send(travel)
  }

  static async delete (req: express.Request, res: express.Response) {
    const travel = await TravelEntity.deleteById(req.params.id)
    return res.send(travel)
  }

}