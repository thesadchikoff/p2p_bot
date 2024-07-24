"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const bip32 = require("bip32");
const bip39 = require("bip39");
const bitcoin = require("bitcoinjs-lib");
const bitcore = require("bitcore-lib");
const ecpair_1 = require("ecpair");
const ecc = require("tiny-secp256k1");
const mnemonic = bip39.generateMnemonic();
console.log('Мнемоническая фраза:', mnemonic);
const seed = bip39.mnemonicToSeedSync(mnemonic);
// Использование seed для создания корневого ключа BIP32
const b32 = bip32.BIP32Factory(ecc);
const root = b32.fromSeed(seed);
// Получение первого адреса (account 0, external 0, адрес 0)
const account = root.derivePath("m/44'/0'/0'/0/0");
// const tinysecp: TinySecp256k1Interface = ecc
// Создание нового кошелька
const ECPair = (0, ecpair_1.default)(ecc);
const senderWIF = 'cMq3GBaawVEkW5JPyTAtP79PZNHDyXmXXJxiediVMtMX3ENuPLpM';
const senderKeyPair = ECPair.fromWIF(senderWIF, bitcoin.networks.testnet);
const recipientAddress = 'tb1qerzrlxcfu24davlur5sqmgzzgsal6wusda40er';
const sendAmount = 10000; // Сумма в сатоши (0.0001 BTC)
const transaction = new bitcore.Transaction();
const fee = 5000;
const testAddress = ECPair.makeRandom({
    network: bitcoin.networks.testnet,
});
const senderAddress = bitcoin.payments.p2pkh({
    pubkey: senderKeyPair.publicKey,
    network: bitcoin.networks.testnet,
}).address;
const apiUrl = `https://blockstream.info/testnet/api/address/${senderAddress}/utxo`;
console.log(apiUrl);
function getRawTransactionHex(txid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`https://blockstream.info/testnet/api/tx/${txid}/hex`);
            console.log('HEX:', response.data);
            return response.data;
        }
        catch (error) {
            console.error('Ошибка при получении сырых данных транзакции:', error);
            throw error;
        }
    });
}
// Приватный ключ отправителя
const senderPrivateKey = new bitcore.PrivateKey(senderWIF);
// Адрес получателя
// Сумма перевода в сатоши
const amountSatoshis = 100000; // Например, 0.001 BTC
axios_1.default
    .get(apiUrl)
    .then(response => {
    const utxos = response.data;
    if (utxos.length === 0) {
        throw new Error('Нет доступных UTXO для указанного адреса');
    }
    // @ts-ignore
    const inputSum = utxos.reduce((sum, utxo) => sum + utxo.value, 0);
    const change = inputSum - sendAmount - fee;
    if (change > 0) {
    }
    // @ts-ignore
    utxos.forEach((utxo, index) => {
        console.log(utxo);
        new bitcore.Transaction.UnspentOutput(utxo);
        transaction.from([
            // @ts-ignore
            {
                script: utxo.status.block_hash,
                txId: utxo.txid,
                outputIndex: utxo.vout,
                satoshis: amountSatoshis,
            },
        ]);
    });
    transaction.to(recipientAddress, amountSatoshis); // Например, 0.1 BTC в сатоши
    // Установка размера комиссии
    transaction.fee(fee); // Например, 0.0005 BTC в сатоши
    // Подписание транзакции
    transaction.sign(senderPrivateKey);
    // Получение сериализованной строковой формы транзакции
    const rawTransaction = transaction.serialize();
    console.log('Сериализованная строка транзакции:', rawTransaction);
    return axios_1.default.post('https://blockstream.info/testnet/api/tx', rawTransaction);
})
    .then(response => {
    console.log('Транзакция успешно отправлена!', response.data);
})
    .catch(error => {
    console.error('Ошибка при отправке транзакции:', error);
});
// Создание транзакции
// Создание новой транзакции
// Добавление входов
// Добавление выхода для получателя
console.log(`Sender Key Pair: ${bitcoin.payments.p2pkh({ pubkey: testAddress.publicKey }).address}`);
const { address } = bitcoin.payments.p2pkh({
    pubkey: testAddress.publicKey,
    network: bitcoin.networks.testnet,
});
console.log('Новый адрес кошелька TestNet:', address, 'Имеет', address === null || address === void 0 ? void 0 : address.length, 'символов');
console.log('Приватный ключ в WIF формате:', testAddress.toWIF());
function checkBalance(address) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`);
            const balance = response.data.balance;
            console.log(`Баланс адреса ${address}: ${balance} BTC`);
        }
        catch (error) {
            console.error('Ошибка при получении баланса:', error);
        }
    });
}
const testnetAddress = 'mxHcBTuATPPqNruFR6UJkHJB2K6zXvh3tN';
// seminar cool glove market accuse furnace sadness praise rotate novel race raw
// WIF - cMq3GBaawVEkW5JPyTAtP79PZNHDyXmXXJxiediVMtMX3ENuPLpM
// URL для запроса информации о балансе адреса на Testnet через BlockCypher API
const apiUrl2 = `https://api.blockcypher.com/v1/btc/test3/addrs/${testnetAddress}/balance`;
axios_1.default
    .get(apiUrl2)
    .then(response => {
    const balanceInfo = response.data;
    console.log(balanceInfo);
    console.log(`Адрес: ${testnetAddress}`);
    console.log(`Баланс: ${balanceInfo.balance} сатоши`);
    console.log(`Всего получено: ${balanceInfo.total_received} сатоши`);
    console.log(`Всего отправлено: ${balanceInfo.total_sent} сатоши`);
    console.log(`Непотраченные выходы: ${balanceInfo.unconfirmed_balance} сатоши`);
})
    .catch(error => {
    console.error('Ошибка при запросе баланса:', error);
});
// Проверка баланса созданного адреса
// checkBalance(address!)
