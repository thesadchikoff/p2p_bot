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
exports.getWalletBalance = void 0;
const axios_1 = require("axios");
const bitcore_lib_1 = require("bitcore-lib");
// Функция для получения UTXO с использованием Blockstream API на Testnet
// @ts-ignore
function getUTXOs(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://blockstream.info/api/address/${address}/utxo`;
        const response = yield axios_1.default.get(url);
        return response.data.map((utxo) => ({
            txId: utxo.txid,
            outputIndex: utxo.vout,
            address: address,
            script: bitcore_lib_1.default.Script.buildPublicKeyHashOut(address).toString(),
            satoshis: utxo.value, // значение в сатоши
        }));
    });
}
// Функция для получения баланса кошелька
// @ts-ignore
function getWalletBalance(address) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const utxos = yield getUTXOs(address);
            if (utxos.length === 0) {
                return 0; // Если нет UTXO, баланс равен 0
            }
            // Суммирование всех сатоши из UTXO
            const totalSatoshis = utxos.reduce(
            // @ts-ignore
            (total, utxo) => total + utxo.satoshis, 0);
            // Форматирование в BTC
            const balanceBTC = totalSatoshis / 100000000; // Сатоши в одном BTC
            return balanceBTC; // Баланс в BTC
        }
        catch (err) {
            console.error('Ошибка получения баланса:', err);
            return null; // В случае ошибки вернуть null
        }
    });
}
exports.getWalletBalance = getWalletBalance;
