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
exports.sendCoin = void 0;
const bitcore_lib_1 = require("bitcore-lib");
// @ts-ignore
const axios_1 = require("axios");
const bot_1 = require("../config/bot");
const prisma_client_1 = require("../prisma/prisma.client");
// @ts-ignore
const sendCoin = (telegramId_1, recipientAddress_1, amountToSend_1, ...args_1) => __awaiter(void 0, [telegramId_1, recipientAddress_1, amountToSend_1, ...args_1], void 0, function* (telegramId, recipientAddress, amountToSend, network = bitcore_lib_1.Networks.testnet) {
    var _a, _b;
    const user = yield prisma_client_1.prisma.user.findFirst({
        where: {
            id: telegramId.toString(),
        },
        include: {
            wallet: true,
        },
    });
    const privateKey = (_a = user === null || user === void 0 ? void 0 : user.wallet) === null || _a === void 0 ? void 0 : _a.privateKey;
    const sourceAddress = (_b = user === null || user === void 0 ? void 0 : user.wallet) === null || _b === void 0 ? void 0 : _b.address;
    const satoshiToSend = amountToSend * 100000000;
    let fee = 0;
    const satoshisPerByte = 9000;
    let inputCount = 0;
    let outputCount = 2;
    let value = Buffer.from('The test phrase for transaction buffer');
    let hash = bitcore_lib_1.default.crypto.Hash.sha256(value);
    // @ts-ignore
    let bn = bitcore_lib_1.default.crypto.BN.fromBuffer(hash);
    let address2 = new bitcore_lib_1.default.PrivateKey(bn, network).toAddress();
    function getUTXOs(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `https://blockstream.info/api/address/${address}/utxo`;
            const response = yield axios_1.default.get(url);
            // @ts-ignore
            return response.data.map(utxo => ({
                txId: utxo.txid,
                outputIndex: utxo.vout,
                address: address,
                script: bitcore_lib_1.default.Script.buildPublicKeyHashOut(address).toString(),
                satoshis: utxo.value,
            }));
        });
    }
    // Функция для отправки транзакции с использованием Blockstream API на Testnet
    function broadcastTransaction(serializedTx) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = 'https://blockstream.info/api/tx';
            const response = yield axios_1.default.post(url, serializedTx, {
                headers: {
                    'Content-Type': 'text/plain',
                },
            });
            console.log(response);
            return response.data;
        });
    }
    function sendBTC() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // @ts-ignore
                const utxos = yield getUTXOs(sourceAddress);
                if (utxos.length === 0) {
                    return bot_1.bot.telegram.sendMessage(360000840, '⚠️ <b>Перевод не выполнен</b>\n\nUTXo записи не обнаружены, вероятнее всего, баланс на вашем кошельке отсутствует', {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        callback_data: 'main_menu',
                                        text: 'В главное меню',
                                    },
                                ],
                            ],
                        },
                    });
                }
                console.log('UTXOs:', utxos);
                console.log('Amount to send:', amountToSend);
                console.log('Satoshis per byte:', satoshisPerByte);
                // Проверка сумм
                if (amountToSend <= 0) {
                    return bot_1.bot.telegram.sendMessage(360000840, '⚠️ <b>Перевод не выполнен</b>\n\nСумма для отправки должна быть положительным целым числом', {
                        parse_mode: 'HTML',
                    });
                }
                if (satoshisPerByte <= 0) {
                    return bot_1.bot.telegram.sendMessage(360000840, '⚠️ <b>Перевод не выполнен</b>\n\nКоличество сатоши на байт должно быть положительным целым числом', {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        callback_data: 'main_menu',
                                        text: 'В главное меню',
                                    },
                                ],
                            ],
                        },
                    });
                }
                // Проверка всех UTXO
                utxos.forEach((utxo) => {
                    if (utxo.satoshis <= 0) {
                        return bot_1.bot.telegram.sendMessage(360000840, `⚠️ <b>Перевод не выполнен</b>\n\nНедопустимые значения UTXO satoshis: ${utxo.satoshis}`, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        {
                                            callback_data: 'main_menu',
                                            text: 'В главное меню',
                                        },
                                    ],
                                ],
                            },
                        });
                    }
                });
                const tx = new bitcore_lib_1.default.Transaction()
                    .from(utxos)
                    .to(recipientAddress, satoshiToSend)
                    .change(sourceAddress)
                    .fee(5000)
                    .sign(privateKey);
                const serializedTx = tx.serialize();
                const txid = yield broadcastTransaction(serializedTx);
                return bot_1.bot.telegram.sendMessage(360000840, `✅ <b>Перевод выполнен</b>\n\nТранзакция успешно отправлена. TXID операции: ${txid}`, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    callback_data: 'main_menu',
                                    text: 'В главное меню',
                                },
                            ],
                        ],
                    },
                });
            }
            catch (err) {
                return bot_1.bot.telegram.sendMessage(360000840, 
                // @ts-ignore
                `⛔️ <b>Ошибка перевода</b>\n\nТранзакция совершилась с ошибкой: ${err.toString()}`, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    callback_data: 'main_menu',
                                    text: 'В главное меню',
                                },
                            ],
                        ],
                    },
                });
            }
        });
    }
    sendBTC();
});
exports.sendCoin = sendCoin;
// First Address
// mw6dgmHDkRtN6ypQzrDtv1Z87HWAETPR3F
// First Private Key
// d97ccb393e1d767cd382190db3e5381d598b17b920b3563d6bab81ad6b4b1cb4
// Second Address (In Balance)
// mtNFnSgRKKkpk8PxjuGN7x7pUiFqjsrWZm
// Second Private Key
// 89a614c57b0f37ced9bdcf7018ded5b756028f813105b3de7cf72e32634a2911
// Thirst Address
// Private Key 1b976ffb4e556f981b51d952941ed0e2d04bb3554197208100633e86a6c5de9b
// Address n2VKXDYKiRLXJYYa4o8WEEn9SEo56hhEwM
