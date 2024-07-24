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
exports.callbackHandler = void 0;
const bot_1 = require("../config/bot");
const currencies_inline_1 = require("../keyboards/inline-keyboards/currencies.inline");
const keyboard_for_settings_inline_1 = require("../keyboards/inline-keyboards/keyboard-for-settings.inline");
const previous_button_inline_1 = require("../keyboards/inline-keyboards/previous-button.inline");
const create_wallet_1 = require("../trust-wallet/create-wallet");
const bitcore_lib_1 = require("bitcore-lib");
const get_my_contracts_1 = require("../callbacks/get-my-contracts");
const my_codes_1 = require("../callbacks/my-codes");
const requisites_1 = require("../callbacks/requisites");
const transfer_history_1 = require("../callbacks/transfer-history");
const service_config_1 = require("../config/service.config");
const p2p_keyboard_inline_1 = require("../keyboards/inline-keyboards/p2p-keyboard.inline");
const promo_codes_1 = require("../keyboards/inline-keyboards/promo-codes");
const start_keyboard_inline_1 = require("../keyboards/inline-keyboards/start-keyboard.inline");
const wallet_inline_1 = require("../keyboards/inline-keyboards/wallet.inline");
const prisma_client_1 = require("../prisma/prisma.client");
const currency_service_1 = require("../service/currency.service");
const get_balance_1 = require("../trust-wallet/get-balance");
const replenish_coin_1 = require("../trust-wallet/replenish-coin");
const send_coin_1 = require("../trust-wallet/send-coin");
const currency_formatter_1 = require("../utils/currency-formatter");
const format_date_1 = require("../utils/format-date");
const callbackHandler = () => {
    bot_1.bot.on('callback_query', (query) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        try {
            // @ts-ignore
            const data = (_a = query.update.callback_query) === null || _a === void 0 ? void 0 : _a.data;
            console.log(query.update.callback_query.from.id.toString());
            const user = yield prisma_client_1.prisma.user.findFirst({
                where: {
                    id: query.update.callback_query.from.id.toString(),
                },
            });
            switch (data) {
                case 'settings':
                    try {
                        return query.editMessageText(`<b>🔧 ${service_config_1.config.shopName} | Настройки</b>\n\nВаше уникальное имя в боте: <b>${user === null || user === void 0 ? void 0 : user.login}</b>\n\nТут вы можете настроить ваш аккаунт.`, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: keyboard_for_settings_inline_1.inlineKeyboardForSettings,
                            },
                        });
                    }
                    catch (error) {
                        return query.reply(String(error));
                    }
                case 'promo':
                    try {
                        const myCodes = yield prisma_client_1.prisma.code.findMany({
                            where: {
                                creatorId: query.from.id.toString(),
                            },
                        });
                        return query.reply('🎫 Управление кодами', {
                            reply_markup: {
                                inline_keyboard: (0, promo_codes_1.promoCodesButtons)(myCodes.length),
                            },
                        });
                    }
                    catch (error) {
                        console.error(error);
                    }
                case 'activate_code':
                    return query.scene.enter('activate-promo');
                case 'promo_information':
                    try {
                        return query.editMessageText(`ℹ️ О ${service_config_1.config.shopName} Codes\nВ этом разделе вы можете управлять вашими кодами ${service_config_1.config.shopName} Code\n${service_config_1.config.shopName} Code  - это код на сумму в криптовалюте, который может быть активирован любым пользователем ${service_config_1.config.shopName}\nПри создании кода, указанная вами сумма будет заблокирована в депонировании до тех пор, пока код не будет активирован или деактивирован\nСумма неактивированного кода учитывается при активации ваших объявлений на покупку\nВы можете передавать ссылку с кодом пользователям, которые не имеют аккаунта на ${service_config_1.config.shopName}. Каждый зарегистрированный по вашей ссылке пользователь будет автоматически становиться вашим рефералом`, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [(0, previous_button_inline_1.previousButton)('promo')],
                            },
                        });
                    }
                    catch (error) {
                        console.error(error);
                    }
                case 'add_requisite':
                    try {
                        return query.scene.enter('select_currency');
                    }
                    catch (error) {
                        return query.reply('Ошибка обработки данных');
                    }
                case 'transfer_btc':
                    try {
                        return query.scene.enter('transfer');
                    }
                    catch (error) {
                        return query.reply(String(error));
                    }
                case 'replenish_btc':
                    try {
                        const userWallet = yield prisma_client_1.prisma.user.findFirst({
                            where: {
                                id: query.from.id.toString(),
                            },
                            include: {
                                wallet: true,
                            },
                        });
                        return query.editMessageText(`❗️Минимальная сумма пополнения Bitcoin: <b>0.0010 BTC</b>.\n\nЕсли вы решите пополнить меньше <b>0.0010 BTC</b>, то они не будут зачислены на ваш баланс.\n\nАдрес вашего кошелька: <code>${(_b = userWallet === null || userWallet === void 0 ? void 0 : userWallet.wallet) === null || _b === void 0 ? void 0 : _b.address}</code>`, {
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
                    }
                    catch (error) {
                        return query.reply(String(error));
                    }
                case 'decline':
                    query.session = {};
                    query.scene.leave();
                    return query.scene.enter('transfer');
                case 'confirm':
                    const transfer = (0, send_coin_1.sendCoin)(query.from.id, 
                    // @ts-ignore
                    query.session.recipientAddress, 
                    // @ts-ignore
                    query.session.countBTC, bitcore_lib_1.Networks.mainnet);
                    console.log(transfer);
                    query.session = {};
                    query.scene.leave();
                    return;
                case 'decline_replenish':
                    query.session = {};
                    query.scene.leave();
                    return query.scene.enter('replenish');
                case 'confirm_replenish':
                    query.deleteMessage();
                    const replenish = (0, replenish_coin_1.replenishBtc)(query.from.id, 
                    // @ts-ignore
                    query.session.privateKey, 
                    // @ts-ignore
                    query.session.sourceAddress, 
                    // @ts-ignore
                    query.session.countBTC, bitcore_lib_1.Networks.mainnet);
                    console.log(replenish);
                    query.session = {};
                    query.scene.leave();
                    return;
                case 'transfer_history':
                    return (0, transfer_history_1.transferHistory)(query);
                case 'requisites':
                    return (0, requisites_1.requisites)(query);
                case 'p2p_transfer':
                    return query.editMessageText(`<strong>💱 ${service_config_1.config.shopName} | 💱 Обмен криптовалюты</strong>\n\n
		Все транзакции осуществляются между участниками нашего сервиса.\n\nМы выступаем в роли посредника, удерживая криптовалюту продавца до завершения операции.\nЭто обеспечивает безопасность как для продавца, так и для покупателя.\n\nВы можете заключать сделки на основе предложений других пользователей или создавать свои собственные объявления с индивидуальными условиями.
		`, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: p2p_keyboard_inline_1.marketKeyboard,
                        },
                    });
                case 'main_menu':
                    try {
                        return query.editMessageText(`<b>💰 ${service_config_1.config.shopName} | Меню</b>\n\nВыберите интересующий вас пункт:`, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: start_keyboard_inline_1.startInlineKeyboards,
                            },
                        });
                    }
                    catch (error) {
                        return query.reply(String(error));
                    }
                case 'set_currency':
                    try {
                        const buttons = yield (0, currencies_inline_1.currencies)();
                        return query.editMessageText(`<b>💵 ${service_config_1.config.shopName} | Изменение валюты</b>\n\nВыберите валюту, за которой хотите наблюдать:`, {
                            reply_markup: {
                                inline_keyboard: [...buttons, (0, previous_button_inline_1.previousButton)('settings')],
                            },
                            parse_mode: 'HTML',
                        });
                    }
                    catch (error) {
                        return query.reply(String(error));
                    }
                case 'course_currency':
                    try {
                        const userCurrency = yield prisma_client_1.prisma.user.findFirst({
                            where: {
                                id: query.from.id.toString(),
                            },
                            include: {
                                currency: true,
                            },
                        });
                        if (!(userCurrency === null || userCurrency === void 0 ? void 0 : userCurrency.currency)) {
                            // @ts-ignore
                            const buttons = yield (0, currencies_inline_1.currencies)();
                            return query.editMessageText(`<b>📊 ${service_config_1.config.shopName} | Курс</b>\n\nНе получилось получить курс валюты\n\nПеред тем как получить курс валюты, вам необходимо выбрать ее`, {
                                parse_mode: 'HTML',
                                reply_markup: {
                                    inline_keyboard: (userCurrency === null || userCurrency === void 0 ? void 0 : userCurrency.isAdmin)
                                        ? [
                                            ...buttons,
                                            [
                                                {
                                                    text: 'Добавить валюту',
                                                    callback_data: 'set_currency',
                                                },
                                            ],
                                            (0, previous_button_inline_1.previousButton)('settings'),
                                        ]
                                        : [...buttons, (0, previous_button_inline_1.previousButton)('settings')],
                                },
                            });
                        }
                        const currency = yield currency_service_1.default.getCurrency('bitcoin');
                        return query.editMessageText(`<b>📊 ${service_config_1.config.shopName} | Курс ${userCurrency === null || userCurrency === void 0 ? void 0 : userCurrency.currency.value}</b>\n\n<b>EUR:</b> ${(0, currency_formatter_1.currencyFormatter)(currency === null || currency === void 0 ? void 0 : currency.bitcoin.eur, 'eur')} €\n<b>USD:</b> ${(0, currency_formatter_1.currencyFormatter)(currency === null || currency === void 0 ? void 0 : currency.bitcoin.usd, 'usd')} $\n<b>RUB:</b> ${(0, currency_formatter_1.currencyFormatter)(currency === null || currency === void 0 ? void 0 : currency.bitcoin.rub, 'rub')} ₽`, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [(0, previous_button_inline_1.previousButton)('settings')],
                            },
                        });
                    }
                    catch (error) {
                        return query.reply(String(error));
                    }
                case 'bitcoin-add':
                    try {
                        // @ts-ignore
                        const coinSplit = (_c = query.update.callback_query) === null || _c === void 0 ? void 0 : _c.data.split('-');
                        const currencyFind = yield prisma_client_1.prisma.currency.findFirst({
                            where: {
                                key: coinSplit[0],
                            },
                        });
                        if (!currencyFind) {
                            return query.editMessageText('Произошла ошибка при установки валюты', {
                                parse_mode: 'HTML',
                                reply_markup: {
                                    inline_keyboard: [(0, previous_button_inline_1.previousButton)('settings')],
                                },
                            });
                        }
                        yield prisma_client_1.prisma.user.update({
                            where: {
                                id: query.from.id.toString(),
                            },
                            data: {
                                currency: {
                                    connect: {
                                        id: currencyFind.id,
                                    },
                                },
                            },
                        });
                        return query.editMessageText(`Вы успешно установили себе валюту ${currencyFind.value}`, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [(0, previous_button_inline_1.previousButton)('settings')],
                            },
                        });
                    }
                    catch (error) {
                        return query.reply(String(error));
                    }
                case 'history_transfer':
                    console.log('enter to transfer history callback');
                    return (0, transfer_history_1.transferHistory)(query);
                case 'create_code':
                    return query.scene.enter('create-promo');
                case 'buy':
                    const getUserForBuy = yield prisma_client_1.prisma.user.findFirst({
                        where: {
                            id: query.from.id.toString(),
                        },
                        include: {
                            wallet: true,
                        },
                    });
                    const userBalanceForBuy = yield (0, get_balance_1.getWalletBalance)((_d = getUserForBuy === null || getUserForBuy === void 0 ? void 0 : getUserForBuy.wallet) === null || _d === void 0 ? void 0 : _d.address);
                    // if (userBalanceForBuy === 0)
                    // 	return query.answerCbQuery(
                    // 		'🚫 Баланс на вашем кошельке недостаточен для продажи BTC.',
                    // 		{
                    // 			show_alert: true,
                    // 		}
                    // 	)
                    const paymentMethodsForBuy = yield prisma_client_1.prisma.paymentMethod.findMany({
                        include: {
                            Contract: {
                                where: {
                                    type: 'buy',
                                },
                            },
                        },
                    });
                    const paymentMethodButtonForBuy = paymentMethodsForBuy.map(paymentMethod => {
                        return [
                            {
                                callback_data: `buy_payment_method_${paymentMethod.id}`,
                                text: `${paymentMethod.name} | [${paymentMethod.Contract.length}]`,
                            },
                        ];
                    });
                    return query.editMessageText(`Выберите способ оплаты для покупки BTC за RUB.`, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                ...paymentMethodButtonForBuy,
                                (0, previous_button_inline_1.previousButton)('p2p_transfer'),
                            ],
                        },
                    });
                case 'profile':
                    const userForProfile = yield prisma_client_1.prisma.user.findFirst({
                        where: {
                            id: query.from.id.toString(),
                        },
                        include: {
                            Contract: true,
                        },
                    });
                    return query.editMessageText(`👤 <b>${userForProfile === null || userForProfile === void 0 ? void 0 : userForProfile.username}</b> ${(userForProfile === null || userForProfile === void 0 ? void 0 : userForProfile.isAdmin) ? '[Администратор]' : ''}\n\n<b>Статистика торговли</b>\n📈 <i>Количество сделок:</i> <b>${userForProfile === null || userForProfile === void 0 ? void 0 : userForProfile.Contract.length}</b>`, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [(0, previous_button_inline_1.previousButton)('p2p_transfer')],
                        },
                    });
                case 'sell':
                    const getUser = yield prisma_client_1.prisma.user.findFirst({
                        where: {
                            id: query.from.id.toString(),
                        },
                        include: {
                            wallet: true,
                        },
                    });
                    const userBalance = yield (0, get_balance_1.getWalletBalance)((_e = getUser === null || getUser === void 0 ? void 0 : getUser.wallet) === null || _e === void 0 ? void 0 : _e.address);
                    // if (userBalance === 0)
                    // 	return query.answerCbQuery(
                    // 		'🚫 Баланс на вашем кошельке недостаточен для продажи BTC.',
                    // 		{
                    // 			show_alert: true,
                    // 		}
                    // 	)
                    const paymentMethods = yield prisma_client_1.prisma.paymentMethod.findMany({
                        include: {
                            Contract: {
                                where: {
                                    type: 'sell',
                                },
                            },
                        },
                    });
                    const paymentMethodButton = paymentMethods.map(paymentMethod => {
                        return [
                            {
                                callback_data: `sell_payment_method_${paymentMethod.id}`,
                                text: `${paymentMethod.name} | [${paymentMethod.Contract.length}]`,
                            },
                        ];
                    });
                    return query.editMessageText(`Выберите способ оплаты для продажи BTC за RUB.`, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                ...paymentMethodButton,
                                (0, previous_button_inline_1.previousButton)('p2p_transfer'),
                            ],
                        },
                    });
                case 'add_my_contract':
                    return query.scene.enter('add_contract');
                case 'buy_contract':
                    return query.scene.enter('buy-contract', {
                        // @ts-ignore
                        id: query.scene.state.contractId,
                    });
                case 'my_ads':
                    return (0, get_my_contracts_1.getMyContracts)(query);
                case 'my_codes':
                    return (0, my_codes_1.myCodes)(query);
                case 'wallet':
                    try {
                        const registrationDate = new Date(user === null || user === void 0 ? void 0 : user.createdAt);
                        const currentDate = new Date();
                        const diffInMs = currentDate.getTime() - registrationDate.getTime();
                        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
                        const wallet = yield (0, create_wallet_1.createWallet)(query.from.id);
                        const contractTransactions = yield prisma_client_1.prisma.contractTransaction.findMany({
                            where: {
                                sellerId: query.from.id.toString(),
                            },
                        });
                        if (!wallet) {
                            const userWallet = yield prisma_client_1.prisma.user.findFirst({
                                where: {
                                    id: query.from.id.toString(),
                                },
                                include: {
                                    wallet: true,
                                },
                            });
                            if (userWallet) {
                                const balance = yield (0, get_balance_1.getWalletBalance)((_f = userWallet.wallet) === null || _f === void 0 ? void 0 : _f.address);
                                const convertToRuble = yield currency_service_1.default.convertRubleToBTC(balance);
                                return query.editMessageText(`🏦 <b>${service_config_1.config.shopName}</b>\n\n<b>Ваш баланс:</b> ${balance} BTC ≈ ${convertToRuble} RUB\n\n<b>Вы пополнили:</b> ${user === null || user === void 0 ? void 0 : user.totalAmountAdd} BTC\n<b>Вы вывели:</b> ${user === null || user === void 0 ? void 0 : user.totalAmountReplenish} BTC\n\n<b>Ваш уникальный никнейм бота:</b> ${user === null || user === void 0 ? void 0 : user.login}\n\n<b>Отзывы о вас:</b> (0)👍 (0)👎\n\n<b>Дней в нашем сервисе:</b> ${diffInDays}\n<b>Вы совершили удачных сделок:</b> ${contractTransactions.length} на сумму ${contractTransactions.reduce((currentSum, currentTransaction) => currentSum + currentTransaction.amount, 0)} BTC\n<b>Вы защищены нашим сервисом от взлома и кражи ваших BTC.</b>
		`, {
                                    parse_mode: 'HTML',
                                    reply_markup: {
                                        inline_keyboard: [
                                            ...wallet_inline_1.walletInlineKeyboard,
                                            [
                                                ...(0, previous_button_inline_1.previousButton)('main_menu'),
                                                {
                                                    callback_data: 'history_transfer',
                                                    text: '⏱️ История переводов',
                                                },
                                            ],
                                        ],
                                    },
                                });
                            }
                            return query.editMessageText('У Вас уже создан кошелек', {
                                parse_mode: 'Markdown',
                                reply_markup: {
                                    inline_keyboard: [(0, previous_button_inline_1.previousButton)('main_menu')],
                                },
                            });
                        }
                        return query.editMessageText(`<b>Кошелек успешно создан</b>\nАдрес вашего кошелька: <code>${wallet}</code>`, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [(0, previous_button_inline_1.previousButton)('main_menu')],
                            },
                        });
                    }
                    catch (error) {
                        return query.reply(String(error));
                    }
            }
            const matchRequisite = data.match(/^requisite_(\d+)$/);
            const matchSellPaymentMethod = data.match(/^sell_payment_method_(\d+)$/);
            const matchBuyPaymentMethod = data.match(/^buy_payment_method_(\d+)$/);
            const matchDeleteRequisite = data.match(/^delete_requisite_(\d+)$/);
            const matchSelfContract = data.match(/^contract-item-(\d+)$/);
            const matchSellContract = data.match(/^sell_contract_(\d+)$/);
            const matchBuyContract = data.match(/^buy_contract_(\d+)$/);
            const matchPaymentContract = data.match(/^payment-contract-(\d+)$/);
            const matchDeleteContract = data.match(/^delete-contract-(\d+)$/);
            const matchSendMessageTo = data.match(/^send-message-(\d+)$/);
            const matchPaymentSuccessful = data.match(/^payment-successful-(\d+)$/);
            const matchCancelContract = data.match(/^cancel-contract-(\d+)$/);
            if (matchBuyContract) {
                const itemId = Number(matchBuyContract[1]);
                // @ts-ignore
                query.scene.state.contractId = itemId;
                yield prisma_client_1.prisma.contract
                    .findFirst({
                    where: {
                        id: itemId,
                    },
                    include: {
                        author: {
                            include: {
                                SellerContractTransaction: true,
                                toTransfers: true,
                            },
                        },
                        paymentMethod: true,
                    },
                })
                    .then((response) => __awaiter(void 0, void 0, void 0, function* () {
                    const buttonText = (response === null || response === void 0 ? void 0 : response.type) === 'buy' ? 'Продать' : 'Купить';
                    return query.editMessageText(`📜 ID: #${response === null || response === void 0 ? void 0 : response.code}\n\nЦена за 1 BTC: ${(0, currency_formatter_1.currencyFormatter)(response === null || response === void 0 ? void 0 : response.amount, response === null || response === void 0 ? void 0 : response.currency)}\nКомиссия сервиса: 0%\n\nВремя на оплату сделки: 15 минут\n\nТрейдер: @${response === null || response === void 0 ? void 0 : response.author.login}\nРепутация: 100%\nВерификация: ✔️\nОтзывы: 😊(0) 🙁(0)\n\nПровел сделок: ${response === null || response === void 0 ? void 0 : response.author.toTransfers.length}\n\nЗарегистрирован: ${(0, format_date_1.dateFormat)(response === null || response === void 0 ? void 0 : response.author.createdAt)}\n\nУсловия:\nМинимальная сумма - ${(0, currency_formatter_1.currencyFormatter)(response.price, response === null || response === void 0 ? void 0 : response.currency)}\nМаксимальная сумма - ${(0, currency_formatter_1.currencyFormatter)(response.maxPrice, response === null || response === void 0 ? void 0 : response.currency)}`, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        callback_data: `buy_contract`,
                                        text: `✅ ${buttonText}`,
                                    },
                                ],
                                (0, previous_button_inline_1.previousButton)('sell'),
                            ],
                        },
                    });
                }));
            }
            if (matchCancelContract) {
                const itemId = Number(matchCancelContract[1]);
                const transaction = yield prisma_client_1.prisma.user.findFirst({
                    where: {
                        id: itemId.toString(),
                    },
                    include: {
                        SellerContractTransaction: true,
                    },
                });
                if (transaction === null || transaction === void 0 ? void 0 : transaction.SellerContractTransaction) {
                    yield prisma_client_1.prisma.contractTransaction.delete({
                        where: {
                            id: transaction.SellerContractTransaction.id,
                        },
                    });
                    yield query.reply(`Сделка #${transaction.SellerContractTransaction.code} отменена`);
                    yield query.telegram.sendMessage(Number(transaction.SellerContractTransaction.buyerId), `Сделка #${transaction.SellerContractTransaction.code} отменена`);
                    return;
                }
                return;
            }
            if (matchPaymentSuccessful) {
                const itemId = Number(matchPaymentSuccessful[1]);
                const transaction = yield prisma_client_1.prisma.contractTransaction.findFirst({
                    where: {
                        buyerId: itemId.toString(),
                    },
                    include: {
                        buyer: {
                            include: {
                                wallet: true,
                            },
                        },
                        seller: true,
                    },
                });
                if (transaction) {
                    const coins = yield currency_service_1.default.convertRubleToBTC(transaction.amount);
                    yield prisma_client_1.prisma.contractTransaction.delete({
                        where: {
                            buyerId: itemId.toString(),
                        },
                    });
                    yield query.telegram.sendMessage(itemId, `Продавец @${transaction.seller.login} подтвердил получение денежных средств по сделке #${transaction.code}, ожидайте поступления ${coins} BTC на ваш счет`);
                    yield query.reply(`Вы подтвердили получение денежных средств, ${coins} BTC будут списаны с вашего счета и начислены пользователю @${transaction.buyer.login}`);
                    (0, send_coin_1.sendCoin)(Number(transaction.sellerId), (_h = (_g = transaction.buyer) === null || _g === void 0 ? void 0 : _g.wallet) === null || _h === void 0 ? void 0 : _h.address, Number(coins), bitcore_lib_1.Networks.mainnet);
                }
            }
            if (matchPaymentContract) {
                const itemId = Number(matchPaymentContract[1]);
                const user = yield prisma_client_1.prisma.user.findFirst({
                    where: {
                        id: itemId.toString(),
                    },
                    include: {
                        BuyerContractTransaction: {
                            include: {
                                contract: true,
                            },
                        },
                    },
                });
                yield query.telegram.sendMessage((_j = user === null || user === void 0 ? void 0 : user.BuyerContractTransaction) === null || _j === void 0 ? void 0 : _j.sellerId, `Пользователь @${user === null || user === void 0 ? void 0 : user.login} произвел оплату по сделке #${(_k = user === null || user === void 0 ? void 0 : user.BuyerContractTransaction) === null || _k === void 0 ? void 0 : _k.code}`, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    callback_data: `payment-successful-${(_l = user === null || user === void 0 ? void 0 : user.BuyerContractTransaction) === null || _l === void 0 ? void 0 : _l.buyerId}`,
                                    text: '✅ Деньги получены',
                                },
                                {
                                    callback_data: `send-message-${(_m = user === null || user === void 0 ? void 0 : user.BuyerContractTransaction) === null || _m === void 0 ? void 0 : _m.buyerId}`,
                                    text: '✉️ Ответить',
                                },
                            ],
                        ],
                    },
                });
            }
            if (matchSendMessageTo) {
                const itemId = Number(matchSendMessageTo[1]);
                return query.scene.enter('send_message', {
                    id: itemId,
                });
            }
            if (matchSellContract) {
                const itemId = Number(matchSellContract[1]);
                // @ts-ignore
                query.scene.state.contractId = itemId;
                yield prisma_client_1.prisma.contract
                    .findFirst({
                    where: {
                        id: itemId,
                    },
                    include: {
                        author: {
                            include: {
                                SellerContractTransaction: true,
                                toTransfers: true,
                            },
                        },
                        paymentMethod: true,
                    },
                })
                    .then((response) => __awaiter(void 0, void 0, void 0, function* () {
                    const buttonText = (response === null || response === void 0 ? void 0 : response.type) === 'buy' ? 'Продать' : 'Купить';
                    return query.editMessageText(`📜 ID: #${response === null || response === void 0 ? void 0 : response.code}\n\nЦена за 1 BTC: ${(0, currency_formatter_1.currencyFormatter)(response === null || response === void 0 ? void 0 : response.amount, response === null || response === void 0 ? void 0 : response.currency)}\nКомиссия сервиса: 0%\n\nВремя на оплату сделки: 15 минут\n\nТрейдер: @${response === null || response === void 0 ? void 0 : response.author.login}\nРепутация: 100%\nВерификация: ✔️\nОтзывы: 😊(0) 🙁(0)\n\nПровел сделок: ${response === null || response === void 0 ? void 0 : response.author.toTransfers.length}\n\nЗарегистрирован: ${(0, format_date_1.dateFormat)(response === null || response === void 0 ? void 0 : response.author.createdAt)}\n\nУсловия:\nМинимальная сумма - ${(0, currency_formatter_1.currencyFormatter)(response.price, response === null || response === void 0 ? void 0 : response.currency)}\nМаксимальная сумма - ${(0, currency_formatter_1.currencyFormatter)(response.maxPrice, response === null || response === void 0 ? void 0 : response.currency)}`, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        callback_data: `buy_contract`,
                                        text: `✅ ${buttonText}`,
                                    },
                                ],
                                (0, previous_button_inline_1.previousButton)('sell'),
                            ],
                        },
                    });
                }));
            }
            if (matchDeleteRequisite) {
                const itemId = Number(matchDeleteRequisite[1]);
                yield prisma_client_1.prisma.requisite.delete({
                    where: {
                        id: itemId,
                    },
                });
                yield query.editMessageText(`Реквизиты удалены.`, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [(0, previous_button_inline_1.previousButton)('requisites')],
                    },
                });
            }
            if (matchDeleteContract) {
                const itemId = Number(matchDeleteContract[1]);
                yield prisma_client_1.prisma.contract
                    .delete({
                    where: {
                        id: itemId,
                    },
                })
                    .then(res => {
                    return query.editMessageText(`Заявка <a>#${res.id}</a> удалена`, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [(0, previous_button_inline_1.previousButton)('my_ads')],
                        },
                    });
                });
            }
            if (matchSellPaymentMethod) {
                const itemId = Number(matchSellPaymentMethod[1]);
                const user = yield prisma_client_1.prisma.user.findFirst({
                    where: {
                        id: query.from.id.toString(),
                    },
                    include: {
                        Requisite: {
                            include: {
                                paymentMethod: true,
                            },
                        },
                    },
                });
                const paymentMethod = yield prisma_client_1.prisma.paymentMethod.findFirst({
                    where: {
                        id: itemId,
                    },
                });
                if (user === null || user === void 0 ? void 0 : user.Requisite.find(requisite => requisite.paymentMethod.id === (paymentMethod === null || paymentMethod === void 0 ? void 0 : paymentMethod.id))) {
                    const contracts = yield prisma_client_1.prisma.contract.findMany({
                        where: {
                            paymentMethodId: paymentMethod === null || paymentMethod === void 0 ? void 0 : paymentMethod.id,
                            type: 'sell',
                        },
                        include: {
                            author: true,
                        },
                    });
                    const contractsButtons = contracts.map(contract => {
                        return [
                            {
                                callback_data: `sell_contract_${contract.id}`,
                                text: `${contract.author.username} | ${(0, currency_formatter_1.currencyFormatter)(contract.amount, contract.currency)} | ${(0, currency_formatter_1.currencyFormatter)(contract.price, contract.currency)} - ${(0, currency_formatter_1.currencyFormatter)(contract.maxPrice, contract.currency)}`,
                            },
                        ];
                    });
                    return query.editMessageText(`💳 Здесь вы можете купить BTC за RUB через ${paymentMethod === null || paymentMethod === void 0 ? void 0 : paymentMethod.name}.`, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [...contractsButtons, (0, previous_button_inline_1.previousButton)('sell')],
                        },
                    });
                }
                return query.answerCbQuery('🚫 У вас нет реквизитов для этого банка, чтобы продолжить создание сделки', {
                    show_alert: true,
                });
            }
            if (matchBuyPaymentMethod) {
                const itemId = Number(matchBuyPaymentMethod[1]);
                const user = yield prisma_client_1.prisma.user.findFirst({
                    where: {
                        id: query.from.id.toString(),
                    },
                    include: {
                        Requisite: {
                            include: {
                                paymentMethod: true,
                            },
                        },
                    },
                });
                const paymentMethod = yield prisma_client_1.prisma.paymentMethod.findFirst({
                    where: {
                        id: itemId,
                    },
                });
                if (user === null || user === void 0 ? void 0 : user.Requisite.find(requisite => requisite.paymentMethod.id === (paymentMethod === null || paymentMethod === void 0 ? void 0 : paymentMethod.id))) {
                    const contracts = yield prisma_client_1.prisma.contract.findMany({
                        where: {
                            paymentMethodId: paymentMethod === null || paymentMethod === void 0 ? void 0 : paymentMethod.id,
                            type: 'buy',
                        },
                        include: {
                            author: true,
                        },
                    });
                    const contractsButtons = contracts.map(contract => {
                        return [
                            {
                                callback_data: `buy_contract_${contract.id}`,
                                text: `${contract.author.username} | ${(0, currency_formatter_1.currencyFormatter)(contract.amount, contract.currency)} | ${(0, currency_formatter_1.currencyFormatter)(contract.price, contract.currency)} - ${(0, currency_formatter_1.currencyFormatter)(contract.maxPrice, contract.currency)}`,
                            },
                        ];
                    });
                    return query.editMessageText(`💳 Здесь вы можете продать BTC за RUB через ${paymentMethod === null || paymentMethod === void 0 ? void 0 : paymentMethod.name}.`, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [...contractsButtons, (0, previous_button_inline_1.previousButton)('buy')],
                        },
                    });
                }
                return query.answerCbQuery('🚫 У вас нет реквизитов для этого банка, чтобы продолжить создание сделки', {
                    show_alert: true,
                });
            }
            if (matchSelfContract) {
                const itemId = Number(matchSelfContract[1]);
                const course = yield currency_service_1.default.getCurrency('bitcoin');
                yield prisma_client_1.prisma.contract
                    .findFirst({
                    where: {
                        id: itemId,
                    },
                    include: {
                        paymentMethod: true,
                    },
                })
                    .then(res => {
                    return query.editMessageText(`📰 Заявка <a>#${res === null || res === void 0 ? void 0 : res.id}</a>\n\n<b>Метод оплаты:</b> ${res === null || res === void 0 ? void 0 : res.paymentMethod.name}\n<b>Курс 1 BTC: </b>${(0, currency_formatter_1.currencyFormatter)(course === null || course === void 0 ? void 0 : course.bitcoin.rub, 'rub')}\n<b>Минимальная сумма:</b> ${res === null || res === void 0 ? void 0 : res.price} ${res === null || res === void 0 ? void 0 : res.currency}\n<b>Максимальная сумма:</b> ${res === null || res === void 0 ? void 0 : res.maxPrice} ${res === null || res === void 0 ? void 0 : res.currency}`, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        callback_data: `delete-contract-${res === null || res === void 0 ? void 0 : res.id}`,
                                        text: '❌ Удалить контракт',
                                    },
                                ],
                                [...(0, previous_button_inline_1.previousButton)('my_ads')],
                            ],
                        },
                    });
                });
            }
            if (matchRequisite) {
                const itemId = matchRequisite[1];
                const requisite = yield prisma_client_1.prisma.requisite.findFirst({
                    where: {
                        id: Number(itemId),
                    },
                    include: {
                        paymentMethod: true,
                    },
                });
                // Здесь вы можете выполнить действия с вашим itemId
                if (requisite) {
                    yield query.editMessageText(`<b>Платёжные реквизиты</b>\n\nТип операции: <code>Банковский перевод</code>\nВалюта: <code>${requisite.currency}</code>\nСпособ оплаты: <code>${requisite.paymentMethod.name}</code>\nРеквизиты: <code>${requisite.phoneOrbankCardNumber}</code>`, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        callback_data: `delete_requisite_${requisite.id}`,
                                        text: '❌ Удалить реквизиты',
                                    },
                                ],
                                (0, previous_button_inline_1.previousButton)('requisites'),
                            ],
                        },
                    });
                }
            }
        }
        catch (error) {
            console.log(error);
            return query.reply('❗️ Произошла непредвиденная ошибка');
        }
    }));
};
exports.callbackHandler = callbackHandler;
