import * as fetch from 'node-fetch'
const parse = require('csv-parse/lib/sync')
import { writeFileSync } from 'fs'

const main = async () => {
  const res = await fetch('https://raw.githubusercontent.com/trainline-eu/stations/master/stations.csv', {})
  const stations: Record<string, string> = {}
  const lines = parse(await res.text(), {
    columns: true,
    delimiter: ';'
  })
  for (const line of lines.filter(line => line.sncf_is_enabled === 't' && line.sncf_id !== '')) {
    stations[line.sncf_id] = line.id
  }
  writeFileSync('./trainline_stations.json', JSON.stringify(stations))
}

main()