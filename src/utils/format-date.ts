export const dateFormat = (date: Date) => {
	try {
		// const dateToFormat = new Date(date)
		const formatter = new Intl.DateTimeFormat('ru', {
			day: '2-digit',
			month: 'long',
			hour: '2-digit',
			minute: '2-digit',
		})
		return formatter.format(date)
	} catch (error) {
		return 'Дата не определена'
	}
}
