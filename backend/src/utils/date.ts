import config from './config'

export const getHourFromDate = (date: Date) => {
  return new Intl.DateTimeFormat([ config.dateFormat ], {
    timeZone: 'Europe/Paris',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date)
}

export const getDate = (date: Date) => {
  return new Intl.DateTimeFormat([ config.dateFormat ], {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date)
}


export const getHumanDate = (date: Date, withHour = true) => {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    month: 'short',
    weekday: 'short',
    day: 'numeric',
    hour: withHour ? '2-digit' : undefined,
    minute: withHour ? '2-digit' : undefined,
  }).format(date)
}