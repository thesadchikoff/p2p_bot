import { SceneSessionData } from 'telegraf/typings/scenes'

export interface CustomSceneSessionData extends SceneSessionData {
	name: string
	age: number
}
