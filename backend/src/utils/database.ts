'use strict'

import "reflect-metadata";
import { createConnection, Connection } from "typeorm";
import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions";

export default class Database {
  private connection: Connection
  private config: SqliteConnectionOptions = {
    type: 'sqlite',
    database: process.env.POSTGRES_DATABASE || 'tgvmax.sqlite'
  }

  constructor(config?: SqliteConnectionOptions) {
    Object.assign(this.config, config)
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