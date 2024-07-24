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
exports.createWallet = void 0;
const bitcore_lib_1 = require("bitcore-lib");
const prisma_client_1 = require("../prisma/prisma.client");
const _1_1 = require("./1");
const createWallet = (telegramId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_client_1.prisma.user.findFirst({
        where: {
            id: telegramId.toString(),
        },
        include: {
            wallet: true,
        },
    });
    if (!user || user.wallet) {
        return undefined;
    }
    const wallet = (0, _1_1.createHDWallet)(bitcore_lib_1.Networks.mainnet);
    yield prisma_client_1.prisma.wallet.create({
        data: {
            user: {
                connect: {
                    id: user.id,
                },
            },
            address: wallet.address,
            mnemonicPhrase: wallet.mnemonic,
            privateKey: wallet.privateKey,
        },
    });
    return wallet.address;
});
exports.createWallet = createWallet;
