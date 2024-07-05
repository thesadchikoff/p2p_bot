import { SceneContext } from 'telegraf/typings/scenes'
import { previousButton } from '../keyboards/inline-keyboards/previous-button.inline'
import { prisma } from '../prisma/prisma.client'
import { dateFormat } from '../utils/format-date'

export const transferHistory = async (ctx: SceneContext) => {
	const user = await prisma.user.findFirst({
		where: {
			id: ctx.from?.id.toString(),
		},
	})
	if (!user) {
		return ctx.editMessageText('Не удалось получить историю переводов', {
			reply_markup: {
				inline_keyboard: [previousButton('wallet')],
			},
		})
	}
	const transfers = await prisma.transfer.findMany({
		where: {
			fromUserId: user.id,
		},
	})
	if (!transfers.length) {
		return ctx.editMessageText(
			'<b>⏱️ История переводов:</b>\n\nВы пока не совершили ни одного перевода',
			{
				parse_mode: 'HTML',
				reply_markup: {
					inline_keyboard: [previousButton('wallet')],
				},
			}
		)
	}
	let transferData = ''

	const transferPromises = transfers.map(async transfer => {
		const toUser = await prisma.user.findFirst({
			where: {
				id: transfer.toUserId,
			},
		})
		return `[${dateFormat(transfer.createdAt)}] Перевод пользователю @${
			toUser?.username
		}. Сумма ${transfer.count} BTC.\n`
	})

	const results = await Promise.all(transferPromises)
	transferData = results.join('')

	await ctx.editMessageText(`<b>⏱️ История переводов:</b>\n\n${transferData}`, {
		reply_markup: {
			inline_keyboard: [previousButton('wallet')],
		},
		parse_mode: 'HTML',
	})
}
