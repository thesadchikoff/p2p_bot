import { Networks, PrivateKey } from 'bitcore-lib'
// @ts-ignore
import Mnemonic from 'bitcore-mnemonic'

export const createWallet = (network = Networks.mainnet) => {
	let privateKey = new PrivateKey(network.name)
	let address = privateKey.toAddress()
	let net = privateKey
	return {
		privateKey: privateKey.toString(),
		address: address.toString(),
		network: net,
	}
}

// Mainnet Address: 1FSoWv6QDAQfSuLdWCxKqzGg6F8vHTyn6c
// console.log(createWallet())

export const createHDWallet = (network = Networks.testnet) => {
	let passPhrase = new Mnemonic(Mnemonic.Words.ENGLISH)
	let xpriv = passPhrase.toHDPrivateKey(passPhrase.toString(), network)
	return {
		xpub: xpriv.xpubkey,
		privateKey: xpriv.privateKey.toString(),
		address: xpriv.publicKey.toAddress().toString(),
		mnemonic: passPhrase.toString(),
	}
}
