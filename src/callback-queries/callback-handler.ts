import { bot } from '../config/bot'
import { currencies } from '../keyboards/inline-keyboards/currencies.inline'
import { inlineKeyboardForSettings } from '../keyboards/inline-keyboards/keyboard-for-settings.inline'
import { previousButton } from '../keyboards/inline-keyboards/previous-button.inline'
import { createWallet } from '../trust-wallet/create-wallet'

import { Networks } from 'bitcore-lib'
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import { getMyContracts } from '../callbacks/get-my-contracts'
import { requisites } from '../callbacks/requisites'
import { transferHistory } from '../callbacks/transfer-history'
import { marketKeyboard } from '../keyboards/inline-keyboards/p2p-keyboard.inline'
import { startInlineKeyboards } from '../keyboards/inline-keyboards/start-keyboard.inline'
import { walletInlineKeyboard } from '../keyboards/inline-keyboards/wallet.inline'
import { prisma } from '../prisma/prisma.client'
import currencyService from '../service/currency.service'
import { getWalletBalance } from '../trust-wallet/get-balance'
import { replenishBtc } from '../trust-wallet/replenish-coin'
import { sendCoin } from '../trust-wallet/send-coin'
import { currencyFormatter } from '../utils/currency-formatter'

export const callbackHandler = () => {
	bot.on('callback_query', async query => {
		// @ts-ignore
		const data = query.update.callback_query?.data
		console.log(query.update.callback_query.from.id.toString())
		const user = await prisma.user.findFirst({
			where: {
				id: query.update.callback_query.from.id.toString(),
			},
		})

		switch (data) {
			case 'settings':
				try {
					return query.editMessageText(
						`<b>🔧 BitLimix | Настройки</b>\n\nВаше уникальное имя в боте: <b>${user?.login}</b>\n\nТут вы можете настроить ваш аккаунт.`,
						{
							parse_mode: 'HTML',
							reply_markup: {
								inline_keyboard: inlineKeyboardForSettings,
							},
						}
					)
				} catch (error) {
					return query.reply(String(error))
				}
			case 'add_requisite':
				try {
					return query.scene.enter('select_currency')
				} catch (error) {
					return query.reply('Ошибка обработки данных')
				}
			case 'transfer_btc':
				try {
					return query.scene.enter('transfer')
				} catch (error) {
					return query.reply(String(error))
				}
			case 'replenish_btc':
				try {
					return query.scene.enter('replenish')
				} catch (error) {
					return query.reply(String(error))
				}
			case 'decline':
				query.session = {}
				query.scene.leave()
				return query.scene.enter('transfer')

			case 'confirm':
				const transfer = sendCoin(
					query.from.id,
					// @ts-ignore
					query.session.recipientAddress,
					// @ts-ignore
					query.session.countBTC,
					Networks.mainnet
				)
				console.log(transfer)
				query.session = {}
				query.scene.leave()
				return
			case 'decline_replenish':
				query.session = {}
				query.scene.leave()
				return query.scene.enter('replenish')
			case 'confirm_replenish':
				query.deleteMessage()
				const replenish = replenishBtc(
					query.from.id,
					// @ts-ignore
					query.session.privateKey,
					// @ts-ignore
					query.session.sourceAddress,
					// @ts-ignore
					query.session.countBTC,
					Networks.mainnet
				)
				console.log(replenish)
				query.session = {}
				query.scene.leave()
				return
			case 'transfer_history':
				return transferHistory(query)
			case 'requisites':
				return requisites(query)
			case 'p2p_transfer':
				return query.editMessageText(
					`<strong>💱 BitLimix | Маркет</strong>\n\n💠 Здесь вы можете купить или продать криптовалюту с помощью перевода на карту или электронный кошелёк.\n🛡 Бот выступает гарантом и удерживает монеты на время сделки. Комиссия на покупку – 0%, на продажу – 1%.`,
					{
						parse_mode: 'HTML',
						reply_markup: {
							inline_keyboard: marketKeyboard,
						},
					}
				)
			case 'main_menu':
				try {
					return query.editMessageText(
						`<b>💰 BitLimix | Меню</b>\n\nВыберите интересующий вас пункт:`,
						{
							parse_mode: 'HTML',
							reply_markup: {
								inline_keyboard: startInlineKeyboards,
							},
						}
					)
				} catch (error) {
					return query.reply(String(error))
				}
			case 'set_currency':
				try {
					const buttons = await currencies()
					return query.editMessageText(
						'<b>💵 BitLimix | Изменение валюты</b>\n\nВыберите валюту, за которой хотите наблюдать:',
						{
							reply_markup: {
								inline_keyboard: [...buttons, previousButton('settings')],
							},
							parse_mode: 'HTML',
						}
					)
				} catch (error) {
					return query.reply(String(error))
				}
			case 'course_currency':
				try {
					const userCurrency = await prisma.user.findFirst({
						where: {
							id: query.from.id.toString(),
						},
						include: {
							currency: true,
						},
					})
					if (!userCurrency?.currency) {
						// @ts-ignore
						const buttons = await currencies()
						return query.editMessageText(
							`<b>📊 BitLimix | Курс</b>\n\nНе получилось получить курс валюты\n\nПеред тем как получить курс валюты, вам необходимо выбрать ее`,
							{
								parse_mode: 'HTML',
								reply_markup: {
									inline_keyboard: userCurrency?.isAdmin
										? [
												...buttons,
												[
													{
														text: 'Добавить валюту',
														callback_data: 'set_currency',
													},
												],
												previousButton('settings'),
										  ]
										: [...buttons, previousButton('settings')],
								},
							}
						)
					}
					const currency = await currencyService.getCurrency('bitcoin')
					return query.editMessageText(
						`<b>📊 BitLimix | Курс ${
							userCurrency?.currency.value
						}</b>\n\n<b>EUR:</b> ${currencyFormatter(
							currency?.bitcoin.eur!,
							'eur'
						)} €\n<b>USD:</b> ${currencyFormatter(
							currency?.bitcoin.usd!,
							'usd'
						)} $\n<b>RUB:</b> ${currencyFormatter(
							currency?.bitcoin.rub!,
							'rub'
						)} ₽`,
						{
							parse_mode: 'HTML',
							reply_markup: {
								inline_keyboard: [previousButton('settings')],
							},
						}
					)
				} catch (error) {
					return query.reply(String(error))
				}
			case 'bitcoin-add':
				try {
					// @ts-ignore
					const coinSplit = query.update.callback_query?.data.split('-')
					const currencyFind = await prisma.currency.findFirst({
						where: {
							key: coinSplit[0],
						},
					})
					if (!currencyFind) {
						return query.editMessageText(
							'Произошла ошибка при установки валюты',
							{
								parse_mode: 'HTML',

								reply_markup: {
									inline_keyboard: [previousButton('settings')],
								},
							}
						)
					}
					await prisma.user.update({
						where: {
							id: query.from.id.toString(),
						},
						data: {
							currency: {
								connect: {
									id: currencyFind.id,
								},
							},
						},
					})
					return query.editMessageText(
						`Вы успешно установили себе валюту ${currencyFind.value}`,
						{
							parse_mode: 'HTML',

							reply_markup: {
								inline_keyboard: [previousButton('settings')],
							},
						}
					)
				} catch (error) {
					return query.reply(String(error))
				}
			case 'history_transfer':
				console.log('enter to transfer history callback')
				return transferHistory(query)
			case 'buy':
				const getUserForBuy = await prisma.user.findFirst({
					where: {
						id: query.from.id.toString(),
					},
					include: {
						wallet: true,
					},
				})
				const userBalanceForBuy = await getWalletBalance(
					getUserForBuy?.wallet?.address
				)
				if (userBalanceForBuy === 0)
					return query.answerCbQuery(
						'🚫 Баланс на вашем кошельке недостаточен для продажи BTC.',
						{
							show_alert: true,
						}
					)
				const paymentMethodsForBuy = await prisma.paymentMethod.findMany()
				const paymentMethodButtonForBuy: InlineKeyboardButton[][] =
					paymentMethodsForBuy.map(paymentMethod => {
						return [
							{
								callback_data: `buy_payment_method_${paymentMethod.id}`,
								text: paymentMethod.name,
							},
						]
					})
				return query.editMessageText(
					`Выберите способ оплаты для покупки BTC за RUB.`,
					{
						parse_mode: 'HTML',
						reply_markup: {
							inline_keyboard: [
								...paymentMethodButtonForBuy,
								previousButton('p2p_transfer'),
							],
						},
					}
				)
			case 'profile':
				const userForProfile = await prisma.user.findFirst({
					where: {
						id: query.from.id.toString(),
					},
					include: {
						Contract: true,
					},
				})
				return query.editMessageText(
					`👤 <b>${userForProfile?.username}</b> ${
						userForProfile?.isAdmin ? '[Администратор]' : ''
					}\n\n<b>Статистика торговли</b>\n📈 <i>Количество сделок:</i> <b>${
						userForProfile?.Contract.length
					}</b>`,
					{
						parse_mode: 'HTML',
						reply_markup: {
							inline_keyboard: [previousButton('p2p_transfer')],
						},
					}
				)
			case 'sell':
				const getUser = await prisma.user.findFirst({
					where: {
						id: query.from.id.toString(),
					},
					include: {
						wallet: true,
					},
				})
				const userBalance = await getWalletBalance(getUser?.wallet?.address)

				if (userBalance === 0)
					return query.answerCbQuery(
						'🚫 Баланс на вашем кошельке недостаточен для продажи BTC.',
						{
							show_alert: true,
						}
					)
				const paymentMethods = await prisma.paymentMethod.findMany()
				const paymentMethodButton: InlineKeyboardButton[][] =
					paymentMethods.map(paymentMethod => {
						return [
							{
								callback_data: `sell_payment_method_${paymentMethod.id}`,
								text: paymentMethod.name,
							},
						]
					})
				return query.editMessageText(
					`Выберите способ оплаты для продажи BTC за RUB.`,
					{
						parse_mode: 'HTML',
						reply_markup: {
							inline_keyboard: [
								...paymentMethodButton,
								previousButton('p2p_transfer'),
							],
						},
					}
				)
			case 'add_my_contract':
				return query.scene.enter('add_contract')
			case 'my_ads':
				return getMyContracts(query)
			case 'wallet':
				try {
					const wallet = await createWallet(query.from.id)
					if (!wallet) {
						const userWallet = await prisma.user.findFirst({
							where: {
								id: query.from.id.toString(),
							},
							include: {
								wallet: true,
							},
						})
						if (userWallet) {
							const balance = await getWalletBalance(userWallet.wallet?.address)

							return query.editMessageText(
								`<b>👛 BitLimix | Кошелек</b>\n\nУ вас на балансе <b>${balance} BTC</b>.\nАдрес кошелька: <code><b>${userWallet.wallet?.address}</b></code>\nМнемоническая фраза: <code>${userWallet.wallet?.mnemonicPhrase}</code>\nПриватный ключ: <code>${userWallet.wallet?.privateKey}</code>`,
								{
									parse_mode: 'HTML',

									reply_markup: {
										inline_keyboard: [
											...walletInlineKeyboard,
											[
												...previousButton('main_menu'),
												{
													callback_data: 'history_transfer',
													text: '⏱️ История переводов',
												},
											],
										],
									},
								}
							)
						}
						return query.editMessageText('У Вас уже создан кошелек', {
							parse_mode: 'Markdown',
							reply_markup: {
								inline_keyboard: [previousButton('main_menu')],
							},
						})
					}
					return query.editMessageText(
						`<b>Кошелек успешно создан</b>\nАдрес вашего кошелька: <code>${wallet}</code>`,
						{
							parse_mode: 'HTML',
							reply_markup: {
								inline_keyboard: [previousButton('main_menu')],
							},
						}
					)
				} catch (error) {
					return query.reply(String(error))
				}
		}
		const matchRequisite = data.match(/^requisite_(\d+)$/)
		const matchSellPaymentMethod = data.match(/^sell_payment_method_(\d+)$/)
		const matchBuyPaymentMethod = data.match(/^buy_payment_method_(\d+)$/)
		const matchDeleteRequisite = data.match(/^delete_requisite_(\d+)$/)
		if (matchDeleteRequisite) {
			const itemId = Number(matchDeleteRequisite[1])
			await prisma.requisite.delete({
				where: {
					id: itemId,
				},
			})
			await query.editMessageText(`Реквизиты удалены.`, {
				parse_mode: 'HTML',
				reply_markup: {
					inline_keyboard: [previousButton('requisites')],
				},
			})
		}
		if (matchSellPaymentMethod) {
			const itemId = Number(matchSellPaymentMethod[1])
			const user = await prisma.user.findFirst({
				where: {
					id: query.from.id.toString(),
				},
				include: {
					Requisite: {
						include: {
							paymentMethod: true,
						},
					},
				},
			})
			const paymentMethod = await prisma.paymentMethod.findFirst({
				where: {
					id: itemId,
				},
			})
			if (
				user?.Requisite.find(
					requisite => requisite.paymentMethod.id === paymentMethod?.id
				)
			) {
				const contracts = await prisma.contract.findMany({
					where: {
						paymentMethodId: paymentMethod?.id,
						type: 'sell',
					},
					include: {
						author: true,
					},
				})
				const contractsButtons: InlineKeyboardButton[][] = contracts.map(
					contract => {
						return [
							{
								callback_data: `contract_${contract.id}`,
								text: `${contract.author.username} | ${parseFloat(
									String(contract.amount)
								)} BTC | ${contract.price} RUB за шт.`,
							},
						]
					}
				)
				return query.editMessageText(
					`💳 Здесь вы можете продать BTC за RUB через ${paymentMethod?.name}.`,
					{
						parse_mode: 'HTML',
						reply_markup: {
							inline_keyboard: [...contractsButtons, previousButton('sell')],
						},
					}
				)
			}
			return query.answerCbQuery(
				'🚫 У вас нет реквизитов для этого банка, чтобы продолжить создание сделки',
				{
					show_alert: true,
				}
			)
		}
		if (matchBuyPaymentMethod) {
			const itemId = Number(matchBuyPaymentMethod[1])
			const user = await prisma.user.findFirst({
				where: {
					id: query.from.id.toString(),
				},
				include: {
					Requisite: {
						include: {
							paymentMethod: true,
						},
					},
				},
			})
			const paymentMethod = await prisma.paymentMethod.findFirst({
				where: {
					id: itemId,
				},
			})
			if (
				user?.Requisite.find(
					requisite => requisite.paymentMethod.id === paymentMethod?.id
				)
			) {
				const contracts = await prisma.contract.findMany({
					where: {
						paymentMethodId: paymentMethod?.id,
						type: 'buy',
					},
					include: {
						author: true,
					},
				})
				const contractsButtons: InlineKeyboardButton[][] = contracts.map(
					contract => {
						return [
							{
								callback_data: `contract_${contract.id}`,
								text: `${contract.author.username} | ${parseFloat(
									String(contract.amount)
								)} BTC | ${contract.price} RUB за шт.`,
							},
						]
					}
				)
				return query.editMessageText(
					`💳 Здесь вы можете продать BTC за RUB через ${paymentMethod?.name}.`,
					{
						parse_mode: 'HTML',
						reply_markup: {
							inline_keyboard: [...contractsButtons, previousButton('buy')],
						},
					}
				)
			}
			return query.answerCbQuery(
				'🚫 У вас нет реквизитов для этого банка, чтобы продолжить создание сделки',
				{
					show_alert: true,
				}
			)
		}
		if (matchRequisite) {
			const itemId = matchRequisite[1]
			const requisite = await prisma.requisite.findFirst({
				where: {
					id: Number(itemId),
				},
				include: {
					paymentMethod: true,
				},
			})
			// Здесь вы можете выполнить действия с вашим itemId
			if (requisite) {
				await query.editMessageText(
					`<b>Платёжные реквизиты</b>\n\nТип операции: <code>Банковский перевод</code>\nВалюта: <code>${requisite.currency}</code>\nСпособ оплаты: <code>${requisite.paymentMethod.name}</code>\nРеквизиты: <code>${requisite.phoneOrbankCardNumber}</code>`,
					{
						parse_mode: 'HTML',
						reply_markup: {
							inline_keyboard: [
								[
									{
										callback_data: `delete_requisite_${requisite.id}`,
										text: '❌ Удалить реквизиты',
									},
								],
								previousButton('requisites'),
							],
						},
					}
				)
			}
		}
	})
}
