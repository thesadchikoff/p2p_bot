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
exports.transferHistory = void 0;
const previous_button_inline_1 = require("../keyboards/inline-keyboards/previous-button.inline");
const prisma_client_1 = require("../prisma/prisma.client");
const format_date_1 = require("../utils/format-date");
const transferHistory = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield prisma_client_1.prisma.user.findFirst({
        where: {
            id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id.toString(),
        },
    });
    if (!user) {
        return ctx.editMessageText('Не удалось получить историю переводов', {
            reply_markup: {
                inline_keyboard: [(0, previous_button_inline_1.previousButton)('wallet')],
            },
        });
    }
    const transfers = yield prisma_client_1.prisma.transfer.findMany({
        where: {
            fromUserId: user.id,
        },
    });
    if (!transfers.length) {
        return ctx.editMessageText('<b>⏱️ История переводов:</b>\n\nВы пока не совершили ни одного перевода', {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [(0, previous_button_inline_1.previousButton)('wallet')],
            },
        });
    }
    let transferData = '';
    const transferPromises = transfers.map((transfer) => __awaiter(void 0, void 0, void 0, function* () {
        const toUser = yield prisma_client_1.prisma.user.findFirst({
            where: {
                id: transfer.toUserId,
            },
        });
        return `[${(0, format_date_1.dateFormat)(transfer.createdAt)}] Перевод пользователю @${toUser === null || toUser === void 0 ? void 0 : toUser.username}. Сумма ${transfer.count} BTC.\n`;
    }));
    const results = yield Promise.all(transferPromises);
    transferData = results.join('');
    yield ctx.editMessageText(`<b>⏱️ История переводов:</b>\n\n${transferData}`, {
        reply_markup: {
            inline_keyboard: [(0, previous_button_inline_1.previousButton)('wallet')],
        },
        parse_mode: 'HTML',
    });
});
exports.transferHistory = transferHistory;
