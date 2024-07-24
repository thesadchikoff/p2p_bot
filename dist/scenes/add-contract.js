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
exports.AddContract = void 0;
const telegraf_1 = require("telegraf");
const currencies_inline_1 = require("../keyboards/inline-keyboards/currencies.inline");
const previous_button_inline_1 = require("../keyboards/inline-keyboards/previous-button.inline");
const prisma_client_1 = require("../prisma/prisma.client");
const currency_service_1 = require("../service/currency.service");
const currency_formatter_1 = require("../utils/currency-formatter");
const selectAction = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ctx.editMessageText(`Вы хотите продать или купить криптовалюту?`, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            callback_data: JSON.stringify({
                                type: 'sell',
                            }),
                            text: '📈 Хочу продать',
                        },
                        {
                            callback_data: JSON.stringify({
                                type: 'buy',
                            }),
                            text: '📈 Хочу купить',
                        },
                    ],
                ],
            },
        });
        return ctx.wizard.next();
    }
    catch (error) {
        yield ctx.reply('Ошибка обработки данных');
    }
    return ctx.wizard.next();
});
const selectCurrency = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        console.log(ctx.callbackQuery);
        // @ts-ignore
        const actionType = JSON.parse(ctx.callbackQuery.data);
        // @ts-ignore
        ctx.session.actionType = actionType.type;
        const buttons = yield (0, currencies_inline_1.currencies)(false);
        // @ts-ignore
        console.log(ctx.session.actionType);
        if (actionType.type === 'sell') {
            try {
                yield ctx.editMessageText(`Выберите валюту для продажи`, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [...buttons, (0, previous_button_inline_1.previousButton)('add_my_contract')],
                    },
                });
                return ctx.wizard.next();
            }
            catch (error) {
                yield ctx.reply('Error');
                return ctx.scene.leave();
            }
        }
        if (actionType.type === 'buy') {
            ctx.editMessageText(`Выберите валюту для покупки`, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [...buttons, (0, previous_button_inline_1.previousButton)('add_my_contract')],
                },
            });
            return ctx.wizard.next();
        }
        // @ts-ignore
        ctx.session.recipientAddress = ctx.text;
    }
    catch (error) {
        console.log(error);
        return ctx.reply('🤬 Произошла непредвиденная ошибка', {
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
const chooseCountBTC = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const currentCurrency = JSON.parse(ctx.callbackQuery.data);
        // @ts-ignore
        ctx.session.currentCurrency = currentCurrency.value;
        const currentCourseBTC = yield currency_service_1.default.getCurrency('bitcoin');
        const getMessage = () => {
            switch (currentCurrency.value) {
                case 'RUB':
                    return `Текущий курс на бирже за 1 BTC: ${(0, currency_formatter_1.currencyFormatter)(currentCourseBTC === null || currentCourseBTC === void 0 ? void 0 : currentCourseBTC.bitcoin.rub, 'rub')}\n\nИсточник: <b>Coingecko</b>`;
                case 'USD':
                    return `<b>Текущий курс на бирже за 1 BTC: </b>${(0, currency_formatter_1.currencyFormatter)(currentCourseBTC === null || currentCourseBTC === void 0 ? void 0 : currentCourseBTC.bitcoin.usd, 'usd')}\n\nИсточник: <b>Coingecko</b>`;
                case 'EUR':
                    return `<b>Текущий курс на бирже за 1 BTC:</b> ${(0, currency_formatter_1.currencyFormatter)(currentCourseBTC === null || currentCourseBTC === void 0 ? void 0 : currentCourseBTC.bitcoin.eur, 'eur')}\n\nИсточник: <b>Coingecko</b>`;
            }
        };
        console.log(currentCurrency.value);
        ctx.editMessageText(`${getMessage()}\n\nУкажите количество <b>${currentCurrency.value}</b> для ${
        // @ts-ignore
        ctx.session.actionType === 'sell' ? 'продажи' : 'покупки'} за 1 BTC`, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ callback_data: 'fix_price', text: 'Биржевая стоимость' }],
                    (0, previous_button_inline_1.previousButton)('main_menu'),
                ],
            },
        });
        return ctx.wizard.next();
    }
    catch (error) {
        console.log(error);
        return ctx.reply('🤬 Произошла непредвиденная ошибка', {
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
const sendPricePerOneCoin = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // @ts-ignore
        if ((_a = ctx.callbackQuery) === null || _a === void 0 ? void 0 : _a.data) {
            // @ts-ignore
            if (ctx.callbackQuery.data === 'fix_price') {
                const coinPrice = yield currency_service_1.default.getCurrency('bitcoin');
                // @ts-ignore
                if (ctx.session.currentCurrency === 'RUB') {
                    // @ts-ignore
                    ctx.session.pricePerCoin = coinPrice === null || coinPrice === void 0 ? void 0 : coinPrice.bitcoin.rub;
                }
                // @ts-ignore
                else if (ctx.session.currentCurrency === 'USD') {
                    // @ts-ignore
                    ctx.session.pricePerCoin = coinPrice === null || coinPrice === void 0 ? void 0 : coinPrice.bitcoin.usd;
                }
                else {
                    // @ts-ignore
                    ctx.session.pricePerCoin = coinPrice === null || coinPrice === void 0 ? void 0 : coinPrice.bitcoin.eur;
                }
            }
        }
        else {
            console.log(parseInt(ctx.text));
            // @ts-ignore
            ctx.session.pricePerCoin = parseInt(ctx.text);
        }
        // @ts-ignore
        const pricePerCoin = ctx.session.pricePerCoin;
        ctx.reply(`<b>Лимиты</b>\n\nУказанная сумма за 1 BTC: <b>${(0, currency_formatter_1.currencyFormatter)(pricePerCoin, 
        // @ts-ignore
        ctx.session.currentCurrency.toLowerCase())}</b>\n\nВведите мин. и макс. сумму отклика в RUB.\n<b>Например:</b> 1 - 1000000`, {
            parse_mode: 'HTML',
        });
        return ctx.wizard.next();
    }
    catch (error) {
        console.log(error);
        return ctx.reply('🤬 Произошла непредвиденная ошибка', {
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
const selectPaymentMethod = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        console.log(ctx.text);
        const message = ctx.text;
        const findInt = message === null || message === void 0 ? void 0 : message.split('-');
        const numbers = findInt === null || findInt === void 0 ? void 0 : findInt.map(item => {
            return parseInt(item);
        });
        // @ts-ignore
        ctx.scene.session.minPrice = numbers[0];
        // @ts-ignore
        ctx.scene.session.maxPrice = numbers[1];
        console.log(ctx);
        prisma_client_1.prisma.requisite
            .findMany({
            where: {
                userId: (_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id.toString(),
            },
            include: {
                paymentMethod: true,
            },
        })
            .then((res) => __awaiter(void 0, void 0, void 0, function* () {
            const requisitesButton = res.map(requisite => {
                const _a = requisite.paymentMethod, { code } = _a, result = __rest(_a, ["code"]);
                return [
                    {
                        callback_data: JSON.stringify(result),
                        text: `${requisite.paymentMethod.name} | *${requisite.phoneOrbankCardNumber.slice(-4)}`,
                    },
                ];
            });
            yield ctx.reply(`Выберите реквизиты для покупки BTC:`, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [...requisitesButton],
                },
            });
        }));
        return ctx.wizard.next();
    }
    catch (error) {
        console.log(error);
        return ctx.reply('🤬 Произошла непредвиденная ошибка', {
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
const createContract = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    try {
        // @ts-ignore
        const paymentMethod = JSON.parse((_c = ctx.callbackQuery) === null || _c === void 0 ? void 0 : _c.data);
        yield prisma_client_1.prisma.contract
            .create({
            data: {
                // @ts-ignore
                type: ctx.session.actionType,
                // @ts-ignore
                price: ctx.scene.session.minPrice,
                // @ts-ignore
                amount: ctx.session.pricePerCoin,
                paymentMethodId: paymentMethod.id,
                userId: (_d = ctx.from) === null || _d === void 0 ? void 0 : _d.id.toString(),
                // @ts-ignore
                currency: ctx.session.currentCurrency,
                // @ts-ignore
                maxPrice: ctx.scene.session.maxPrice,
            },
        })
            .then((res) => __awaiter(void 0, void 0, void 0, function* () {
            ctx.reply(`📰 <b>Заявка #${res.code} создана</b>\n\n<b>Метод оплаты:</b> ${paymentMethod.name}\n<b>Курс 1 BTC:</b> ${(0, currency_formatter_1.currencyFormatter)(
            // @ts-ignore
            ctx.session.pricePerCoin, 
            // @ts-ignore
            ctx.session.currentCurrency
            // @ts-ignore
            )}\n<b>Минимальная сумма:</b> ${ctx.scene.session.minPrice} ${
            // @ts-ignore
            ctx.session.currentCurrency
            // @ts-ignore
            }\n<b>Максимальная сумма:</b> ${ctx.scene.session.maxPrice} ${
            // @ts-ignore
            ctx.session.currentCurrency}
		`, {
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
            yield ctx.scene.leave();
            return ctx.reply('⚡️');
        }));
    }
    catch (error) {
        console.log(error);
        return ctx.reply('🤬 Произошла непредвиденная ошибка', {
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
    return;
});
exports.AddContract = new telegraf_1.Scenes.WizardScene('add_contract', selectAction, selectCurrency, chooseCountBTC, sendPricePerOneCoin, selectPaymentMethod, createContract);
