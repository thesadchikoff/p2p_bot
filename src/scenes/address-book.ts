import { previousButton } from '@/keyboards/inline-keyboards/previous-button.inline'
import { prisma } from '@/prisma/prisma.client'
import { Scenes } from 'telegraf'
import { WizardContext } from 'telegraf/typings/scenes'

export const AddressBookScene = new Scenes.WizardScene<WizardContext>(
	'address-book',
	async ctx => {
		ctx.reply('Пришлите адрес для добавления в адресную книгу.')
		return ctx.wizard.next()
	},
	async ctx => {
		// @ts-ignore
		ctx.scene.session.address = ctx.text
		ctx.reply('Пришлите название для адреса')
		return ctx.wizard.next()
	},
	async ctx => {
		// @ts-ignore
		ctx.scene.session.contactName = ctx.text
		await prisma.addressBook.create({
			data: {
				// @ts-ignore
				address: ctx.scene.session.address as string,
				// @ts-ignore
				name: ctx.scene.session.contactName as string,
				userId: ctx.from?.id.toString()!,
			},
		})
		// @ts-ignore
		ctx.reply(`Адрес ${ctx.scene.session.contactName} успешно создан.`, {
			reply_markup: {
				inline_keyboard: [previousButton('contacts_note')],
			},
		})
		return ctx.scene.leave()
	}
)
