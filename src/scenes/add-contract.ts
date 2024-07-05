import { Scenes } from 'telegraf'
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import { WizardContext } from 'telegraf/typings/scenes'
import { chooseContractType } from '../keyboards/inline-keyboards/add-contract.inline'
import { currencies } from '../keyboards/inline-keyboards/currencies.inline'
import { previousButton } from '../keyboards/inline-keyboards/previous-button.inline'
import { prisma } from '../prisma/prisma.client'
import currencyService from '../service/currency.service'
import { currencyFormatter } from '../utils/currency-formatter'

export const AddContract = new Scenes.WizardScene<WizardContext>(
	'add_contract',
	async ctx => {
		try {
			await ctx.editMessageText(`Вы хотите продать или купить криптовалюту?`, {
				parse_mode: 'HTML',
				reply_markup: {
					inline_keyboard: chooseContractType,
				},
			})
			return ctx.wizard.next()
		} catch (error) {
			await ctx.reply('Ошибка обработки данных')
		}
		return ctx.wizard.next()
	},
	async ctx => {
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
			// 			await ctx.editMessageText(
			// 				`Пришлите фиксированную цену в RUB для продажи BTC.\n\nБиржевой курс: 615.03 RUB\n
			// Источник курса: Gecko\n\nМин. цена: 307.51 RUB\n\nМакс. цена: 922.55 RUB\nЦена: 💎 1 BTC = 615.03 RUB`,
			// 				{
			// 					parse_mode: 'HTML',
			// 					reply_markup: {
			// 						inline_keyboard: [...buttons, previousButton('add_my_contract')],
			// 					},
			// 				}
			// 			)
			console.log(buttons)
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
	},
	async ctx => {
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
			await ctx.editMessageText(
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
			await ctx.reply('Create contract aborted!')
			// @ts-ignore
			ctx.scene = {}
			return ctx.wizard.back()
		}
	},
	async ctx => {
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
			await ctx.reply('Create contract aborted')
			return ctx.wizard.back()
		}
	},
	async ctx => {
		try {
			console.log(ctx.text)
			const message = ctx.text

			const findInt = message?.split('-')
			const numbers = findInt?.map(item => {
				return parseInt(item)
			})
			console.log(numbers)
			// @ts-ignore
			ctx.scene.session.minPrice = numbers[0]
			// @ts-ignore
			ctx.scene.session.maxPrice = numbers[1]
			console.log(ctx)
			const requisites = await prisma.requisite.findMany({
				where: {
					userId: ctx.from?.id.toString()!,
				},
				include: {
					paymentMethod: true,
				},
			})
			const requisitesButton: InlineKeyboardButton[][] = requisites.map(
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
			ctx.reply(`Выберите реквизиты для покупки BTC:`, {
				parse_mode: 'HTML',
				reply_markup: {
					inline_keyboard: [...requisitesButton],
				},
			})
			return ctx.wizard.next()
		} catch (error) {
			console.log(error)
			await ctx.reply('Error')
			return ctx.wizard.back()
		}
	},
	async ctx => {
		try {
			// @ts-ignore
			console.log(ctx.callbackQuery?.data)
			// @ts-ignore
			const paymentMethod = JSON.parse(ctx.callbackQuery?.data)
			await prisma.contract.create({
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
			await ctx.reply(`<b>📝 Объявление создано!</b>`, { parse_mode: 'HTML' })
			await ctx.reply(
				`📰 <b>Заявка</b>\n\n<b>Метод оплаты:</b> ${
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
				{ parse_mode: 'HTML' }
			)
			// @ts-ignore
			ctx.scene = {}
		} catch (error) {
			console.log(error)
			// @ts-ignore
			ctx.scene = {}
			await ctx.reply('Error')
			return ctx.wizard.back()
		}
	}
)
