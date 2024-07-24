import { Networks } from 'bitcore-lib'
import { prisma } from '../prisma/prisma.client'
import { createHDWallet } from './1'

export const createWallet = async (
	telegramId: number
): Promise<string | undefined> => {
	const user = await prisma.user.findFirst({
		where: {
			id: telegramId.toString(),
		},
		include: {
			wallet: true,
		},
	})
	if (!user || user.wallet) {
		return undefined
	}
	const wallet = createHDWallet(Networks.mainnet)
	await prisma.wallet.create({
		data: {
			user: {
				connect: {
					id: user.id,
				},
			},
			address: wallet.address,
			mnemonicPhrase: wallet.mnemonic,
			privateKey: wallet.privateKey,
		},
	})
	return wallet.address
}
