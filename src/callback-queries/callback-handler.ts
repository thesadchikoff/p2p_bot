import { bot } from '../config/bot'
import { currencies } from '../keyboards/inline-keyboards/currencies.inline'
import { inlineKeyboardForSettings } from '../keyboards/inline-keyboards/keyboard-for-settings.inline'
import { previousButton } from '../keyboards/inline-keyboards/previous-button.inline'
import { createWallet } from '../trust-wallet/create-wallet'

import { Networks } from 'bitcore-lib'
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import { getMyContracts } from '../callbacks/get-my-contracts'
import { myCodes } from '../callbacks/my-codes'
import { requisites } from '../callbacks/requisites'
import { transferHistory } from '../callbacks/transfer-history'
import { config } from '../config/service.config'
import { marketKeyboard } from '../keyboards/inline-keyboards/p2p-keyboard.inline'
import { promoCodesButtons } from '../keyboards/inline-keyboards/promo-codes'
import { startInlineKeyboards } from '../keyboards/inline-keyboards/start-keyboard.inline'
import { walletInlineKeyboard } from '../keyboards/inline-keyboards/wallet.inline'
import { prisma } from '../prisma/prisma.client'
import currencyService from '../service/currency.service'
import { getWalletBalance } from '../trust-wallet/get-balance'
import { replenishBtc } from '../trust-wallet/replenish-coin'
import { sendCoin } from '../trust-wallet/send-coin'
import { currencyFormatter } from '../utils/currency-formatter'
import { dateFormat } from '../utils/format-date'

