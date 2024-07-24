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
exports.BuyContract = void 0;
const node_cron_1 = require("node-cron");
const telegraf_1 = require("telegraf");
const prisma_client_1 = require("../prisma/prisma.client");
const currency_formatter_1 = require("../utils/currency-formatter");
const format_date_1 = require("../utils/format-date");
const sendBuyAmount = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userTransactions = yield prisma_client_1.prisma.contractTransaction.findFirst({
            where: {
                buyerId: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id.toString(),
            },
        });
        if (userTransactions) {
            yield ctx.reply('У вас есть активная транзакция. Начать новую невозможно.');
            return ctx.scene.leave();
        }
        const contract = yield prisma_client_1.prisma.contract.findFirst({
            where: {
                // @ts-ignore
                id: ctx.wizard.state.id,
            },
            include: {
                author: {
                    include: {
                        SellerContractTransaction: true,
                    },
                },
                paymentMethod: {
                    include: {
                        Requisite: true,
                    },
                },
            },
        });
        const currentMethod = contract === null || contract === void 0 ? void 0 : contract.paymentMethod.Requisite.filter(requisite => requisite.paymentMethodId !== contract.paymentMethod.id);
        console.log(currentMethod);
        ctx.scene.state = {};
        // @ts-ignore
        ctx.scene.state.contract = JSON.stringify(contract);
        // @ts-ignore
        const currentContract = ctx.scene.state.contract;
        yield ctx.reply(`Введите сумму в ${(_b = contract === null || contract === void 0 ? void 0 : contract.currency) === null || _b === void 0 ? void 0 : _b.toUpperCase()} для покупки\n\nМинимальная сумма покупки - ${(0, currency_formatter_1.currencyFormatter)(
        // @ts-ignore
        contract === null || contract === void 0 ? void 0 : contract.price, 
        // @ts-ignore
        contract === null || contract === void 0 ? void 0 : contract.currency)}\nМаксимальная сумма покупки - ${(0, currency_formatter_1.currencyFormatter)(
        // @ts-ignore
        contract === null || contract === void 0 ? void 0 : contract.maxPrice, 
        // @ts-ignore
        contract === null || contract === void 0 ? void 0 : contract.currency)}`, {
            parse_mode: 'HTML',
        });
        return ctx.wizard.next();
    }
    catch (error) {
        console.log(error);
        ctx.scene.leave();
        return ctx.reply('❗️ Произошла непредвиденная ошибка');
    }
});
const doneContract = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e;
    try {
        // @ts-ignore
        const contract = JSON.parse(ctx.scene.state.contract);
        const sendPrice = parseInt(ctx.text);
        if (sendPrice < contract.price || sendPrice > contract.maxPrice) {
            yield ctx.reply('Некорректно указана сумма, повторите еще раз.');
            ctx.wizard.back();
            return sendBuyAmount(ctx);
        }
        else {
            yield prisma_client_1.prisma.contractTransaction
                .create({
                data: {
                    buyerId: (_c = ctx.from) === null || _c === void 0 ? void 0 : _c.id.toString(),
                    sellerId: contract.author.id,
                    amount: sendPrice,
                    contractId: contract.id,
                },
            })
                .then((response) => __awaiter(void 0, void 0, void 0, function* () {
                const transaction = yield prisma_client_1.prisma.contractTransaction.findFirst({
                    where: {
                        id: response.id,
                    },
                });
                if (transaction) {
                    const taskNotifyForUsers = node_cron_1.default.schedule('* 12 * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
                        yield ctx.telegram.sendMessage(Number(response.buyerId), `❗️ До отмены сделки осталось 3 минуты. Поспешите завершить её`);
                        yield ctx.telegram.sendMessage(Number(response.sellerId), `❗️ До отмены сделки осталось 3 минуты. Поспешите завершить её`);
                        taskNotifyForUsers.stop();
                    }));
                    const taskDeleteTransaction = node_cron_1.default.schedule('* 15 * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
                        yield prisma_client_1.prisma.contractTransaction.delete({
                            where: {
                                id: response.id,
                            },
                        });
                        taskDeleteTransaction.stop();
                    }));
                    return;
                }
            }));
            yield ctx.reply(`📜 Сделка #${contract === null || contract === void 0 ? void 0 : contract.code} заключена\n\nЦена за 1 BTC: ${(0, currency_formatter_1.currencyFormatter)(contract === null || contract === void 0 ? void 0 : contract.amount, contract === null || contract === void 0 ? void 0 : contract.currency)}\nКомиссия сервиса: 0%\n\nВремя на оплату сделки: 15 минут\n\nТрейдер: @${contract === null || contract === void 0 ? void 0 : contract.author.login}\nРепутация: 100%\nВерификация: ✔️\nОтзывы: 😊(0) 🙁(0)\n\nПровел сделок: 0\n\nЗарегистрирован: ${(0, format_date_1.dateFormat)(contract === null || contract === void 0 ? void 0 : contract.author.createdAt)}\n\nУсловия:\nМинимальная сумма - ${(0, currency_formatter_1.currencyFormatter)(contract.price, contract === null || contract === void 0 ? void 0 : contract.currency)}\nМаксимальная сумма - ${(0, currency_formatter_1.currencyFormatter)(contract.maxPrice, contract === null || contract === void 0 ? void 0 : contract.currency)}`, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                callback_data: `cancel-contract-${contract.author.id}`,
                                text: '🚫 Отмена',
                            },
                            {
                                callback_data: `send-message-${contract.author.id}`,
                                text: 'Ответить',
                            },
                        ],
                    ],
                },
            });
            // 		await ctx.reply(
            // 			`💬 Сообщение от трейдера @${contract.author.login}
            // Сделка #${contract.code}
            // Статус сделки: Ожидает оплаты
            // Вы покупаете BTC на сумму ${currencyFormatter(
            // 				sendPrice,
            // 				contract.currency
            // 			)} через ${contract?.paymentMethod.name}\n\n---------------------------
            // АльфаБанк 2200 1523 4720 9515 , СБЕР 2202 2023 9388 7116 , получатель Александр А.П. Комент : Возврат долга
            // ---------------------------\n❗️Администрация не имеет отношения к содержимому сообщения!`,
            // 			{
            // 				parse_mode: 'HTML',
            // 				reply_markup: {
            // 					inline_keyboard: [
            // 						[
            // 							{
            // 								callback_data: 'cancel-buy-contract',
            // 								text: '🚫 Отмена',
            // 							},
            // 							{
            // 								callback_data: 'send-message',
            // 								text: 'Ответить',
            // 							},
            // 						],
            // 						[
            // 							{
            // 								callback_data: 'pay-successful',
            // 								text: '✅ Оплатил',
            // 							},
            // 						],
            // 					],
            // 				},
            // 			}
            // 		)
            ctx.telegram.sendMessage(contract.author.id, `Новое предложение о ${contract.type === 'buy' ? 'продаже' : 'покупке'} по объявлению #${contract.code}\n\nПокупает @${(_d = ctx.from) === null || _d === void 0 ? void 0 : _d.username}\nBTC на сумму ${(0, currency_formatter_1.currencyFormatter)(sendPrice, contract.currency)}`, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                callback_data: `send-message-${(_e = ctx.from) === null || _e === void 0 ? void 0 : _e.id}`,
                                text: '✉️ Ответить',
                            },
                        ],
                    ],
                },
            });
        }
        ctx.scene.state = {};
        return ctx.scene.leave();
    }
    catch (error) {
        console.log(error);
        ctx.scene.leave();
        return ctx.reply('❗️ Произошла непредвиденная ошибка');
    }
});
exports.BuyContract = new telegraf_1.Scenes.WizardScene('buy-contract', sendBuyAmount, doneContract);
