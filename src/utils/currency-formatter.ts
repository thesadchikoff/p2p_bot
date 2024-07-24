export const currencyFormatter = (
	value: number,
	currency: 'rub' | 'eur' | 'usd' | string
): Intl.NumberFormat | string => {
	try {
		const result = new Intl.NumberFormat('ru', {
			currency,
			style: 'currency',
		})
		return result.format(value)
	} catch (error) {
		return 'сумма не определена'
	}
}
