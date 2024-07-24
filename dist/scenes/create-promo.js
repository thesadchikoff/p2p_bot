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
exports.CreatePromo = void 0;
const prisma_client_1 = require("@/prisma/prisma.client");
const get_balance_1 = require("@/trust-wallet/get-balance");
const telegraf_1 = require("telegraf");
const writeAmountForPromo = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.reply('Укажите номинал для промокода');
    return ctx.wizard.next();
});
const writePromoName = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const user = yield prisma_client_1.prisma.user.findFirst({
            where: {
                id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id.toString(),
            },
            include: {
                wallet: true,
            },
        });
        const balance = yield (0, get_balance_1.getWalletBalance)((_b = user === null || user === void 0 ? void 0 : user.wallet) === null || _b === void 0 ? void 0 : _b.address);
        console.log(parseInt(ctx.text), balance);
        // @ts-ignore
        ctx.scene.state.amount = parseInt(ctx.text);
        if (balance < parseInt(ctx.text)) {
            ctx.reply('На вашем балансе недостаточно BTC.');
            ctx.wizard.back();
            return writeAmountForPromo(ctx);
        }
        else {
            ctx.reply('🎫 Укажите название промокода');
            return ctx.wizard.next();
        }
    }
    catch (error) {
        console.log(error);
        ctx.scene.leave();
        return ctx.reply('❗️ Произошла непредвиденная ошибка');
    }
});
const createPromoCode = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        // @ts-ignore
        ctx.scene.state.name = ctx.text.toUpperCase();
        // @ts-ignore
        const amount = ctx.scene.state.amount;
        // @ts-ignore
        const name = ctx.scene.state.name;
        yield prisma_client_1.prisma.code
            .create({
            data: {
                amountCoins: amount,
                code: name,
                creatorId: (_c = ctx.from) === null || _c === void 0 ? void 0 : _c.id.toString(),
            },
        })
            .then(response => {
            ctx.reply(`Промокод <code>${response.code}</code> успешно создан!\nНоминал промокода - <b>${response.amountCoins} BTC</b>\n\n❗️ Не распространяйте промокод третьим лицам, ведь при его вводе с вашего балансе без подтверждения будет списана сумма равная номиналу промокода. Передавайте его внимательно.`, {
                parse_mode: 'HTML',
                reply_markup: {
                    remove_keyboard: true,
                    inline_keyboard: [
                        [{ callback_data: 'main_menu', text: 'В главное меню' }],
                    ],
                },
            });
        });
        ctx.scene.state = {};
        return ctx.scene.leave();
    }
    catch (error) {
        console.log(error);
        ctx.reply('❗️ При создании промокода что-то пошло не так.', telegraf_1.Markup.removeKeyboard());
        ctx.scene.state = {};
        ctx.scene.leave();
        return true;
    }
});
exports.CreatePromo = new telegraf_1.Scenes.WizardScene('create-promo', writeAmountForPromo, writePromoName, createPromoCode);
