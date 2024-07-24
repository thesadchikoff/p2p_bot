import { callbackHandler } from './callback-queries/callback-handler'
import { bot } from './config/bot'
import { attachmentCommands } from './init-bot/attachment-commands'
import { attachmentScenes } from './init-bot/attachment-scenes'

const main = () => {
	try {
		bot.telegram.setMyCommands([
			{
				command: '/start',
				description: 'Запустить бота',
			},
		])
		attachmentScenes()
		attachmentCommands()

		callbackHandler()

		bot.launch()
		bot.catch(error => {
			console.error('TELEGRAF ERROR', error)
		})
	} catch (error) {
		console.log(error)
	}
}

main()
