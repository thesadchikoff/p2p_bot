import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'

export const previousButton = (
	callbackData: string
): InlineKeyboardButton[] => {
	return [
		{
			callback_data: callbackData,
			text: '← Назад',
		},
	]
}
