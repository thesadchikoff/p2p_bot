import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import { SceneContext } from 'telegraf/typings/scenes'
import { previousButton } from '../keyboards/inline-keyboards/previous-button.inline'
import { prisma } from '../prisma/prisma.client'
import { currencyFormatter } from '../utils/currency-formatter'

export const getMyContracts = async (ctx: SceneContext) => {
	const user = await prisma.user.findFirst({
		where: {
			id: ctx.from?.id.toString(),
		},
		include: {
			Contract: true,
		},
	})
	const getPaymentMethod = (paymentMethodId: number) => {
		return prisma.paymentMethod.findFirst({
			where: {
				id: paymentMethodId,
			},
		})
	}
	// @ts-ignore
	const contractsKeyboard: InlineKeyboardButton[][] = user?.Contract.map(
		contract => {
			return [
				{
					callback_data: `contract-item-${contract.id}`,
					text: `${
						contract.type === 'sell' ? '🔹 Продажа' : '🔸 Покупка'
					} | ${currencyFormatter(
						contract.amount,
						contract.currency!
					)} | ${currencyFormatter(contract.price, contract.currency!)} - ${
						contract.maxPrice
							? currencyFormatter(contract.maxPrice, contract.currency!)
							: null
					}`,
				},
			]
		}
	)

	await ctx.editMessageText(
		`🔋 Здесь вы можете управлять своими объявлениями.\n\n`,
		{
			parse_mode: 'HTML',
			reply_markup: {
				// @ts-ignore
				inline_keyboard: [
					[
						{
							callback_data: 'add_my_contract',
							text: '🆕 Добавить объявление',
						},
					],
					...contractsKeyboard,
					previousButton('p2p_transfer'),
				],
			},
		}
	)
}
