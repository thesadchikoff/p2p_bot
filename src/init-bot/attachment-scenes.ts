import { bot } from '@/config/bot'
import { ActivatePromo } from '@/scenes/activate-code'
import { AddContract } from '@/scenes/add-contract'
import { AddressBookScene } from '@/scenes/address-book'
import { TransferScene } from '@/scenes/base.scene'
import { BuyContract } from '@/scenes/buy-contract'
import { CreatePromo } from '@/scenes/create-promo'
import { ReplenishScene } from '@/scenes/replenish.scene'
import { SelectCurrency } from '@/scenes/select-currency'
import { SendMessage } from '@/scenes/send-message'
import { Scenes, session } from 'telegraf'
import { WizardContext } from 'telegraf/typings/scenes'

export const attachmentScenes = () => {
	const stage = new Scenes.Stage<WizardContext>([
		SelectCurrency,
		TransferScene,
		ReplenishScene,
		AddContract,
		CreatePromo,
		ActivatePromo,
		BuyContract,
		SendMessage,
		AddressBookScene,
	])
	bot.use(session())
	// @ts-ignore
	bot.use(stage.middleware())
}
