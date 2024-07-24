import { Scenes } from 'telegraf'
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import { WizardContext } from 'telegraf/typings/scenes'
import { currencies } from '../keyboards/inline-keyboards/currencies.inline'
import { previousButton } from '../keyboards/inline-keyboards/previous-button.inline'
import { prisma } from '../prisma/prisma.client'
import currencyService from '../service/currency.service'
import { currencyFormatter } from '../utils/currency-formatter'

const selectAction = async (ctx: WizardContext) => {
	try {
		await ctx.editMessageText(`Вы хотите продать или купить криптовалюту?`, {
			parse_mode: 'HTML',
			reply_markup: {
				inline_keyboard: [
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
				],
			},
		})
		return ctx.wizard.next()
	} catch (error) {
		await ctx.reply('Ошибка обработки данных')
	}
	return ctx.wizard.next()
}

const selectCurrency = async (ctx: WizardContext) => {
	try {
		// @ts-ignore
		console.log(ctx.callbackQuery)
		// @ts-ignore
		const actionType = JSON.parse(ctx.callbackQuery.data)
		// @ts-ignore
		ctx.session.actionType = actionType.type
		const buttons = await currencies(false)
		// @ts-ignore
		console.log(ctx.session.actionType)
		if (actionType.type === 'sell') {
			try {
				await ctx.editMessageText(`Выберите валюту для продажи`, {
					parse_mode: 'HTML',
					reply_markup: {
						inline_keyboard: [...buttons, previousButton('add_my_contract')],
					},
				})
				return ctx.wizard.next()
			} catch (error) {
				await ctx.reply('Error')
				return ctx.scene.leave()
			}
		}
		if (actionType.type === 'buy') {
			ctx.editMessageText(`Выберите валюту для покупки`, {
				parse_mode: 'HTML',
				reply_markup: {
					inline_keyboard: [...buttons, previousButton('add_my_contract')],
				},
			})
			return ctx.wizard.next()
		}
		// @ts-ignore
		ctx.session.recipientAddress = ctx.text
	} catch (error) {
		console.log(error)
		return ctx.reply('🤬 Произошла непредвиденная ошибка', {
			reply_markup: {
				inline_keyboard: [
					[
						{
							callback_data: 'main_menu',
							text: 'В главное меню',
						},
					],
				],
			},
		})
	}
}

const chooseCountBTC = async (ctx: WizardContext) => {
	try {
		// @ts-ignore
		const currentCurrency = JSON.parse(ctx.callbackQuery.data)
		// @ts-ignore
		ctx.session.currentCurrency = currentCurrency.value
		const currentCourseBTC = await currencyService.getCurrency('bitcoin')
		const getMessage = () => {
			switch (currentCurrency.value) {
				case 'RUB':
					return `Текущий курс на бирже за 1 BTC: ${currencyFormatter(
						currentCourseBTC?.bitcoin.rub!,
						'rub'
					)}\n\nИсточник: <b>Coingecko</b>`
				case 'USD':
					return `<b>Текущий курс на бирже за 1 BTC: </b>${currencyFormatter(
						currentCourseBTC?.bitcoin.usd!,
						'usd'
					)}\n\nИсточник: <b>Coingecko</b>`
				case 'EUR':
					return `<b>Текущий курс на бирже за 1 BTC:</b> ${currencyFormatter(
						currentCourseBTC?.bitcoin.eur!,
						'eur'
					)}\n\nИсточник: <b>Coingecko</b>`
			}
		}
		console.log(currentCurrency.value)
		ctx.editMessageText(
			`${getMessage()!}\n\nУкажите количество <b>${
				currentCurrency.value
			}</b> для ${
				// @ts-ignore
				ctx.session.actionType === 'sell' ? 'продажи' : 'покупки'
			} за 1 BTC`,
			{
				parse_mode: 'HTML',
				reply_markup: {
					inline_keyboard: [
						[{ callback_data: 'fix_price', text: 'Биржевая стоимость' }],
						previousButton('main_menu'),
					],
				},
			}
		)
		return ctx.wizard.next()
	} catch (error) {
		console.log(error)
		return ctx.reply('🤬 Произошла непредвиденная ошибка', {
			reply_markup: {
				inline_keyboard: [
					[
						{
							callback_data: 'main_menu',
							text: 'В главное меню',
						},
					],
				],
			},
		})
	}
}

