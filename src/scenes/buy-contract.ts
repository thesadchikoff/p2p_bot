import cron from 'node-cron'
import { Scenes } from 'telegraf'
import { WizardContext } from 'telegraf/typings/scenes'
import { prisma } from '../prisma/prisma.client'
import { currencyFormatter } from '../utils/currency-formatter'
import { dateFormat } from '../utils/format-date'

const sendBuyAmount = async (ctx: WizardContext) => {
	try {
		const userTransactions = await prisma.contractTransaction.findFirst({
			where: {
				buyerId: ctx.from?.id.toString()!,
			},
		})
		if (userTransactions) {
			await ctx.reply(
				'У вас есть активная транзакция. Начать новую невозможно.'
			)
			return ctx.scene.leave()
		}
		const contract = await prisma.contract.findFirst({
			where: {
				// @ts-ignore
				id: ctx.wizard.state.id,
			},
			include: {
				author: {
					include: {
						SellerContractTransaction: true,
					},
				},
				paymentMethod: {
					include: {
						Requisite: true,
					},
				},
			},
		})
		const currentMethod = contract?.paymentMethod.Requisite.filter(
			requisite => requisite.paymentMethodId !== contract.paymentMethod.id
		)
		console.log(currentMethod)
		ctx.scene.state = {}
		// @ts-ignore
		ctx.scene.state.contract = JSON.stringify(contract)
		// @ts-ignore
		const currentContract = ctx.scene.state.contract

		await ctx.reply(
			`Введите сумму в ${contract?.currency?.toUpperCase()} для покупки\n\nМинимальная сумма покупки - ${currencyFormatter(
				// @ts-ignore
				contract?.price!,
				// @ts-ignore
				contract?.currency!
			)}\nМаксимальная сумма покупки - ${currencyFormatter(
				// @ts-ignore
				contract?.maxPrice!,
				// @ts-ignore
				contract?.currency!
			)}`,
			{
				parse_mode: 'HTML',
			}
		)
		return ctx.wizard.next()
	} catch (error) {
		console.log(error)
		ctx.scene.leave()
		return ctx.reply('❗️ Произошла непредвиденная ошибка')
	}
}

const doneContract = async (ctx: WizardContext) => {
	try {
		// @ts-ignore
		const contract = JSON.parse(ctx.scene.state.contract)
		const sendPrice = parseInt(ctx.text!)
		if (sendPrice < contract.price || sendPrice > contract.maxPrice) {
			await ctx.reply('Некорректно указана сумма, повторите еще раз.')
			ctx.wizard.back()
			return sendBuyAmount(ctx)
		} else {
			await prisma.contractTransaction
				.create({
					data: {
						buyerId: ctx.from?.id.toString()!,
						sellerId: contract.author.id,
						amount: sendPrice,
						contractId: contract.id,
					},
				})
				.then(async response => {
					const transaction = await prisma.contractTransaction.findFirst({
						where: {
							id: response.id,
						},
					})
					if (transaction) {
						const taskNotifyForUsers = cron.schedule(
							'* 12 * * * *',
							async () => {
								await ctx.telegram.sendMessage(
									Number(response.buyerId),
									`❗️ До отмены сделки осталось 3 минуты. Поспешите завершить её`
								)
								await ctx.telegram.sendMessage(
									Number(response.sellerId),
									`❗️ До отмены сделки осталось 3 минуты. Поспешите завершить её`
								)
								taskNotifyForUsers.stop()
							}
						)
						const taskDeleteTransaction = cron.schedule(
							'* 15 * * * *',
							async () => {
								await prisma.contractTransaction.delete({
									where: {
										id: response.id,
									},
								})
								taskDeleteTransaction.stop()
							}
						)
						return
					}
				})
			await ctx.reply(
				`📜 Сделка #${
					contract?.code
				} заключена\n\nЦена за 1 BTC: ${currencyFormatter(
					contract?.amount!,
					contract?.currency!
				)}\nКомиссия сервиса: 0%\n\nВремя на оплату сделки: 15 минут\n\nТрейдер: @${
					contract?.author.login
				}\nРепутация: 100%\nВерификация: ✔️\nОтзывы: 😊(0) 🙁(0)\n\nПровел сделок: 0\n\nЗарегистрирован: ${dateFormat(
					contract?.author.createdAt!
				)}\n\nУсловия:\nМинимальная сумма - ${currencyFormatter(
					contract!.price!,
					contract?.currency!
				)}\nМаксимальная сумма - ${currencyFormatter(
					contract!.maxPrice!,
					contract?.currency!
				)}`,
				{
					parse_mode: 'HTML',
					reply_markup: {
						inline_keyboard: [
							[
								{
									callback_data: `cancel-contract-${contract.author.id}`,
									text: '🚫 Отмена',
								},
								{
									callback_data: `send-message-${contract.author.id}`,
									text: 'Ответить',
								},
							],
						],
					},
				}
			)
			// 		await ctx.reply(
			// 			`💬 Сообщение от трейдера @${contract.author.login}
			// Сделка #${contract.code}
			// Статус сделки: Ожидает оплаты
			// Вы покупаете BTC на сумму ${currencyFormatter(
			// 				sendPrice,
			// 				contract.currency
			// 			)} через ${contract?.paymentMethod.name}\n\n---------------------------
			// АльфаБанк 2200 1523 4720 9515 , СБЕР 2202 2023 9388 7116 , получатель Александр А.П. Комент : Возврат долга
			// ---------------------------\n❗️Администрация не имеет отношения к содержимому сообщения!`,
			// 			{
			// 				parse_mode: 'HTML',
			// 				reply_markup: {
			// 					inline_keyboard: [
			// 						[
			// 							{
			// 								callback_data: 'cancel-buy-contract',
			// 								text: '🚫 Отмена',
			// 							},
			// 							{
			// 								callback_data: 'send-message',
			// 								text: 'Ответить',
			// 							},
			// 						],
			// 						[
			// 							{
			// 								callback_data: 'pay-successful',
			// 								text: '✅ Оплатил',
			// 							},
			// 						],
			// 					],
			// 				},
			// 			}
			// 		)
			ctx.telegram.sendMessage(
				contract.author.id,
				`Новое предложение о ${
					contract.type === 'buy' ? 'продаже' : 'покупке'
				} по объявлению #${contract.code}\n\nПокупает @${
					ctx.from?.username
				}\nBTC на сумму ${currencyFormatter(sendPrice, contract.currency)}`,
				{
					parse_mode: 'HTML',
					reply_markup: {
						inline_keyboard: [
							[
								{
									callback_data: `send-message-${ctx.from?.id}`,
									text: '✉️ Ответить',
								},
							],
						],
					},
				}
			)
		}
		ctx.scene.state = {}
		return ctx.scene.leave()
	} catch (error) {
		console.log(error)
		ctx.scene.leave()
		return ctx.reply('❗️ Произошла непредвиденная ошибка')
	}
}

export const BuyContract = new Scenes.WizardScene<WizardContext>(
	'buy-contract',
	sendBuyAmount,
	doneContract
)
