import axios from 'axios'
import type { Currency, CurrencyData } from '../@types/curreny'
import { url } from '../config/api'

class CurrencyService {
	async getCurrency<T extends Currency>(
		currency: T
	): Promise<Record<T, CurrencyData> | undefined> {
		try {
			const { data } = await axios.get(
				url + `?ids=${currency}&vs_currencies=rub,usd,eur`
			)
			const result: Record<T, CurrencyData> = {
				[currency]: {
					rub: data[currency].rub,
					usd: data[currency].usd,
					eur: data[currency].eur,
				},
			} as Record<T, CurrencyData>
			return result
		} catch (error) {
			console.log(error)
		}
	}
}
export default new CurrencyService()
