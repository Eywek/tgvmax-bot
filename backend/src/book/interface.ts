import TravelEntity from 'src/entities/travel.entity'
import { NotifierInterface } from 'src/notify/interface'
import TrainlineBooker from './trainline'
import OuiSNCFBooker from './ouisncf'

export type Credentials = {
  username: string
  password: string
}

export interface BookerInterface {
  destroy(): Promise<void>
}

export enum BookerType {
  trainline = 'trainline',
  ouisncf = 'ouisncf',
}

export const createBooker = (type: BookerType, travel: TravelEntity, notifier: NotifierInterface, credentials: Credentials): BookerInterface => {
  switch(type) {
    case BookerType.trainline:
      return new TrainlineBooker(travel, notifier, credentials)
    case BookerType.ouisncf:
      return new OuiSNCFBooker(travel, notifier)
    default:
      throw new Error(`Invalid booker type: ${type}`)
  }
}