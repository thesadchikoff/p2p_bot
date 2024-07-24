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
exports.myCodes = void 0;
const previous_button_inline_1 = require("../keyboards/inline-keyboards/previous-button.inline");
const prisma_client_1 = require("../prisma/prisma.client");
const myCodes = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    yield prisma_client_1.prisma.code
        .findMany({
        where: {
            creatorId: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id.toString(),
        },
    })
        .then(response => {
        if (response.length > 0) {
            let codeStroke = '';
            response.forEach((code, index) => {
                codeStroke += `<b>${++index}.</b> <code>${code.code}</code> | ${code.amountCoins} BTC\n`;
            });
            return ctx.editMessageText(`🎫 <b>Список активных кодов</b>\n\n${codeStroke}`, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [(0, previous_button_inline_1.previousButton)('promo')],
                },
            });
        }
        else {
            return ctx.editMessageText(`🎫 Список активных кодов пуст`, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [(0, previous_button_inline_1.previousButton)('promo')],
                },
            });
        }
    });
});
exports.myCodes = myCodes;
