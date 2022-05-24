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


export const getHumanDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    month: 'short',
    weekday: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}