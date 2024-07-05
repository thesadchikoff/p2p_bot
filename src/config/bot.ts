import 'dotenv/config'
import { Scenes, Telegraf } from 'telegraf'
export const bot = new Telegraf<Scenes.SceneContext>(
	process.env.TG_BOT_TOKEN as string
)
