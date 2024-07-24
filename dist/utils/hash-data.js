"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeHashData = exports.hashData = void 0;
const argon2 = require("argon2");
const hashData = (value) => {
    try {
        return argon2.hash(value);
    }
    catch (error) {
        console.log(error);
        return 'Ошибка при шифровке данных';
    }
};
exports.hashData = hashData;
const decodeHashData = (original, decodeValue) => {
    return argon2.verify(original, decodeValue);
};
exports.decodeHashData = decodeHashData;
