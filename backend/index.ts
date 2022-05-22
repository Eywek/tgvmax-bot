import Database from './src/utils/database'
import TravelEntity from './src/entities/travel.entity'
import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import TravelController from './src/controllers/travel.controller'
import NotifierController from './src/controllers/notifier.controller'
import BookerController from './src/controllers/booker.controller'
import CronTravelController from './src/controllers/cronTravel.controller'
import fetch from 'node-fetch'
import CronTravelEntity from './src/entities/cronTravel.entity'
import { TrainlineStation } from './src/book/trainline'

const trainlineStations: TrainlineStation[] = require('./trainline_stations.json')

const db = new Database()
const app = express()
db.connect().then(async () => {
  await TravelEntity.deleteOld()
  const travels = await TravelEntity.find({ where: { booked: false }, relations: ['notifier', 'booker', 'cron'] })
  travels.forEach(travel => travel.init())
  console.log(`${travels.length} travel(s) initiated.`)

  const crons = await CronTravelEntity.reloadAll()
  console.log(`${crons.length} cron(s) initiated.`)

  app.use(cors())
  app.use(bodyParser.json())
  const router = express.Router()
  router.use('/travels', TravelController.router)
  router.use('/notifiers', NotifierController.router)
  router.use('/bookers', BookerController.router)
  router.use('/crons', CronTravelController.router)
  router.use('/stations/autocomplete', async (req: express.Request, res: express.Response) => {
    if (req.query.searchTerm.length < 2) {
      return res.send([])
    }
    res.send(trainlineStations.filter((s) => s.name.toLocaleLowerCase().includes(req.query.searchTerm.toLowerCase())).map(searchResult => ({
      id: searchResult.sncfId,
      tlId: searchResult.trainlineId,
      name: searchResult.name,
    })))
  })
  app.use('/api', router)

  app.listen(8081, _ => console.log('App listen on 0.0.0.0:8081'))
  setInterval(async _ => {
    await TravelEntity.deleteOld()
    await CronTravelEntity.reloadAll()
  }, 60 * 60 * 1000)
})