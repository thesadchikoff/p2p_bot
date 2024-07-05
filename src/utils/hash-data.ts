import * as argon2 from 'argon2'

export const hashData = (value: string | Buffer): Promise<string> | string => {
	try {
		return argon2.hash(value)
	} catch (error) {
		console.log(error)
		return 'Ошибка при шифровке данных'
	}
}

export const decodeHashData = (
	original: string,
	decodeValue: string
): Promise<Boolean> => {
	return argon2.verify(original, decodeValue)
}
