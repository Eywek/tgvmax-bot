export const getHourFromDate = (date: Date) => {
  return new Intl.DateTimeFormat([], {
    timeZone: 'Europe/Paris',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date)
}

export const getHumanDate = (date: Date) => {
  return new Intl.DateTimeFormat([], {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date)
}