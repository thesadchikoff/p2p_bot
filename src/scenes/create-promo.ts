import { prisma } from '@/prisma/prisma.client'
import { getWalletBalance } from '@/trust-wallet/get-balance'
import { Markup, Scenes } from 'telegraf'
import { WizardContext } from 'telegraf/typings/scenes'

const writeAmountForPromo = async (ctx: WizardContext) => {
	ctx.reply('Укажите номинал для промокода')
	return ctx.wizard.next()
}

const writePromoName = async (ctx: WizardContext) => {
	try {
		const user = await prisma.user.findFirst({
			where: {
				id: ctx.from?.id.toString(),
			},
			include: {
				wallet: true,
			},
		})
		const balance = await getWalletBalance(user?.wallet?.address)
		console.log(parseInt(ctx.text!), balance)
		// @ts-ignore
		ctx.scene.state.amount = parseInt(ctx.text!)
		if (balance! < parseInt(ctx.text!)) {
			ctx.reply('На вашем балансе недостаточно BTC.')
			ctx.wizard.back()
			return writeAmountForPromo(ctx)
		} else {
			ctx.reply('🎫 Укажите название промокода')
			return ctx.wizard.next()
		}
	} catch (error) {
		console.log(error)
		ctx.scene.leave()
		return ctx.reply('❗️ Произошла непредвиденная ошибка')
	}
}

const createPromoCode = async (ctx: WizardContext) => {
	try {
		// @ts-ignore
		ctx.scene.state.name = ctx.text!.toUpperCase()
		// @ts-ignore
		const amount = ctx.scene.state.amount
		// @ts-ignore
		const name = ctx.scene.state.name
		await prisma.code
			.create({
				data: {
					amountCoins: amount,
					code: name,
					creatorId: ctx.from?.id.toString(),
				},
			})
			.then(response => {
				ctx.reply(
					`Промокод <code>${response.code}</code> успешно создан!\nНоминал промокода - <b>${response.amountCoins} BTC</b>\n\n❗️ Не распространяйте промокод третьим лицам, ведь при его вводе с вашего балансе без подтверждения будет списана сумма равная номиналу промокода. Передавайте его внимательно.`,
					{
						parse_mode: 'HTML',
						reply_markup: {
							remove_keyboard: true,
							inline_keyboard: [
								[{ callback_data: 'main_menu', text: 'В главное меню' }],
							],
						},
					}
				)
			})
		ctx.scene.state = {}
		return ctx.scene.leave()
	} catch (error) {
		console.log(error)
		ctx.reply(
			'❗️ При создании промокода что-то пошло не так.',
			Markup.removeKeyboard()
		)
		ctx.scene.state = {}
		ctx.scene.leave()
		return true
	}
}

export const CreatePromo = new Scenes.WizardScene<WizardContext>(
	'create-promo',
	writeAmountForPromo,
	writePromoName,
	createPromoCode
)
