import { Scenes, session } from 'telegraf'
import { callbackHandler } from './callback-queries/callback-handler'

import { WizardContext } from 'telegraf/typings/scenes'
import { startCommand } from './commands/start.command'
import { bot } from './config/bot'
import { AddContract } from './scenes/add-contract'
import { TransferScene } from './scenes/base.scene'
import { ReplenishScene } from './scenes/replenish.scene'
import { SelectCurrency } from './scenes/select-currency'

const stage = new Scenes.Stage<WizardContext>(
	[SelectCurrency, TransferScene, ReplenishScene, AddContract],
	{
		ttl: 10,
	}
)
bot.use(session())
// @ts-ignore
bot.use(stage.middleware())

startCommand()
callbackHandler()

bot.launch()
