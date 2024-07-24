import { SceneContext } from 'telegraf/typings/scenes'
import { config } from '../config/service.config'
import { startInlineKeyboards } from '../keyboards/inline-keyboards/start-keyboard.inline'
import { prisma } from '../prisma/prisma.client'
import currencyService from '../service/currency.service'

export const startCommand = async (ctx: SceneContext) => {
	currencyService.convertRubleToBTC(500)
	const user = await prisma.user.findFirst({
		where: {
			id: ctx.chat!.id.toString(),
		},
	})
	if (!user) {
		await prisma.user.create({
			data: {
				id: ctx.from!.id.toString(),
				username: ctx.from!.username!,
				login: ctx.from!.username,
			},
		})
	}

	await ctx.reply(
		`<b>${config.shopName}</b>\n\nПокупайте, продавайте, храните, отправляйте и платите криптовалютой, когда хотите!\n\nВыберите действие:`,
		{
			parse_mode: 'HTML',
			reply_markup: {
				inline_keyboard: startInlineKeyboards,
			},
		}
	)
}
