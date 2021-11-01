import BookerEntity from '../entities/booker.entity'
import TravelEntity from '../entities/travel.entity'
import * as express from 'express'
import CronTravelEntity from '../entities/cronTravel.entity'

export default class BookerController {

  static get router () {
    const routerBookers = express.Router()
    routerBookers.get('/', this.list)
    routerBookers.post('/', this.create)
    routerBookers.delete('/:id', this.delete)
    return routerBookers
  }

  static async list (req: express.Request, res: express.Response) {
    const bookers = await BookerEntity.find()
    return res.send(bookers)
  }

  static async create (req: express.Request, res: express.Response) {
    const booker = await BookerEntity.insert(req.body)
    return res.send({ ...booker.generatedMaps[0], ...req.body })
  }

  static async delete (req: express.Request, res: express.Response) {
    const travelsWithThisBooker = await TravelEntity.find({ booker: req.params.id })
    if (travelsWithThisBooker.length > 0) return res.status(400).send({ msg: `You can't delete a booker attached.` })

    const cronTravelsWithThisBooker = await CronTravelEntity.find({ booker: req.params.id })
    if (cronTravelsWithThisBooker.length > 0) return res.status(400).send({ msg: `You can't delete a booker attached.` })

    const booker = await BookerEntity.delete({ id: req.params.id })
    return res.send(booker)
  }

}