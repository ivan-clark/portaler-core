"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const btoa_1 = __importDefault(require("btoa"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const config_1 = __importDefault(require("../config"));
const creds = btoa_1.default(`${config_1.default.discord.client}:${config_1.default.discord.secret}`);
const fetchToken = async (code) => {
    const data = {
        client_id: config_1.default.discord.client,
        client_secret: config_1.default.discord.secret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${config_1.default.discord.redirectUri}`,
        scope: 'identify guilds',
    };
    const discordRes = await node_fetch_1.default(`${config_1.default.discord.apiUrl}/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${creds}`,
            ContentType: 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(data),
    });
    if (!discordRes.ok) {
        throw new Error('Bad Response from Discord Auth');
    }
    const discordJson = await discordRes.json();
    return discordJson;
};
exports.default = fetchToken;
