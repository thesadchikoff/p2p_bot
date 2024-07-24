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
exports.getMyContracts = void 0;
const previous_button_inline_1 = require("../keyboards/inline-keyboards/previous-button.inline");
const prisma_client_1 = require("../prisma/prisma.client");
const currency_formatter_1 = require("../utils/currency-formatter");
const getMyContracts = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield prisma_client_1.prisma.user.findFirst({
        where: {
            id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id.toString(),
        },
        include: {
            Contract: true,
        },
    });
    const getPaymentMethod = (paymentMethodId) => {
        return prisma_client_1.prisma.paymentMethod.findFirst({
            where: {
                id: paymentMethodId,
            },
        });
    };
    // @ts-ignore
    const contractsKeyboard = user === null || user === void 0 ? void 0 : user.Contract.map(contract => {
        return [
            {
                callback_data: `contract-item-${contract.id}`,
                text: `${contract.type === 'sell' ? '🔹 Продажа' : '🔸 Покупка'} | ${(0, currency_formatter_1.currencyFormatter)(contract.amount, contract.currency)} | ${(0, currency_formatter_1.currencyFormatter)(contract.price, contract.currency)} - ${contract.maxPrice
                    ? (0, currency_formatter_1.currencyFormatter)(contract.maxPrice, contract.currency)
                    : null}`,
            },
        ];
    });
    yield ctx.editMessageText(`🔋 Здесь вы можете управлять своими объявлениями.\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
            // @ts-ignore
            inline_keyboard: [
                [
                    {
                        callback_data: 'add_my_contract',
                        text: '🆕 Добавить объявление',
                    },
                ],
                ...contractsKeyboard,
                (0, previous_button_inline_1.previousButton)('p2p_transfer'),
            ],
        },
    });
});
exports.getMyContracts = getMyContracts;