export const callbackHandler = () => {
	bot.on('callback_query', async query => {
		try {
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
							`<b>🔧 ${config.shopName} | Настройки</b>\n\nВаше уникальное имя в боте: <b>${user?.login}</b>\n\nТут вы можете настроить ваш аккаунт.`,
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
				case 'promo':
					try {
						const myCodes = await prisma.code.findMany({
							where: {
								creatorId: query.from.id.toString(),
							},
						})
						return query.reply('🎫 Управление кодами', {
							reply_markup: {
								inline_keyboard: promoCodesButtons(myCodes.length),
							},
						})
					} catch (error) {
						console.error(error)
					}
				case 'activate_code':
					return query.scene.enter('activate-promo')
				case 'promo_information':
					try {
						return query.editMessageText(
							`ℹ️ О ${config.shopName} Codes\nВ этом разделе вы можете управлять вашими кодами ${config.shopName} Code\n${config.shopName} Code  - это код на сумму в криптовалюте, который может быть активирован любым пользователем ${config.shopName}\nПри создании кода, указанная вами сумма будет заблокирована в депонировании до тех пор, пока код не будет активирован или деактивирован\nСумма неактивированного кода учитывается при активации ваших объявлений на покупку\nВы можете передавать ссылку с кодом пользователям, которые не имеют аккаунта на ${config.shopName}. Каждый зарегистрированный по вашей ссылке пользователь будет автоматически становиться вашим рефералом`,
							{
								parse_mode: 'HTML',
								reply_markup: {
									inline_keyboard: [previousButton('promo')],
								},
							}
						)
					} catch (error) {
						console.error(error)
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
						const userWallet = await prisma.user.findFirst({
							where: {
								id: query.from.id.toString(),
							},
							include: {
								wallet: true,
							},
						})
						return query.editMessageText(
							`❗️Минимальная сумма пополнения Bitcoin: <b>0.0010 BTC</b>.\n\nЕсли вы решите пополнить меньше <b>0.0010 BTC</b>, то они не будут зачислены на ваш баланс.\n\nАдрес вашего кошелька: <code>${userWallet?.wallet?.address}</code>`,
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
					} catch (error) {
						return query.reply(String(error))
					}
				case 'decline':
					query.session = {}
					query.scene.leave()
					return query.scene.enter('transfer')
				case 'contacts_note':
					const contacts = await prisma.addressBook.findMany({
						where: {
							userId: query.from?.id.toString(),
						},
					})
					const contactsButtons: InlineKeyboardButton[] = []
					contacts.forEach(contact => {
						contactsButtons.push({
							callback_data: `address-contact-${contact.id}`,
							text: contact.name,
						})
					})
					return query.editMessageText('📃 Адресная книга для BTC', {
						reply_markup: {
							inline_keyboard: [
								contactsButtons,
								[
									{ callback_data: 'create-address', text: 'Создать' },
									...previousButton('wallet'),
								],
							],
						},
					})
				case 'create-address':
					return query.scene.enter('address-book')
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
						`<strong>💱 ${config.shopName} | 💱 Обмен криптовалюты</strong>\n\n
		Все транзакции осуществляются между участниками нашего сервиса.\n\nМы выступаем в роли посредника, удерживая криптовалюту продавца до завершения операции.\nЭто обеспечивает безопасность как для продавца, так и для покупателя.\n\nВы можете заключать сделки на основе предложений других пользователей или создавать свои собственные объявления с индивидуальными условиями.
		`,
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
							`<b>💰 ${config.shopName} | Меню</b>\n\nВыберите интересующий вас пункт:`,
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
							`<b>💵 ${config.shopName} | Изменение валюты</b>\n\nВыберите валюту, за которой хотите наблюдать:`,
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
								`<b>📊 ${config.shopName} | Курс</b>\n\nНе получилось получить курс валюты\n\nПеред тем как получить курс валюты, вам необходимо выбрать ее`,
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
							`<b>📊 ${config.shopName} | Курс ${
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
				case 'create_code':
					return query.scene.enter('create-promo')
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
					// if (userBalanceForBuy === 0)
					// 	return query.answerCbQuery(
					// 		'🚫 Баланс на вашем кошельке недостаточен для продажи BTC.',
					// 		{
					// 			show_alert: true,
					// 		}
					// 	)
					const paymentMethodsForBuy = await prisma.paymentMethod.findMany({
						include: {
							Contract: {
								where: {
									type: 'buy',
								},
							},
						},
					})
					const paymentMethodButtonForBuy: InlineKeyboardButton[][] =
						paymentMethodsForBuy.map(paymentMethod => {
							return [
								{
									callback_data: `buy_payment_method_${paymentMethod.id}`,
									text: `${paymentMethod.name} | [${paymentMethod.Contract.length}]`,
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

					// if (userBalance === 0)
					// 	return query.answerCbQuery(
					// 		'🚫 Баланс на вашем кошельке недостаточен для продажи BTC.',
					// 		{
					// 			show_alert: true,
					// 		}
					// 	)
					const paymentMethods = await prisma.paymentMethod.findMany({
						include: {
							Contract: {
								where: {
									type: 'sell',
								},
							},
						},
					})
					const paymentMethodButton: InlineKeyboardButton[][] =
						paymentMethods.map(paymentMethod => {
							return [
								{
									callback_data: `sell_payment_method_${paymentMethod.id}`,
									text: `${paymentMethod.name} | [${paymentMethod.Contract.length}]`,
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
				case 'buy_contract':
					return query.scene.enter('buy-contract', {
						// @ts-ignore
						id: query.scene.state.contractId,
					})
				case 'my_ads':
					return getMyContracts(query)
				case 'my_codes':
					return myCodes(query)
				case 'wallet':
					try {
						const registrationDate = new Date(user?.createdAt!)
						const currentDate = new Date()
						const diffInMs = currentDate.getTime() - registrationDate.getTime()
						const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
						const wallet = await createWallet(query.from.id)
						const balance = await getWalletBalance(wallet)
						const convertToRuble = await currencyService.convertRubleToBTC(
							balance!
						)
						const contractTransactions =
							await prisma.contractTransaction.findMany({
								where: {
									sellerId: query.from.id.toString(),
								},
							})
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
								const balance = await getWalletBalance(
									userWallet.wallet?.address
								)
								const convertToRuble = await currencyService.convertRubleToBTC(
									balance!
								)
								return query.editMessageText(
									`🏦 <b>${
										config.shopName
									}</b>\n\n<b>Ваш баланс:</b> ${balance} BTC ≈ ${convertToRuble} RUB\n\n<b>Вы пополнили:</b> ${
										user?.totalAmountAdd
									} BTC\n<b>Вы вывели:</b> ${
										user?.totalAmountReplenish
									} BTC\n\n<b>Ваш уникальный никнейм бота:</b> ${
										user?.login
									}\n\n<b>Отзывы о вас:</b> (0)👍 (0)👎\n\n<b>Дней в нашем сервисе:</b> ${diffInDays}\n<b>Вы совершили удачных сделок:</b> ${
										contractTransactions.length
									} на сумму ${contractTransactions.reduce(
										(currentSum, currentTransaction) =>
											currentSum + currentTransaction.amount,
										0
									)} BTC\n<b>Вы защищены нашим сервисом от взлома и кражи ваших BTC.</b>`,
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
							`🏦 <b>${
								config.shopName
							}</b>\n\n<b>Ваш баланс:</b> ${balance} BTC ≈ ${convertToRuble} RUB\n\n<b>Вы пополнили:</b> ${
								user?.totalAmountAdd
							} BTC\n<b>Вы вывели:</b> ${
								user?.totalAmountReplenish
							} BTC\n\n<b> уникальный никнейм бота:</b> ${
								user?.login
							}\n\n<b>Отзывы о вас:</b> (0)👍 (0)👎\n\n<b>Дней в нашем сервисе:</b> ${diffInDays}\n<b>Вы совершили удачных сделок:</b> ${
								contractTransactions.length
							} на сумму ${contractTransactions.reduce(
								(currentSum, currentTransaction) =>
									currentSum + currentTransaction.amount,
								0
							)} BTC\n<b>Вы защищены нашим сервисом от взлома и кражи ваших BTC.</b>`,
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
					} catch (error) {
						console.error(error)
						return query.reply(String(error))
					}
			}
			const matchRequisite = data.match(/^requisite_(\d+)$/)
			const matchSellPaymentMethod = data.match(/^sell_payment_method_(\d+)$/)
			const matchBuyPaymentMethod = data.match(/^buy_payment_method_(\d+)$/)
			const matchDeleteRequisite = data.match(/^delete_requisite_(\d+)$/)
			const matchSelfContract = data.match(/^contract-item-(\d+)$/)
			const matchSellContract = data.match(/^sell_contract_(\d+)$/)
			const matchBuyContract = data.match(/^buy_contract_(\d+)$/)
			const matchPaymentContract = data.match(/^payment-contract-(\d+)$/)
			const matchDeleteContract = data.match(/^delete-contract-(\d+)$/)
			const matchSendMessageTo = data.match(/^send-message-(\d+)$/)
			const matchPaymentSuccessful = data.match(/^payment-successful-(\d+)$/)
			const matchCancelContract = data.match(/^cancel-contract-(\d+)$/)
			const matchContactAddress = data.match(/^address-contact-(\d+)$/)
			const matchDeleteContactAddress = data.match(/^delete-contact-(\d+)$/)
			if (matchDeleteContactAddress) {
				const itemId = Number(matchDeleteContactAddress[1])
				await prisma.addressBook
					.delete({
						where: {
							id: itemId,
						},
					})
					.then(response => {
						return query.editMessageText(`Контакт ${response.name} удален`, {
							reply_markup: {
								inline_keyboard: [previousButton('contacts_note')],
							},
						})
					})
			}
			if (matchContactAddress) {
				matchContactAddress
				const itemId = Number(matchContactAddress[1])
				const contact = await prisma.addressBook.findFirst({
					where: {
						id: itemId,
					},
				})
				return query.editMessageText(
					`<b>Название адреса:</b> ${contact?.name}\n\n<b>Монета:</b> BTC\n<b>Адрес:</b> <code>${contact?.address}</code>`,
					{
						parse_mode: 'HTML',
						reply_markup: {
							inline_keyboard: [
								[
									{
										callback_data: `delete-contact-${contact?.id}`,
										text: 'Удалить',
									},
								],
								previousButton('contacts_note'),
							],
						},
					}
				)
			}
			if (matchBuyContract) {
				const itemId = Number(matchBuyContract[1])
				// @ts-ignore
				query.scene.state.contractId = itemId
				await prisma.contract
					.findFirst({
						where: {
							id: itemId,
						},
						include: {
							author: {
								include: {
									SellerContractTransaction: true,
									toTransfers: true,
								},
							},
							paymentMethod: true,
						},
					})
					.then(async response => {
						const buttonText = response?.type === 'buy' ? 'Продать' : 'Купить'

						return query.editMessageText(
							`📜 ID: #${response?.code}\n\nЦена за 1 BTC: ${currencyFormatter(
								response?.amount!,
								response?.currency!
							)}\nКомиссия сервиса: 0%\n\nВремя на оплату сделки: 15 минут\n\nТрейдер: @${
								response?.author.login
							}\nРепутация: 100%\nВерификация: ✔️\nОтзывы: 😊(0) 🙁(0)\n\nПровел сделок: ${
								response?.author.toTransfers.length
							}\n\nЗарегистрирован: ${dateFormat(
								response?.author.createdAt!
							)}\n\nУсловия:\nМинимальная сумма - ${currencyFormatter(
								response!.price!,
								response?.currency!
							)}\nМаксимальная сумма - ${currencyFormatter(
								response!.maxPrice!,
								response?.currency!
							)}`,
							{
								parse_mode: 'HTML',
								reply_markup: {
									inline_keyboard: [
										[
											{
												callback_data: `buy_contract`,
												text: `✅ ${buttonText}`,
											},
										],
										previousButton('sell'),
									],
								},
							}
						)
					})
			}
			if (matchCancelContract) {
				const itemId = Number(matchCancelContract[1])

				const transaction = await prisma.user.findFirst({
					where: {
						id: itemId.toString(),
					},
					include: {
						SellerContractTransaction: true,
					},
				})
				if (transaction?.SellerContractTransaction) {
					await prisma.contractTransaction.delete({
						where: {
							id: transaction.SellerContractTransaction.id,
						},
					})
					await query.reply(
						`Сделка #${transaction.SellerContractTransaction.code} отменена`
					)
					await query.telegram.sendMessage(
						Number(transaction.SellerContractTransaction.buyerId),
						`Сделка #${transaction.SellerContractTransaction.code} отменена`
					)
					return
				}
				return
			}
			if (matchPaymentSuccessful) {
				const itemId = Number(matchPaymentSuccessful[1])
				const transaction = await prisma.contractTransaction.findFirst({
					where: {
						buyerId: itemId.toString(),
					},
					include: {
						buyer: {
							include: {
								wallet: true,
							},
						},
						seller: true,
					},
				})
				if (transaction) {
					const coins = await currencyService.convertRubleToBTC(
						transaction.amount
					)
					await prisma.contractTransaction.delete({
						where: {
							buyerId: itemId.toString(),
						},
					})
					await query.telegram.sendMessage(
						itemId,
						`Продавец @${
							transaction.seller!.login
						} подтвердил получение денежных средств по сделке #${
							transaction.code
						}, ожидайте поступления ${coins} BTC на ваш счет`
					)
					await query.reply(
						`Вы подтвердили получение денежных средств, ${coins} BTC будут списаны с вашего счета и начислены пользователю @${
							transaction.buyer!.login
						}`
					)
					sendCoin(
						Number(transaction.sellerId),
						transaction.buyer?.wallet?.address!,
						Number(coins),
						Networks.mainnet
					)
				}
			}
			if (matchPaymentContract) {
				const itemId = Number(matchPaymentContract[1])
				const user = await prisma.user.findFirst({
					where: {
						id: itemId.toString(),
					},
					include: {
						BuyerContractTransaction: {
							include: {
								contract: true,
							},
						},
					},
				})
				await query.telegram.sendMessage(
					user?.BuyerContractTransaction?.sellerId!,
					`Пользователь @${user?.login} произвел оплату по сделке #${user?.BuyerContractTransaction?.code}`,
					{
						parse_mode: 'HTML',
						reply_markup: {
							inline_keyboard: [
								[
									{
										callback_data: `payment-successful-${user?.BuyerContractTransaction?.buyerId}`,
										text: '✅ Деньги получены',
									},
									{
										callback_data: `send-message-${user?.BuyerContractTransaction?.buyerId}`,
										text: '✉️ Ответить',
									},
								],
							],
						},
					}
				)
			}
			if (matchSendMessageTo) {
				const itemId = Number(matchSendMessageTo[1])
				return query.scene.enter('send_message', {
					id: itemId,
				})
			}
			if (matchSellContract) {
				const itemId = Number(matchSellContract[1])
				// @ts-ignore
				query.scene.state.contractId = itemId
				await prisma.contract
					.findFirst({
						where: {
							id: itemId,
						},
						include: {
							author: {
								include: {
									SellerContractTransaction: true,
									toTransfers: true,
								},
							},
							paymentMethod: true,
						},
					})
					.then(async response => {
						const buttonText = response?.type === 'buy' ? 'Продать' : 'Купить'

						return query.editMessageText(
							`📜 ID: #${response?.code}\n\nЦена за 1 BTC: ${currencyFormatter(
								response?.amount!,
								response?.currency!
							)}\nКомиссия сервиса: 0%\n\nВремя на оплату сделки: 15 минут\n\nТрейдер: @${
								response?.author.login
							}\nРепутация: 100%\nВерификация: ✔️\nОтзывы: 😊(0) 🙁(0)\n\nПровел сделок: ${
								response?.author.toTransfers.length
							}\n\nЗарегистрирован: ${dateFormat(
								response?.author.createdAt!
							)}\n\nУсловия:\nМинимальная сумма - ${currencyFormatter(
								response!.price!,
								response?.currency!
							)}\nМаксимальная сумма - ${currencyFormatter(
								response!.maxPrice!,
								response?.currency!
							)}`,
							{
								parse_mode: 'HTML',
								reply_markup: {
									inline_keyboard: [
										[
											{
												callback_data: `buy_contract`,
												text: `✅ ${buttonText}`,
											},
										],
										previousButton('sell'),
									],
								},
							}
						)
					})
			}
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
			if (matchDeleteContract) {
				const itemId = Number(matchDeleteContract[1])
				await prisma.contract
					.delete({
						where: {
							id: itemId,
						},
					})
					.then(res => {
						return query.editMessageText(`Заявка <a>#${res.id}</a> удалена`, {
							parse_mode: 'HTML',
							reply_markup: {
								inline_keyboard: [previousButton('my_ads')],
							},
						})
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
									callback_data: `sell_contract_${contract.id}`,
									text: `${contract.author.username} | ${currencyFormatter(
										contract.amount,
										contract.currency!
									)} | ${currencyFormatter(
										contract.price,
										contract.currency!
									)} - ${currencyFormatter(
										contract.maxPrice!,
										contract.currency!
									)}`,
								},
							]
						}
					)
					return query.editMessageText(
						`💳 Здесь вы можете купить BTC за RUB через ${paymentMethod?.name}.`,
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
									callback_data: `buy_contract_${contract.id}`,
									text: `${contract.author.username} | ${currencyFormatter(
										contract.amount,
										contract.currency!
									)} | ${currencyFormatter(
										contract.price,
										contract.currency!
									)} - ${currencyFormatter(
										contract.maxPrice!,
										contract.currency!
									)}`,
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
			if (matchSelfContract) {
				const itemId = Number(matchSelfContract[1])
				const course = await currencyService.getCurrency('bitcoin')
				await prisma.contract
					.findFirst({
						where: {
							id: itemId,
						},
						include: {
							paymentMethod: true,
						},
					})
					.then(res => {
						return query.editMessageText(
							`📰 Заявка <a>#${res?.id}</a>\n\n<b>Метод оплаты:</b> ${
								res?.paymentMethod.name
							}\n<b>Курс 1 BTC: </b>${currencyFormatter(
								course?.bitcoin.rub!,
								'rub'
							)}\n<b>Минимальная сумма:</b> ${res?.price} ${
								res?.currency
							}\n<b>Максимальная сумма:</b> ${res?.maxPrice} ${res?.currency}`,
							{
								parse_mode: 'HTML',

								reply_markup: {
									inline_keyboard: [
										[
											{
												callback_data: `delete-contract-${res?.id}`,
												text: '❌ Удалить контракт',
											},
										],
										[...previousButton('my_ads')],
									],
								},
							}
						)
					})
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
		} catch (error) {
			console.log(error)
			return query.reply('❗️ Произошла непредвиденная ошибка')
		}
	})
}