const sendPricePerOneCoin = async (ctx: WizardContext) => {
	try {
		// @ts-ignore
		if (ctx.callbackQuery?.data) {
			// @ts-ignore
			if (ctx.callbackQuery.data === 'fix_price') {
				const coinPrice = await currencyService.getCurrency('bitcoin')
				// @ts-ignore
				if (ctx.session.currentCurrency === 'RUB') {
					// @ts-ignore
					ctx.session.pricePerCoin = coinPrice?.bitcoin.rub
				}
				// @ts-ignore
				else if (ctx.session.currentCurrency === 'USD') {
					// @ts-ignore
					ctx.session.pricePerCoin = coinPrice?.bitcoin.usd
				} else {
					// @ts-ignore
					ctx.session.pricePerCoin = coinPrice?.bitcoin.eur
				}
			}
		} else {
			console.log(parseInt(ctx.text!))
			// @ts-ignore
			ctx.session.pricePerCoin = parseInt(ctx.text)
		}
		// @ts-ignore
		const pricePerCoin = ctx.session.pricePerCoin
		ctx.reply(
			`<b>Лимиты</b>\n\nУказанная сумма за 1 BTC: <b>${currencyFormatter(
				pricePerCoin,
				// @ts-ignore
				ctx.session.currentCurrency.toLowerCase()
			)}</b>\n\nВведите мин. и макс. сумму отклика в RUB.\n<b>Например:</b> 1 - 1000000`,
			{
				parse_mode: 'HTML',
			}
		)
		return ctx.wizard.next()
	} catch (error) {
		console.log(error)
		return ctx.reply('🤬 Произошла непредвиденная ошибка', {
			reply_markup: {
				inline_keyboard: [
					[
						{
							callback_data: 'main_menu',
							text: 'В главное меню',
						},
					],
				],
			},
		})
	}
}

const selectPaymentMethod = async (ctx: WizardContext) => {
	try {
		console.log(ctx.text)
		const message = ctx.text

		const findInt = message?.split('-')
		const numbers = findInt?.map(item => {
			return parseInt(item)
		})
		// @ts-ignore
		ctx.scene.session.minPrice = numbers[0]
		// @ts-ignore
		ctx.scene.session.maxPrice = numbers[1]
		console.log(ctx)
		prisma.requisite
			.findMany({
				where: {
					userId: ctx.from?.id.toString()!,
				},
				include: {
					paymentMethod: true,
				},
			})
			.then(async res => {
				const requisitesButton: InlineKeyboardButton[][] = res.map(
					requisite => {
						const { code, ...result } = requisite.paymentMethod
						return [
							{
								callback_data: JSON.stringify(result),
								text: `${
									requisite.paymentMethod.name
								} | *${requisite.phoneOrbankCardNumber.slice(-4)}`,
							},
						]
					}
				)
				await ctx.reply(`Выберите реквизиты для покупки BTC:`, {
					parse_mode: 'HTML',
					reply_markup: {
						inline_keyboard: [...requisitesButton],
					},
				})
			})
		return ctx.wizard.next()
	} catch (error) {
		console.log(error)
		return ctx.reply('🤬 Произошла непредвиденная ошибка', {
			reply_markup: {
				inline_keyboard: [
					[
						{
							callback_data: 'main_menu',
							text: 'В главное меню',
						},
					],
				],
			},
		})
	}
}

const createContract = async (ctx: WizardContext) => {
	try {
		// @ts-ignore
		const paymentMethod = JSON.parse(ctx.callbackQuery?.data)
		await prisma.contract
			.create({
				data: {
					// @ts-ignore
					type: ctx.session.actionType,
					// @ts-ignore
					price: ctx.scene.session.minPrice,
					// @ts-ignore
					amount: ctx.session.pricePerCoin,
					paymentMethodId: paymentMethod.id,
					userId: ctx.from?.id.toString()!,
					// @ts-ignore
					currency: ctx.session.currentCurrency,
					// @ts-ignore
					maxPrice: ctx.scene.session.maxPrice,
				},
			})
			.then(async res => {
				ctx.reply(
					`📰 <b>Заявка #${res.code} создана</b>\n\n<b>Метод оплаты:</b> ${
						paymentMethod.name
					}\n<b>Курс 1 BTC:</b> ${currencyFormatter(
						// @ts-ignore
						ctx.session.pricePerCoin,
						// @ts-ignore
						ctx.session.currentCurrency
						// @ts-ignore
					)}\n<b>Минимальная сумма:</b> ${ctx.scene.session.minPrice} ${
						// @ts-ignore
						ctx.session.currentCurrency
						// @ts-ignore
					}\n<b>Максимальная сумма:</b> ${ctx.scene.session.maxPrice} ${
						// @ts-ignore
						ctx.session.currentCurrency
					}
		`,
					{
						parse_mode: 'HTML',
						reply_markup: {
							inline_keyboard: [
								[
									{
										callback_data: 'main_menu',
										text: 'В главное меню',
									},
								],
							],
						},
					}
				)
				await ctx.scene.leave()
				return ctx.reply('⚡️')
			})
	} catch (error) {
		console.log(error)
		return ctx.reply('🤬 Произошла непредвиденная ошибка', {
			reply_markup: {
				inline_keyboard: [
					[
						{
							callback_data: 'main_menu',
							text: 'В главное меню',
						},
					],
				],
			},
		})
	}
	return
}

export const AddContract = new Scenes.WizardScene<WizardContext>(
	'add_contract',
	selectAction,
	selectCurrency,
	chooseCountBTC,
	sendPricePerOneCoin,
	selectPaymentMethod,
	createContract
)
