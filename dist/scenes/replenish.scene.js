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
exports.ReplenishScene = void 0;
const telegraf_1 = require("telegraf");
exports.ReplenishScene = new telegraf_1.Scenes.WizardScene('replenish', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(ctx.session);
        yield ctx.reply(`Укажите адрес кошелька, с которого хотите вывести BTC.`);
        return ctx.wizard.next();
    }
    catch (error) {
        console.log(error);
        ctx.scene.leave();
        return ctx.reply('❗️ Произошла непредвиденная ошибка');
    }
}), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(ctx.session);
        yield ctx.reply(`Укажите приватный ключ кошелька, с которого хотите перевести BTC.`);
        // @ts-ignore
        ctx.session.sourceAddress = ctx.text;
        return ctx.wizard.next();
    }
    catch (error) {
        console.log(error);
        ctx.scene.leave();
        return ctx.reply('❗️ Произошла непредвиденная ошибка');
    }
}), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ctx.reply(`Укажите количество BTC  для вывода.`);
        // @ts-ignore
        ctx.session.privateKey = ctx.text;
        return ctx.wizard.next();
    }
    catch (error) {
        console.log(error);
        ctx.scene.leave();
        return ctx.reply('❗️ Произошла непредвиденная ошибка');
    }
}), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        console.log('Finish scene');
        // @ts-ignore
        ctx.session.countBTC = ctx.text;
        // @ts-ignore
        ctx.scene.state.countBTC = ctx.text;
        ctx.scene.state = (_a = ctx.session.__scenes) === null || _a === void 0 ? void 0 : _a.state;
        yield ctx.reply(
        // @ts-ignore
        `Проверьте, все ли данные верны?.\n\nАдрес получателя: <code>${(_b = ctx.session) === null || _b === void 0 ? void 0 : _b.sourceAddress}</code>\nПриватный ключ кошелька: ${ctx.session.privateKey}\nСумма перевода: <code>${(_c = ctx.session) === null || _c === void 0 ? void 0 : _c.countBTC}</code> BTC`, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            callback_data: 'confirm_replenish',
                            text: 'Все верно',
                        },
                        { callback_data: 'decline_replenish', text: 'Начать заново' },
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
