"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previousButton = void 0;
const previousButton = (callbackData) => {
    return [
        {
            callback_data: callbackData,
            text: '← Назад',
        },
    ];
};
exports.previousButton = previousButton;
