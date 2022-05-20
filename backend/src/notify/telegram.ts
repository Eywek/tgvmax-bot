import { Telegraf } from 'telegraf'
import { NotifierInterface, Credentials } from './interface'
import TravelEntity from '../entities/travel.entity'
import CronEntity from '../entities/cronTravel.entity'

enum Function {
  ListTravels = 'LIST_TRAVELS',
  ListCrons = 'LIST_CRONS',
}

const bot = new Telegraf(process.env.TELEGRAM_TOKEN as string)

const start = () => {
  bot.start(ctx => ctx.reply(`Hi! Your chat id is ${ctx.chat.id} that you can use in the notifier username configuration`, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'List travels', callback_data: Function.ListTravels },
          { text: 'List crons', callback_data: Function.ListCrons },
        ],
      ]
    }
  }))
  bot.on('callback_query', async (ctx) => {
    if (!('data' in ctx.callbackQuery)) {
      ctx.answerCbQuery('Meh?')
      return
    }
    const [ f, arg ] = ctx.callbackQuery.data.split('+')
    switch (f) {
      case Function.ListTravels: {
        const travels = await TravelEntity.find({ relations: ['notifier', 'booker', 'cron'] })
        ctx.answerCbQuery('OK')
        if (travels.length === 0) {
          ctx.reply('No travel')
        }
        for (const travel of travels) {
          ctx.reply(`${travel.from} ${travel.to} ${travel.date}`)
        }
        return
      }
      case Function.ListCrons: {
        const crons = await CronEntity.find({ relations: ['notifier', 'booker'] })
        ctx.answerCbQuery('OK')
        if (crons.length === 0) {
          ctx.reply('No cron')
        }
        for (const cron of crons) {
          ctx.reply(`${cron.from} ${cron.to} ${cron.cron}`)
        }
        break
      }
      default:
        ctx.answerCbQuery('Meh!')
    }
  })
  bot.launch()
}

class TelegramNotifier implements NotifierInterface {
  private credentials: Credentials

  constructor (credentials: Credentials) {
    this.credentials = credentials
  }

  async send (message: string) {
    await bot.telegram.sendMessage(this.credentials.username, message)
    return true
  }
}

export { TelegramNotifier, start }