import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'

export const inlineKeyboardForSettings: InlineKeyboardButton[][] = [
	[
		{
			callback_data: 'set_currency',
			text: '💵 Изменить валюту',
		},
		{
			callback_data: 'course_currency',
			text: '📊 Курс',
		},
	],
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
