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
exports.getCurrency = void 0;
const prisma_client_1 = require("../prisma/prisma.client");
const getCurrency = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const currency = yield prisma_client_1.prisma.currency.findMany();
    const currencyButton = currency.map(cur => {
        return {
            callback_data: JSON.stringify(cur),
            text: cur.value,
        };
    });
    yield ctx.editMessageText('Выберите валюту:', {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [currencyButton],
        },
    });
    ctx.wizard.next();
});
exports.getCurrency = getCurrency;
