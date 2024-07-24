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
const api_1 = require("../config/api");
class CurrencyService {
    convertRubleToBTC(value) {
        return __awaiter(this, void 0, void 0, function* () {
            const rate = yield this.getCurrency('bitcoin');
            let bitcoin = value / (rate === null || rate === void 0 ? void 0 : rate.bitcoin.rub);
            return bitcoin.toFixed(8);
        });
    }
    getCurrency(currency) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = yield axios_1.default.get(api_1.url + `?ids=${currency}&vs_currencies=rub,usd,eur`);
                const result = {
                    [currency]: {
                        rub: data[currency].rub,
                        usd: data[currency].usd,
                        eur: data[currency].eur,
                    },
                };
                return result;
            }
            catch (error) {
                console.log(error);
            }
        });
    }
}
exports.default = new CurrencyService();
