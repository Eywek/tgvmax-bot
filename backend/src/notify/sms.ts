import { NotifierInterface, Credentials } from './interface'
import * as fetch from 'node-fetch'

export default class SmsNotifier implements NotifierInterface {
  private credentials: Credentials

  constructor (credentials: Credentials) {
    this.credentials = credentials
  }

  async send (message: string) {
    const endpoint = `https://smsapi.free-mobile.fr/sendmsg?user=${this.credentials.username}&pass=${this.credentials.password}&msg=${encodeURI(message)}`
    try {
      await fetch(endpoint)
    } catch {
      return false
    }
    return true
  }
}