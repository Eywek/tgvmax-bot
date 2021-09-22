export const getHourFromDate = (date: Date) => {
  return date.getHours().toString().padStart(2, '0') + 'h' +
    date.getMinutes().toString().padStart(2, '0')
}

export const getHumanDate = (date: Date) => {
  return date.toISOString().split('T')[0] + ' a ' + getHourFromDate(date)
}