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
exports.SendMessage = void 0;
const telegraf_1 = require("telegraf");
const prisma_client_1 = require("../prisma/prisma.client");
const currency_formatter_1 = require("../utils/currency-formatter");
const writeMessage = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ctx.reply(`Напишите сообщение, которое хотите отправить`);
        return ctx.wizard.next();
    }
    catch (error) {
        console.log(error);
        ctx.scene.leave();
        return ctx.reply('❗️ Произошла непредвиденная ошибка');
    }
});
const sendingMessage = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
    try {
        const user = yield prisma_client_1.prisma.user.findFirst({
            where: {
                // @ts-ignore
                id: ctx.wizard.state.id.toString(),
            },
            include: {
                BuyerContractTransaction: {
                    include: {
                        contract: true,
                        seller: true,
                        buyer: true,
                    },
                },
            },
        });
        // @ts-ignore
        ctx.wizard.state.sellerId = (_a = user === null || user === void 0 ? void 0 : user.BuyerContractTransaction) === null || _a === void 0 ? void 0 : _a.sellerId;
        // @ts-ignore
        ctx.wizard.state.buyerId = (_b = user === null || user === void 0 ? void 0 : user.BuyerContractTransaction) === null || _b === void 0 ? void 0 : _b.buyerId;
        // @ts-ignore
        const sellerId = ctx.wizard.state.sellerId;
        // @ts-ignore
        const buyerId = ctx.wizard.state.buyerId;
        const inlineButtons = [
            [
                {
                    callback_data: `send-message-${(_d = (_c = user === null || user === void 0 ? void 0 : user.BuyerContractTransaction) === null || _c === void 0 ? void 0 : _c.seller) === null || _d === void 0 ? void 0 : _d.id}`,
                    text: '💬 Ответить',
                },
            ],
            [
                {
                    callback_data: `cancel-contract-${(_e = user === null || user === void 0 ? void 0 : user.BuyerContractTransaction) === null || _e === void 0 ? void 0 : _e.sellerId}`,
                    text: '🚫 Отменить',
                },
            ],
        ];
        if (((_f = user === null || user === void 0 ? void 0 : user.BuyerContractTransaction) === null || _f === void 0 ? void 0 : _f.contract.type) === 'buy') {
            if (user.BuyerContractTransaction.buyerId === ctx.from.id.toString()) {
                inlineButtons[0].push({
                    callback_data: `payment-successful-${(_g = user === null || user === void 0 ? void 0 : user.BuyerContractTransaction) === null || _g === void 0 ? void 0 : _g.buyerId}`,
                    text: '✅ Деньги получены',
                });
            }
            else {
                inlineButtons[0].push({
                    callback_data: `payment-contract-${(_h = user === null || user === void 0 ? void 0 : user.BuyerContractTransaction) === null || _h === void 0 ? void 0 : _h.buyerId}`,
                    text: '✅ Я оплатил',
                });
            }
        }
        else {
            if (((_j = user.BuyerContractTransaction) === null || _j === void 0 ? void 0 : _j.sellerId) === ctx.from.id.toString()) {
                inlineButtons[0].push({
                    callback_data: `payment-contract-${(_k = user === null || user === void 0 ? void 0 : user.BuyerContractTransaction) === null || _k === void 0 ? void 0 : _k.buyerId}`,
                    text: '✅ Я оплатил',
                });
            }
            else {
                inlineButtons[0].push({
                    callback_data: `payment-successful-${(_l = user === null || user === void 0 ? void 0 : user.BuyerContractTransaction) === null || _l === void 0 ? void 0 : _l.buyerId}`,
                    text: '✅ Деньги получены',
                });
            }
        }
        yield ctx.telegram.sendMessage(user === null || user === void 0 ? void 0 : user.id, `💬 Сообщение от ${((_m = user === null || user === void 0 ? void 0 : user.BuyerContractTransaction) === null || _m === void 0 ? void 0 : _m.sellerId) === ctx.from.id.toString()
            ? 'трейдера'
            : 'покупателя'} @${(_p = (_o = user === null || user === void 0 ? void 0 : user.BuyerContractTransaction) === null || _o === void 0 ? void 0 : _o.seller) === null || _p === void 0 ? void 0 : _p.login}\nСделка #${(_q = user === null || user === void 0 ? void 0 : user.BuyerContractTransaction) === null || _q === void 0 ? void 0 : _q.code}\n\nМинимальная сумма - ${(0, currency_formatter_1.currencyFormatter)((_r = user === null || user === void 0 ? void 0 : user.BuyerContractTransaction) === null || _r === void 0 ? void 0 : _r.contract.price, (_s = user === null || user === void 0 ? void 0 : user.BuyerContractTransaction) === null || _s === void 0 ? void 0 : _s.contract.currency)}\nМаксимальная сумма - ${(0, currency_formatter_1.currencyFormatter)((_t = user === null || user === void 0 ? void 0 : user.BuyerContractTransaction) === null || _t === void 0 ? void 0 : _t.contract.maxPrice, (_u = user === null || user === void 0 ? void 0 : user.BuyerContractTransaction) === null || _u === void 0 ? void 0 : _u.contract.currency)}\nСтатус сделки: Ожидает оплаты\n\n---------------------------
			${ctx.text}\n---------------------------\n❗️Администрация не имеет отношения к содержимому сообщения!`, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: inlineButtons,
            },
        });
        yield ctx.reply(`✅ Сообщение пользователю ${user === null || user === void 0 ? void 0 : user.login} успешно доставлено`);
        return ctx.scene.leave();
    }
    catch (error) {
        console.log(error);
        ctx.scene.leave();
        return ctx.reply('❗️ Произошла непредвиденная ошибка');
    }
});
exports.SendMessage = new telegraf_1.Scenes.WizardScene('send_message', writeMessage, sendingMessage);
