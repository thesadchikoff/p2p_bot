"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const callback_handler_1 = require("./callback-queries/callback-handler");
const start_command_1 = require("./commands/start.command");
const bot_1 = require("./config/bot");
const activate_code_1 = require("./scenes/activate-code");
const add_contract_1 = require("./scenes/add-contract");
const base_scene_1 = require("./scenes/base.scene");
const buy_contract_1 = require("./scenes/buy-contract");
const create_promo_1 = require("./scenes/create-promo");
const replenish_scene_1 = require("./scenes/replenish.scene");
const select_currency_1 = require("./scenes/select-currency");
const send_message_1 = require("./scenes/send-message");
const main = () => {
    try {
        const stage = new telegraf_1.Scenes.Stage([
            select_currency_1.SelectCurrency,
            base_scene_1.TransferScene,
            replenish_scene_1.ReplenishScene,
            add_contract_1.AddContract,
            create_promo_1.CreatePromo,
            activate_code_1.ActivatePromo,
            buy_contract_1.BuyContract,
            send_message_1.SendMessage,
        ]);
        bot_1.bot.use((0, telegraf_1.session)());
        // @ts-ignore
        bot_1.bot.use(stage.middleware());
        bot_1.bot.telegram.setMyCommands([
            {
                command: '/start',
                description: 'Запустить бота',
            },
        ]);
        (0, start_command_1.startCommand)();
        (0, callback_handler_1.callbackHandler)();
        bot_1.bot.launch();
        bot_1.bot.catch(error => {
            console.error('TELEGRAF ERROR', error);
        });
    }
    catch (error) {
        console.log(error);
    }
};
main();
