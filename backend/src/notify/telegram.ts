import { NotifierInterface, Credentials } from './interface'
import * as fetch from 'node-fetch'

export default class TelegramNotifier implements NotifierInterface {
  private credentials: Credentials
  private chat_id: Promise<number>

  constructor (credentials: Credentials) {
    this.credentials = credentials
    this.chat_id = this.getChatId(credentials)
  }

  async send (message: string) {
    const endpoint = `https://api.telegram.org/bot${this.credentials.username}:${this.credentials.password}/sendMessage?chat_id=${await this.chat_id}&text=${message}`
    try {
      await fetch(endpoint)
    } catch {
      return false
    }
    return true
  }

  private async getChatId (credentials: Credentials) {
    const endpoint = `https://api.telegram.org/bot${this.credentials.username}:${this.credentials.password}/getUpdates`
    const response = await fetch(endpoint)
    const json = await response.json()
    return parseInt(json.result[0].message.chat.id)
  }
}