export default {
  dateFormat: process.env.DATE_FORMAT || 'sv', // sv uses YYYY-MM-DD hh:mm
  database: process.env.DATABASE as 'sqlite' | 'postgres' ?? 'sqlite',
  sqlite: {
    file: process.env.SQLITE_FILE || 'tgvmax.sqlite'
  },
  postgres: {
    host: process.env.POSTGRES_HOST || '127.0.0.1:5432',
    database: process.env.POSTGRES_DATABASE || 'tgvmaxbot',
    username: process.env.POSTGRES_USERNAME || 'tgvmaxbot',
    password: process.env.POSTGRES_PASSWORD || 'tgvmaxbot',
  },
}