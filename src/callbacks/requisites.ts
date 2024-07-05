import { SceneContext } from 'telegraf/typings/scenes'
import { requisiteKeyboard } from '../keyboards/inline-keyboards/requisites.inline'
import { prisma } from '../prisma/prisma.client'

export const requisites = async (ctx: SceneContext) => {
	const requisites = await prisma.requisite.findMany({
		where: {
			userId: ctx.from?.id.toString(),
		},
		include: {
			paymentMethod: true,
		},
	})

	return ctx.editMessageText(
		'Здесь вы можете управлять своими платёжными реквизитами, которые используются в P2P.',
		{
			parse_mode: 'HTML',
			reply_markup: {
				inline_keyboard: requisiteKeyboard(
					ctx.from?.id.toString()!,
					requisites
				),
			},
		}
	)
}
