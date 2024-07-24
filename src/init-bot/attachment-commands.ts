import { actCommand } from '@/commands/act.command'
import { startCommand } from '@/commands/start.command'
import { bot } from '@/config/bot'

export const attachmentCommands = () => {
	bot.start(startCommand)
	bot.command('act', actCommand)
}
