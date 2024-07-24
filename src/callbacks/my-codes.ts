import { SceneContext } from 'telegraf/typings/scenes'
import { previousButton } from '../keyboards/inline-keyboards/previous-button.inline'
import { prisma } from '../prisma/prisma.client'

export const myCodes = async (ctx: SceneContext) => {
	await prisma.code
		.findMany({
			where: {
				creatorId: ctx.from?.id.toString(),
			},
		})
		.then(response => {
			if (response.length > 0) {
				let codeStroke = ''
				response.forEach((code, index) => {
					codeStroke += `<b>${++index}.</b> <code>${code.code}</code> | ${
						code.amountCoins
					} BTC\n`
				})
				return ctx.editMessageText(
					`🎫 <b>Список активных кодов</b>\n\n${codeStroke}`,
					{
						parse_mode: 'HTML',
						reply_markup: {
							inline_keyboard: [previousButton('promo')],
						},
					}
				)
			} else {
				return ctx.editMessageText(`🎫 Список активных кодов пуст`, {
					parse_mode: 'HTML',
					reply_markup: {
						inline_keyboard: [previousButton('promo')],
					},
				})
			}
		})
}
