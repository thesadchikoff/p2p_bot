import { Scenes } from 'telegraf'
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import { prisma } from '../prisma/prisma.client'

export const getCurrency = async (
	ctx: Scenes.WizardContext<Scenes.WizardSessionData>
) => {
	const currency = await prisma.currency.findMany()
	const currencyButton: InlineKeyboardButton[] = currency.map(cur => {
		return {
			callback_data: JSON.stringify(cur),
			text: cur.value,
		}
	})
	await ctx.editMessageText('Выберите валюту:', {
		parse_mode: 'HTML',
		reply_markup: {
			inline_keyboard: [currencyButton],
		},
	})
	ctx.wizard.next()
}
