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
exports.startCommand = void 0;
const bot_1 = require("../config/bot");
const service_config_1 = require("../config/service.config");
const start_keyboard_inline_1 = require("../keyboards/inline-keyboards/start-keyboard.inline");
const prisma_client_1 = require("../prisma/prisma.client");
const currency_service_1 = require("../service/currency.service");
const startCommand = () => {
    bot_1.bot.command(['start', 'help'], (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        currency_service_1.default.convertRubleToBTC(500);
        const user = yield prisma_client_1.prisma.user.findFirst({
            where: {
                id: ctx.chat.id.toString(),
            },
        });
        if (!user) {
            yield prisma_client_1.prisma.user.create({
                data: {
                    id: ctx.from.id.toString(),
                    username: ctx.from.username,
                    login: ctx.from.username,
                },
            });
        }
        yield ctx.reply(`<b>${service_config_1.config.shopName}</b>\n\nПокупайте, продавайте, храните, отправляйте и платите криптовалютой, когда хотите!\n\nВыберите действие:`, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: start_keyboard_inline_1.startInlineKeyboards,
            },
        });
    }));
};
exports.startCommand = startCommand;
