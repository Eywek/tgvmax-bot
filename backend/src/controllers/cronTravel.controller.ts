import CronTravelEntity from '../entities/cronTravel.entity'
import * as express from 'express'

export default class CronTravelController {

  static get router () {
    const routerCronTravels = express.Router()
    routerCronTravels.get('/', this.list)
    routerCronTravels.post('/', this.create)
    routerCronTravels.delete('/:id', this.delete)
    return routerCronTravels
  }

  static async list (req: express.Request, res: express.Response) {
    const travels = await CronTravelEntity.find({ relations: ['notifier', 'booker'] })
    return res.send(travels)
  }

  static async create (req: express.Request, res: express.Response) {
    if (!req.body.notifier) return res.status(400).send({ msg: 'You need to provide a notifier.' })
    if (!req.body.booker) return res.status(400).send({ msg: 'You need to provide a booker.' })
    const travel = await CronTravelEntity.insertAndInit(req.body)
    return res.send(travel)
  }

  static async delete (req: express.Request, res: express.Response) {
    const travel = await CronTravelEntity.deleteById(req.params.id)
    return res.send(travel)
  }

}