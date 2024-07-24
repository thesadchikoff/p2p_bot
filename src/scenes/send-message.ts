import { Scenes } from 'telegraf'
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import { WizardContext } from 'telegraf/typings/scenes'
import { prisma } from '../prisma/prisma.client'
import { currencyFormatter } from '../utils/currency-formatter'

const writeMessage = async (ctx: WizardContext) => {
	try {
		await ctx.reply(`Напишите сообщение, которое хотите отправить`)
		return ctx.wizard.next()
	} catch (error) {
		console.log(error)
		ctx.scene.leave()
		return ctx.reply('❗️ Произошла непредвиденная ошибка')
	}
}

const sendingMessage = async (ctx: WizardContext) => {
	try {
		const user = await prisma.user.findFirst({
			where: {
				// @ts-ignore
				id: ctx.wizard.state.id.toString(),
			},
			include: {
				BuyerContractTransaction: {
					include: {
						contract: true,
						seller: true,
						buyer: true,
					},
				},
			},
		})
		// @ts-ignore
		ctx.wizard.state.sellerId = user?.BuyerContractTransaction?.sellerId
		// @ts-ignore

		ctx.wizard.state.buyerId = user?.BuyerContractTransaction?.buyerId
		// @ts-ignore
		const sellerId = ctx.wizard.state.sellerId
		// @ts-ignore
		const buyerId = ctx.wizard.state.buyerId
		const inlineButtons: InlineKeyboardButton[][] = [
			[
				{
					callback_data: `send-message-${user?.BuyerContractTransaction?.seller?.id}`,
					text: '💬 Ответить',
				},
			],
			[
				{
					callback_data: `cancel-contract-${user?.BuyerContractTransaction?.sellerId}`,
					text: '🚫 Отменить',
				},
			],
		]
		if (user?.BuyerContractTransaction?.contract.type === 'buy') {
			if (user.BuyerContractTransaction.buyerId === ctx.from!.id.toString()) {
				inlineButtons[0].push({
					callback_data: `payment-successful-${user?.BuyerContractTransaction?.buyerId}`,
					text: '✅ Деньги получены',
				})
			} else {
				inlineButtons[0].push({
					callback_data: `payment-contract-${user?.BuyerContractTransaction?.buyerId}`,
					text: '✅ Я оплатил',
				})
			}
		} else {
			if (
				user!.BuyerContractTransaction?.sellerId === ctx.from!.id.toString()
			) {
				inlineButtons[0].push({
					callback_data: `payment-contract-${user?.BuyerContractTransaction?.buyerId}`,
					text: '✅ Я оплатил',
				})
			} else {
				inlineButtons[0].push({
					callback_data: `payment-successful-${user?.BuyerContractTransaction?.buyerId}`,
					text: '✅ Деньги получены',
				})
			}
		}
		await ctx.telegram.sendMessage(
			user?.id!,
			`💬 Сообщение от ${
				user?.BuyerContractTransaction?.sellerId === ctx.from!.id.toString()!
					? 'трейдера'
					: 'покупателя'
			} @${user?.BuyerContractTransaction?.seller?.login}\nСделка #${
				user?.BuyerContractTransaction?.code
			}\n\nМинимальная сумма - ${currencyFormatter(
				user?.BuyerContractTransaction?.contract.price!,
				user?.BuyerContractTransaction?.contract.currency!
			)}\nМаксимальная сумма - ${currencyFormatter(
				user?.BuyerContractTransaction?.contract.maxPrice!,
				user?.BuyerContractTransaction?.contract.currency!
			)}\nСтатус сделки: Ожидает оплаты\n\n---------------------------
			${
				ctx.text
			}\n---------------------------\n❗️Администрация не имеет отношения к содержимому сообщения!`,
			{
				parse_mode: 'HTML',
				reply_markup: {
					inline_keyboard: inlineButtons,
				},
			}
		)
		await ctx.reply(
			`✅ Сообщение пользователю ${user?.login} успешно доставлено`
		)
		return ctx.scene.leave()
	} catch (error) {
		console.log(error)
		ctx.scene.leave()
		return ctx.reply('❗️ Произошла непредвиденная ошибка')
	}
}

export const SendMessage = new Scenes.WizardScene<WizardContext>(
	'send_message',
	writeMessage,
	sendingMessage
)
