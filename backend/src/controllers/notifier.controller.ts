import NotifierEntity from '../entities/notifier.entity'
import TravelEntity from '../entities/travel.entity'
import * as express from 'express'
import CronTravelEntity from '../entities/cronTravel.entity'

export default class NotifierController {

  static get router () {
    const routerNotifiers = express.Router()
    routerNotifiers.get('/', this.list)
    routerNotifiers.post('/', this.create)
    routerNotifiers.delete('/:id', this.delete)
    return routerNotifiers
  }

  static async list (req: express.Request, res: express.Response) {
    const notifiers = await NotifierEntity.find()
    return res.send(notifiers)
  }

  static async create (req: express.Request, res: express.Response) {
    const notifier = await NotifierEntity.insert(req.body)
    return res.send({ ...notifier.generatedMaps[0], ...req.body })
  }

  static async delete (req: express.Request, res: express.Response) {
    const travelsWithThisNotifier = await TravelEntity.find({ notifier: { id: parseInt(req.params.id) } })
    if (travelsWithThisNotifier.length > 0) return res.status(400).send({ msg: `You can't delete a notifier attached.` })

    const cronTravelsWithThisNotifier = await CronTravelEntity.find({ notifier: { id: parseInt(req.params.id) } })
    if (cronTravelsWithThisNotifier.length > 0) return res.status(400).send({ msg: `You can't delete a notifier attached.` })

    const notifier = await NotifierEntity.delete({ id: parseInt(req.params.id) })
    return res.send(notifier)
  }

}