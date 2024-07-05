import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
type RequisiteItem = ({
	paymentMethod: {
		id: number
		name: string
		code: string
	}
} & {
	id: number
	paymentMethodId: number
	phoneOrbankCardNumber: string
	currency: string
	userId: string
})[]

export const requisiteKeyboard = (
	telegramId: string,
	requisites: RequisiteItem
): InlineKeyboardButton[][] => {
	let requisiteItems: InlineKeyboardButton[][] = []
	if (requisites.length > 0) {
		requisiteItems = requisites.map(requisite => {
			return [
				{
					callback_data: `requisite_${requisite.id}`,
					text: `${
						requisite.paymentMethod.name
					} | *${requisite.phoneOrbankCardNumber.slice(-4)} | ${
						requisite.currency
					}`,
				},
			]
		})
	}
	return [
		[
			{
				callback_data: 'add_requisite',
				text: '📝 Добавить реквизиты',
			},
		],
		...requisiteItems,
		[
			{
				callback_data: 'settings',
				text: '← Назад',
			},
		],
	]
}
