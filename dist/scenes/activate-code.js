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
exports.ActivatePromo = void 0;
const bitcore_lib_1 = require("bitcore-lib");
const telegraf_1 = require("telegraf");
const prisma_client_1 = require("../prisma/prisma.client");
const send_coin_1 = require("../trust-wallet/send-coin");
const writePromoCode = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        ctx.reply('🎫 Укажите промокод для активации');
        return ctx.wizard.next();
    }
    catch (error) {
        console.log(error);
        ctx.scene.leave();
        return ctx.reply('❗️ Произошла непредвиденная ошибка');
    }
});
const findPromoCodeAndActivation = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const code = yield prisma_client_1.prisma.code.findFirst({
            where: {
                code: ctx.text,
            },
        });
        // @ts-ignore
        ctx.scene.state.amount = parseInt(ctx.text);
        if (!code) {
            ctx.reply(`🚫 <b>Промокод не найден</b>\n\nВозможно такого промокода не существует или вы указали его некорректно`, {
                parse_mode: 'HTML',
            });
            ctx.wizard.back();
            return writePromoCode(ctx);
        }
        else {
            const selfUser = yield prisma_client_1.prisma.user.findFirst({
                where: {
                    id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id.toString(),
                },
                include: {
                    wallet: true,
                },
            });
            yield (0, send_coin_1.sendCoin)((_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id, (_c = selfUser === null || selfUser === void 0 ? void 0 : selfUser.wallet) === null || _c === void 0 ? void 0 : _c.address, code.amountCoins, bitcore_lib_1.Networks.mainnet);
            ctx.reply(`🎫 Промокод ${code.code} успешно активирован!\nВ ближайшее время на ваш баланс будет начислено <b>${code.amountCoins}</b> BTC`, {
                parse_mode: 'HTML',
            });
            return ctx.scene.leave();
        }
    }
    catch (error) {
        console.log(error);
        ctx.scene.leave();
        return ctx.reply('❗️ Произошла непредвиденная ошибка');
    }
});
exports.ActivatePromo = new telegraf_1.Scenes.WizardScene('activate-promo', writePromoCode, findPromoCodeAndActivation);
