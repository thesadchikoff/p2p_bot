import { Scenes } from 'telegraf'
import { WizardContext } from 'telegraf/typings/scenes'

export const ReplenishScene = new Scenes.WizardScene<WizardContext>(
	'replenish',
	async ctx => {
		console.log(ctx.session)
		await ctx.reply(`Укажите адрес кошелька, с которого хотите перевести BTC.`)
		return ctx.wizard.next()
	},
	async ctx => {
		console.log(ctx.session)
		await ctx.reply(
			`Укажите приватный ключ кошелька, с которого хотите перевести BTC.`
		)
		// @ts-ignore
		ctx.session.sourceAddress = ctx.text
		return ctx.wizard.next()
	},
	async ctx => {
		await ctx.reply(`Укажите количество BTC  для перевода.`)
		// @ts-ignore
		ctx.session.privateKey = ctx.text
		return ctx.wizard.next()
	},
	async ctx => {
		console.log('Finish scene')
		// @ts-ignore
		ctx.session.countBTC = ctx.text
		// @ts-ignore
		ctx.scene.state.countBTC = ctx.text
		ctx.scene.state = ctx.session.__scenes?.state!
		await ctx.reply(
			// @ts-ignore
			`Проверьте, все ли данные верны?.\n\nАдрес получателя: <code>${ctx.session?.sourceAddress}</code>\nПриватный ключ кошелька: ${ctx.session.privateKey}\nСумма перевода: <code>${ctx.session?.countBTC}</code> BTC`,
			{
				parse_mode: 'HTML',
				reply_markup: {
					inline_keyboard: [
						[
							{
								callback_data: 'confirm_replenish',
								text: 'Все верно',
							},
							{ callback_data: 'decline_replenish', text: 'Начать заново' },
						],
					],
				},
			}
		)
		return ctx.scene.leave()
	}
)
