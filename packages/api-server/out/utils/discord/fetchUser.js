"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const config_1 = __importDefault(require("../config"));
const fetchUser = async (token) => {
    const res = await node_fetch_1.default(`${config_1.default.discord.apiUrl}/users/@me`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) {
        throw new Error('Bad Response from Discord @me');
    }
    return await res.json();
};
exports.default = fetchUser;
