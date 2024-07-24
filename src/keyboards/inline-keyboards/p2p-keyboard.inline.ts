import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'

export const marketKeyboard: InlineKeyboardButton[][] = [
	[
		{
			callback_data: 'sell',
			text: '📈 Купить',
		},
		{
			callback_data: 'buy',
			text: '📉 Продать',
		},
	],
	[
		{
			callback_data: 'my_ads',
			text: '📄 Мои объявления',
		},
	],
	[
		{
			callback_data: 'profile',
			text: '👤 Мой профиль',
		},
	],
	[
		{
			callback_data: 'main_menu',
			text: '← Назад',
		},
	],
]
