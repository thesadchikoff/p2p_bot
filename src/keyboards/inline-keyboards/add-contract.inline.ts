import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'

export const chooseContractType: InlineKeyboardButton[][] = [
	[
		{
			callback_data: JSON.stringify({
				type: 'sell',
			}),
			text: '📈 Хочу продать',
		},
		{
			callback_data: JSON.stringify({
				type: 'buy',
			}),
			text: '📈 Хочу купить',
		},
	],
]
