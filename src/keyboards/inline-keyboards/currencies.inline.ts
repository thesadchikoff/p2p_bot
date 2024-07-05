import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import { prisma } from '../../prisma/prisma.client'

export const currencies = async (initValue: boolean = true) => {
	const currenciesList = await prisma.currency.findMany()

	if (initValue) {
		const buttons: InlineKeyboardButton[][] = currenciesList.map(item => {
			return [
				{
					callback_data: item.key + '-add',
					text: item.value,
				},
			]
		})
		return buttons
	} else {
		const buttons: InlineKeyboardButton[][] = currenciesList.map(item => {
			const { createdAt, key, ...result } = item
			return [
				{
					callback_data: JSON.stringify(result),
					text: item.value,
				},
			]
		})
		return buttons
	}
}
