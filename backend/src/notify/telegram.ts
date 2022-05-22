import { Telegraf } from 'telegraf'
import { NotifierInterface, Credentials } from './interface'
import TravelEntity from '../entities/travel.entity'
import CronEntity from '../entities/cronTravel.entity'
import { getDate } from '../utils/date'
import NotifierEntity from '../entities/notifier.entity'

import { TrainlineStation } from '../book/trainline'
const trainlineStations: TrainlineStation[] = require('../../trainline_stations.json')

enum Function {
  ListTravels = 'LIST_TRAVELS',
  ListCrons = 'LIST_CRONS',
}
const actions = [
  [
    { text: 'List travels', callback_data: Function.ListTravels },
    { text: 'List crons', callback_data: Function.ListCrons },
  ],
]

const bot = new Telegraf(process.env.TELEGRAM_TOKEN as string)

const start = () => {
  bot.start(async (ctx) => {
    const chatId = ctx.chat.id
    const notifier = await NotifierEntity.findOne({ where: { type: 'telegram', username: chatId } })
    if (!notifier) {
      await ctx.reply(`Hi! Your chat id is ${chatId} that you can use in the notifier username configuration. Try again: /start`)
      return
    }

    await ctx.reply(`Hi! You're using notifier "${notifier.name}" with chat id ${chatId}`, {
      reply_markup: {
        inline_keyboard: actions,
      }
    })
  })
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
          await ctx.reply('No travel')
          return
        }

        await ctx.reply('Here are your travels:')
        for (const travel of travels) {
          const stationFrom = trainlineStations.find(s => s.sncfId === travel.from)
          const stationTo = trainlineStations.find(s => s.sncfId === travel.to)
          await ctx.reply(`<b>${stationFrom?.name ?? travel.from} → ${stationTo?.name ?? travel.to}</b>\nOn ${getDate(travel.date)} from ${travel.minHour ?? 0}:${travel.minMinute ?? 0} to ${travel.maxHour ?? 23}:${travel.maxMinute ?? 59}\n${travel.book ? (travel.booked ? 'Booked' : 'Will be booked' ) : 'Verified'} with <i>${travel.booker?.name}</i> and notified through <i>${travel.notifier?.name}</i>`, {
            parse_mode: 'HTML',
          })
        }
        await ctx.reply(`That's all for now`, {
          reply_markup: {
            inline_keyboard: actions,
          }
        })
        return
      }
      case Function.ListCrons: {
        const crons = await CronEntity.find({ relations: ['notifier', 'booker'] })
        ctx.answerCbQuery('OK')
        if (crons.length === 0) {
          ctx.reply('No cron')
          return
        }
        await ctx.reply('Here are your crons:')
        for (const cron of crons) {
          const stationFrom = trainlineStations.find(s => s.sncfId === cron.from)
          const stationTo = trainlineStations.find(s => s.sncfId === cron.to)
          await ctx.reply(`<b>${stationFrom?.name ?? cron.from} → ${stationTo?.name ?? cron.to}</b>\nFrom ${cron.minHour ?? 0}:${cron.minMinute ?? 0} to ${cron.maxHour ?? 23}:${cron.maxMinute ?? 59} on "${cron.cron}"\n${cron.book ? 'Will be booked' : 'Verified'} with <i>${cron.booker?.name}</i> and notified through <i>${cron.notifier?.name}</i>`, {
            parse_mode: 'HTML'
          })
        }
        await ctx.reply(`That's all for now`, {
          reply_markup: {
            inline_keyboard: actions,
          }
        })
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