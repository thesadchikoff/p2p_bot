"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHDWallet = exports.createWallet = void 0;
const bitcore_lib_1 = require("bitcore-lib");
// @ts-ignore
const bitcore_mnemonic_1 = require("bitcore-mnemonic");
const createWallet = (network = bitcore_lib_1.Networks.mainnet) => {
    let privateKey = new bitcore_lib_1.PrivateKey(network.name);
    let address = privateKey.toAddress();
    let net = privateKey;
    return {
        privateKey: privateKey.toString(),
        address: address.toString(),
        network: net,
    };
};
exports.createWallet = createWallet;
// Mainnet Address: 1FSoWv6QDAQfSuLdWCxKqzGg6F8vHTyn6c
// console.log(createWallet())
const createHDWallet = (network = bitcore_lib_1.Networks.testnet) => {
    let passPhrase = new bitcore_mnemonic_1.default(bitcore_mnemonic_1.default.Words.ENGLISH);
    let xpriv = passPhrase.toHDPrivateKey(passPhrase.toString(), network);
    return {
        xpub: xpriv.xpubkey,
        privateKey: xpriv.privateKey.toString(),
        address: xpriv.publicKey.toAddress().toString(),
        mnemonic: passPhrase.toString(),
    };
};
exports.createHDWallet = createHDWallet;
