import fetch from 'node-fetch'
const parse = require('csv-parse/lib/sync')
import { writeFileSync } from 'fs'
import { TrainlineStation } from '../src/book/trainline'

const main = async () => {
  const res = await fetch('https://raw.githubusercontent.com/trainline-eu/stations/master/stations.csv', {})
  const stations: TrainlineStation[] = []
  const lines = parse(await res.text(), {
    columns: true,
    delimiter: ';'
  })
  for (const line of lines.filter(line => line.is_suggestable === 't' && line.sncf_is_enabled === 't' && line.sncf_id !== '')) {
    stations.push({
      trainlineId: line.id,
      sncfId: line.sncf_id,
      name: line.name,
    })
  }
  writeFileSync('./trainline_stations.json', JSON.stringify(stations))
}

main()