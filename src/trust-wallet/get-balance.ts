import axios from 'axios'
import * as bitcore from 'bitcore-lib'

// Функция для получения UTXO с использованием Blockstream API на Testnet
// @ts-ignore
async function getUTXOs(address) {
	const url = `https://blockstream.info/api/address/${address}/utxo`
	const response = await axios.get(url)
	return response.data.map((utxo: any) => ({
		txId: utxo.txid,
		outputIndex: utxo.vout,
		address: address,
		script: bitcore.Script.buildPublicKeyHashOut(address).toString(),
		satoshis: utxo.value, // значение в сатоши
	}))
}

// Функция для получения баланса кошелька
// @ts-ignore
export async function getWalletBalance(address) {
	try {
		const utxos = await getUTXOs(address)
		if (utxos.length === 0) {
			return 0 // Если нет UTXO, баланс равен 0
		}

		// Суммирование всех сатоши из UTXO
		const totalSatoshis = utxos.reduce(
			// @ts-ignore
			(total, utxo) => total + utxo.satoshis,
			0
		)
		// Форматирование в BTC
		const balanceBTC = totalSatoshis / 100000000 // Сатоши в одном BTC
		return balanceBTC // Баланс в BTC
	} catch (err) {
		console.error('Ошибка получения баланса:', err)
		return null // В случае ошибки вернуть null
	}
}
