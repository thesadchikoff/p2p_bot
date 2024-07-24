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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencies = void 0;
const prisma_client_1 = require("../../prisma/prisma.client");
const currencies = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (initValue = true) {
    const currenciesList = yield prisma_client_1.prisma.currency.findMany();
    if (initValue) {
        const buttons = currenciesList.map(item => {
            return [
                {
                    callback_data: item.key + '-add',
                    text: item.value,
                },
            ];
        });
        return buttons;
    }
    else {
        const buttons = currenciesList.map(item => {
            const { createdAt, key } = item, result = __rest(item, ["createdAt", "key"]);
            return [
                {
                    callback_data: JSON.stringify(result),
                    text: item.value,
                },
            ];
        });
        return buttons;
    }
});
exports.currencies = currencies;
