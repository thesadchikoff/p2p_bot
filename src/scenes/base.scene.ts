import { Scenes } from 'telegraf'
import { WizardContext } from 'telegraf/typings/scenes'

export const TransferScene = new Scenes.WizardScene<WizardContext>(
	'transfer',
	async ctx => {
		console.log(ctx.session)
		await ctx.reply(`Укажите адрес кошелька, на который хотите перевести BTC.`)
		return ctx.wizard.next()
	},
	async ctx => {
		await ctx.reply(`Укажите количество BTC  для перевода.`)
		// @ts-ignore
		ctx.session.recipientAddress = ctx.text
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
			`Проверьте, все ли данные верны?.\n\nАдрес получателя: <code>${ctx.session?.recipientAddress}</code>\nСумма перевода: <code>${ctx.session?.countBTC}</code> BTC`,
			{
				parse_mode: 'HTML',
				reply_markup: {
					inline_keyboard: [
						[
							{
								callback_data: 'confirm',
								text: 'Все верно',
							},
							{ callback_data: 'decline', text: 'Начать заново' },
						],
					],
				},
			}
		)
		return ctx.scene.leave()
	}
)
