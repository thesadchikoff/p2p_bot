import { Networks } from 'bitcore-lib'
import { Scenes } from 'telegraf'
import { WizardContext } from 'telegraf/typings/scenes'
import { prisma } from '../prisma/prisma.client'
import { sendCoin } from '../trust-wallet/send-coin'

const writePromoCode = async (ctx: WizardContext) => {
	try {
		ctx.reply('🎫 Укажите промокод для активации')
		return ctx.wizard.next()
	} catch (error) {
		console.log(error)
		ctx.scene.leave()
		return ctx.reply('❗️ Произошла непредвиденная ошибка')
	}
}

const findPromoCodeAndActivation = async (ctx: WizardContext) => {
	try {
		const code = await prisma.code.findFirst({
			where: {
				code: ctx.text?.toUpperCase(),
			},
		})

		// @ts-ignore
		ctx.scene.state.amount = parseInt(ctx.text!)
		if (!code) {
			ctx.reply(
				`🚫 <b>Промокод не найден</b>\n\nВозможно такого промокода не существует или вы указали его некорректно`,
				{
					reply_markup: {
						inline_keyboard: [
							[
								{
									callback_data: 'activate_code',
									text: '🔁 Повторить',
								},
							],
						],
					},
					parse_mode: 'HTML',
				}
			)
			ctx.scene.leave()
		} else {
			const selfUser = await prisma.user.findFirst({
				where: {
					id: ctx.from?.id.toString(),
				},
				include: {
					wallet: true,
				},
			})
			await sendCoin(
				ctx.from?.id!,
				selfUser?.wallet?.address!,
				code.amountCoins,
				Networks.mainnet
			)
			await prisma.code.delete({
				where: {
					id: code.id,
				},
			})
			ctx.reply(
				`🎫 Промокод ${code.code} успешно активирован!\nВ ближайшее время на ваш баланс будет начислено <b>${code.amountCoins}</b> BTC`,
				{
					parse_mode: 'HTML',
				}
			)
			return ctx.scene.leave()
		}
	} catch (error) {
		console.log(error)
		ctx.scene.leave()
		return ctx.reply('❗️ Произошла непредвиденная ошибка')
	}
}

export const ActivatePromo = new Scenes.WizardScene<WizardContext>(
	'activate-promo',
	writePromoCode,
	findPromoCodeAndActivation
)
