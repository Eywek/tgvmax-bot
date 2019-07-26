export type Credentials = {
  username: string
  password: string
}

export interface NotifierInterface {
  // constructor (credentials: Credentials): NotifierInterface
  send(message: string): Promise<boolean>
}