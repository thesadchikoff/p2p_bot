import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'

export const promoCodesButtons = (
	codesCount: number
): InlineKeyboardButton[][] => {
	return [
		[
			{
				callback_data: 'promo_information',
				text: 'Информация',
			},
			{
				callback_data: 'my_codes',
				text: `Мои коды (${codesCount})`,
			},
		],
		[
			{
				callback_data: 'activate_code',
				text: 'Активировать',
			},
			{
				callback_data: 'create_code',
				text: 'Создать',
			},
		],
	]
}
