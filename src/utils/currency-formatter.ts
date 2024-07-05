export const currencyFormatter = (
	value: number,
	currency: 'rub' | 'eur' | 'usd'
): Intl.NumberFormat | string => {
	const result = new Intl.NumberFormat('ru', {
		currency,
		style: 'currency',
	})
	return result.format(value)
}
