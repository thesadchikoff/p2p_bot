import * as bitcore from 'bitcore-lib'
// @ts-ignore
import axios from 'axios'
import { bot } from '../config/bot'
import { prisma } from '../prisma/prisma.client'

// @ts-ignore
export const replenishBtc = async (
	telegramId: number,
	privateKey: string,
	sourceAddress: string,

	amountToSend: number,
	network = bitcore.Networks.testnet
) => {
	const user = await prisma.user.findFirst({
		where: {
			id: telegramId.toString(),
		},
		include: {
			wallet: true,
		},
	})
	const recipientAddress = user?.wallet?.address
	const satoshiToSend = amountToSend * 100000000
	let fee = 0
	const satoshisPerByte = 9000
	let inputCount = 0
	let outputCount = 2
	let value = Buffer.from('The test phrase for transaction buffer')
	let hash = bitcore.crypto.Hash.sha256(value)
	// @ts-ignore
	let bn = bitcore.crypto.BN.fromBuffer(hash)
	let address2 = new bitcore.PrivateKey(bn, network).toAddress()

	async function getUTXOs(address: bitcore.Address) {
		const url = `https://blockstream.info/testnet/api/address/${address}/utxo`
		const response = await axios.get(url)
		// @ts-ignore
		return response.data.map(utxo => ({
			txId: utxo.txid,
			outputIndex: utxo.vout,
			address: address,
			script: bitcore.Script.buildPublicKeyHashOut(address).toString(),
			satoshis: utxo.value,
		}))
	}
	// Функция для отправки транзакции с использованием Blockstream API на Testnet
	async function broadcastTransaction(serializedTx: any) {
		const url = 'https://blockstream.info/api/tx'
		const response = await axios.post(url, serializedTx, {
			headers: {
				'Content-Type': 'text/plain',
			},
		})
		console.log(response)
		return response.data
	}
	async function sendBTC() {
		try {
			// @ts-ignore
			const utxos = await getUTXOs(sourceAddress)
			if (utxos.length === 0) {
				return bot.telegram.sendMessage(
					telegramId,
					'⚠️ <b>Перевод не выполнен</b>\n\nUTXo записи не обнаружены, вероятнее всего, баланс на вашем кошельке отсутствует',
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
			}

			console.log('UTXOs:', utxos)
			console.log('Amount to send:', amountToSend)
			console.log('Satoshis per byte:', satoshisPerByte)

			// Проверка сумм
			if (amountToSend <= 0) {
				return bot.telegram.sendMessage(
					telegramId,
					'⚠️ <b>Перевод не выполнен</b>\n\nСумма для отправки должна быть положительным целым числом',
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
			}
			if (satoshisPerByte <= 0) {
				return bot.telegram.sendMessage(
					telegramId,
					'⚠️ <b>Перевод не выполнен</b>\n\nКоличество сатоши на байт должно быть положительным целым числом',
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
			}

			// Проверка всех UTXO
			utxos.forEach((utxo: any) => {
				if (utxo.satoshis <= 0) {
					return bot.telegram.sendMessage(
						telegramId,
						`⚠️ <b>Перевод не выполнен</b>\n\nНедопустимые значения UTXO satoshis: ${utxo.satoshis}`,
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
				}
			})

			const tx = new bitcore.Transaction()
				.from(utxos)
				.to(recipientAddress!, satoshiToSend)
				.change(sourceAddress!)
				.fee(5000)
				.sign(privateKey!)

			const serializedTx = tx.serialize()
			const txid = await broadcastTransaction(serializedTx)
			return bot.telegram.sendMessage(
				telegramId,
				`✅ <b>Перевод выполнен</b>\n\nТранзакция успешно отправлена. TXID операции: ${txid}`,
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
		} catch (err) {
			return bot.telegram.sendMessage(
				telegramId,
				// @ts-ignore
				`⛔️ <b>Ошибка перевода</b>\n\nТранзакция совершилась с ошибкой: ${err.toString()}`,
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
		}
	}
	sendBTC()
}

// First Address
// mw6dgmHDkRtN6ypQzrDtv1Z87HWAETPR3F
// First Private Key
// d97ccb393e1d767cd382190db3e5381d598b17b920b3563d6bab81ad6b4b1cb4

// Second Address (In Balance)
// mtNFnSgRKKkpk8PxjuGN7x7pUiFqjsrWZm
// Second Private Key
// 89a614c57b0f37ced9bdcf7018ded5b756028f813105b3de7cf72e32634a2911

// Thirst Address
// Private Key 1b976ffb4e556f981b51d952941ed0e2d04bb3554197208100633e86a6c5de9b
// Address n2VKXDYKiRLXJYYa4o8WEEn9SEo56hhEwM
