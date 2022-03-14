import config from './config'

export const getHourFromDate = (date: Date) => {
  return new Intl.DateTimeFormat([ config.dateFormat ], {
    timeZone: 'Europe/Paris',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date)
}

export const getHumanDate = (date: Date) => {
  return new Intl.DateTimeFormat([ config.dateFormat ], {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date)
}