"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencyFormatter = void 0;
const currencyFormatter = (value, currency) => {
    try {
        const result = new Intl.NumberFormat('ru', {
            currency,
            style: 'currency',
        });
        return result.format(value);
    }
    catch (error) {
        return 'сумма не определена';
    }
};
exports.currencyFormatter = currencyFormatter;
