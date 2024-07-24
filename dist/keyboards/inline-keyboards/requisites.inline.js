"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requisiteKeyboard = void 0;
const requisiteKeyboard = (telegramId, requisites) => {
    let requisiteItems = [];
    if (requisites.length > 0) {
        requisiteItems = requisites.map(requisite => {
            return [
                {
                    callback_data: `requisite_${requisite.id}`,
                    text: `${requisite.paymentMethod.name} | *${requisite.phoneOrbankCardNumber.slice(-4)} | ${requisite.currency}`,
                },
            ];
        });
    }
    return [
        [
            {
                callback_data: 'add_requisite',
                text: '📝 Добавить реквизиты',
            },
        ],
        ...requisiteItems,
        [
            {
                callback_data: 'settings',
                text: '← Назад',
            },
        ],
    ];
};
exports.requisiteKeyboard = requisiteKeyboard;
