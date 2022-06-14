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

export function getTimezoneOffset(tz: string) {
  const date = new Date()
  // '2022-06-14 17:22:29' -> 
  const [year, month, day, hour, minute, seconds] = date.toLocaleString('sv', { timeZone: tz }).split(/-| |:/)
  const t1 = Date.UTC(+year, +month - 1, +day, +hour, +minute, +seconds)
  const t2 = new Date(date).setMilliseconds(0)
  return (t2 - t1) / 60 / 1000;
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