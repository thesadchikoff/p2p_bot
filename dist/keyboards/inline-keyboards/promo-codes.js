"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promoCodesButtons = void 0;
const promoCodesButtons = (codesCount) => {
    return [
        [
            {
                callback_data: 'promo_information',
                text: 'Информация',
            },
            {
                callback_data: 'my_codes',
                text: `Мои коды (${codesCount})`,
            },
        ],
        [
            {
                callback_data: 'activate_code',
                text: 'Активировать',
            },
            {
                callback_data: 'create_code',
                text: 'Создать',
            },
        ],
    ];
};
exports.promoCodesButtons = promoCodesButtons;
