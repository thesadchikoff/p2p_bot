"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateFormat = void 0;
const dateFormat = (date) => {
    try {
        // const dateToFormat = new Date(date)
        const formatter = new Intl.DateTimeFormat('ru', {
            day: '2-digit',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
        });
        return formatter.format(date);
    }
    catch (error) {
        return 'Дата не определена';
    }
};
exports.dateFormat = dateFormat;
