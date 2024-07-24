"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actCommand = void 0;
const bot_1 = require("../config/bot");
const actCommand = () => {
    bot_1.bot.command('act', ctx => {
        return ctx.reply('act connected!');
    });
};
exports.actCommand = actCommand;
