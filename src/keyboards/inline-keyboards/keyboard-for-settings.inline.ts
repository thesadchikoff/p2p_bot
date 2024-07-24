import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'

export const inlineKeyboardForSettings: InlineKeyboardButton[][] = [
	[
		{
			callback_data: 'requisites',
			text: '💳 Реквизиты',
		},
	],
	[
		{
			callback_data: 'main_menu',
			text: '← Назад',
		},
	],
]
