'use strict'

import { createConnection, Connection } from 'typeorm'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions'
import config from './config'

export default class Database {
  private connection!: Connection
  private config: SqliteConnectionOptions | PostgresConnectionOptions

  constructor() {
    switch (config.database) {
      case 'sqlite':
        this.config = {
          type: 'sqlite',
          database: config.sqlite.file,
          logging: true,
        }
        break
      case 'postgres':
        this.config = {
          type: 'postgres',
          url: `postgres://${config.postgres.username}:${config.postgres.password}@${config.postgres.host}/${config.postgres.database}`,
          logging: true,
        }
        break
      default:
        throw new Error('Database configuration is invalid')
    }
  }

  async connect(): Promise<Connection> {
    this.connection = await createConnection({
      ...this.config,
      entities: [
        __dirname + "/../entities/*.entity.ts"
      ],
      synchronize: true,
      logging: false
    })
    return this.connection
  }
}