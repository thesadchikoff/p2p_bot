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
exports.SelectCurrency = void 0;
const telegraf_1 = require("telegraf");
const prisma_client_1 = require("../prisma/prisma.client");
exports.SelectCurrency = new telegraf_1.Scenes.WizardScene('select_currency', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currency = yield prisma_client_1.prisma.currency.findMany();
        const currencyButton = currency.map(cur => {
            return {
                callback_data: cur.id.toString(),
                text: cur.value,
            };
        });
        yield ctx.editMessageText('Выберите валюту:', {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [currencyButton],
            },
        });
    }
    catch (error) {
        yield ctx.reply('Error');
    }
    return ctx.wizard.next();
}), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const paymentMethods = yield prisma_client_1.prisma.paymentMethod.findMany();
    const paymentMethodButton = paymentMethods.map(paymentMethod => {
        const { code } = paymentMethod, result = __rest(paymentMethod, ["code"]);
        return [
            {
                callback_data: JSON.stringify(result),
                text: paymentMethod.name,
            },
        ];
    });
    if (ctx.callbackQuery) {
        // @ts-ignore
        const callbackData = (_a = ctx.callbackQuery) === null || _a === void 0 ? void 0 : _a.data;
        console.log('callback id', Number(callbackData));
        try {
            const currentCurrency = yield prisma_client_1.prisma.currency.findFirst({
                where: {
                    id: Number(callbackData),
                },
            });
            // Сохранение объекта в сессию
            // @ts-ignore
            ctx.session.selectedCurrency = currentCurrency;
            yield ctx.editMessageText(`Выберите банк для принятия платежей: ${currentCurrency === null || currentCurrency === void 0 ? void 0 : currentCurrency.value}`, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: paymentMethodButton,
                },
            });
        }
        catch (error) {
            console.log(error);
            yield ctx.reply('Ошибка при обработке данных');
        }
        return ctx.wizard.next();
    }
    return ctx.wizard.next();
}), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        // @ts-ignore
        const callbackData = (_b = ctx.callbackQuery) === null || _b === void 0 ? void 0 : _b.data;
        const currentPaymentMethod = JSON.parse(callbackData);
        // @ts-ignore
        ctx.session.currentPaymentMethod = currentPaymentMethod;
        // @ts-ignore
        ctx.session.countBTC = ctx.text;
        // @ts-ignore
        ctx.scene.state.countBTC = ctx.text;
        ctx.reply(
        // @ts-ignore
        `Пришлите номер карты (или номер телефона) для получения платежей через ${currentPaymentMethod === null || currentPaymentMethod === void 0 ? void 0 : currentPaymentMethod.name}.`, {
            parse_mode: 'HTML',
        });
    }
    catch (error) {
        console.log(error);
        ctx.reply('Ошибка при обработке данных');
    }
    return ctx.wizard.next();
}), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(ctx.text);
        // @ts-ignore
        ctx.session.phoneOrBankCardNumber = ctx.text;
        const createRequisite = yield prisma_client_1.prisma.requisite.create({
            data: {
                userId: ctx.from.id.toString(),
                // @ts-ignore
                paymentMethodId: ctx.session.currentPaymentMethod.id,
                // @ts-ignore
                phoneOrbankCardNumber: ctx.session.phoneOrBankCardNumber,
                // @ts-ignore
                currency: ctx.session.selectedCurrency.value,
            },
            include: {
                paymentMethod: true,
            },
        });
        ctx.reply(
        // @ts-ignore
        `<b>Реквизит создан</b>\n\nТип операции: <code>Банковский перевод</code>\nВалюта: <code>${createRequisite.currency}</code>\nСпособ оплаты: <code>${createRequisite.paymentMethod.name}</code>\nРеквизиты: <code>${createRequisite.phoneOrbankCardNumber}</code>`, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            callback_data: 'requisites',
                            text: '← Назад',
                        },
                    ],
                ],
            },
        });
        return ctx.scene.leave();
    }
    catch (error) {
        console.log(error);
        ctx.scene.leave();
        return ctx.reply('❗️ Произошла непредвиденная ошибка');
    }
}));
