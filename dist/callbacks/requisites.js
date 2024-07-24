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
exports.requisites = void 0;
const requisites_inline_1 = require("../keyboards/inline-keyboards/requisites.inline");
const prisma_client_1 = require("../prisma/prisma.client");
const requisites = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const requisites = yield prisma_client_1.prisma.requisite.findMany({
        where: {
            userId: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id.toString(),
        },
        include: {
            paymentMethod: true,
        },
    });
    return ctx.editMessageText('Здесь вы можете управлять своими платёжными реквизитами, которые используются в P2P.', {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: (0, requisites_inline_1.requisiteKeyboard)((_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id.toString(), requisites),
        },
    });
});
exports.requisites = requisites;
