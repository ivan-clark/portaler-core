"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const btoa_1 = __importDefault(require("btoa"));
const express_1 = require("express");
const uuid_1 = require("uuid");
const User_1 = require("@portaler/data-models/out/models/User");
const config_1 = __importDefault(require("../utils/config"));
const db_1 = require("../utils/db");
const fetchToken_1 = __importDefault(require("../utils/discord/fetchToken"));
const fetchUser_1 = __importDefault(require("../utils/discord/fetchUser"));
const fetchUserGuilds_1 = __importDefault(require("../utils/discord/fetchUserGuilds"));
const logger_1 = __importDefault(require("../utils/logger"));
const isProd = process.env.NODE_ENV === 'production';
const router = express_1.Router();
router.get('/login', (_, res) => {
    res.redirect(config_1.default.discord.authUrl);
});
// should come from auth.portaler
router.get('/callback', async (req, res) => {
    try {
        if (!req.query.code) {
            throw new Error('NoCodeProvided');
        }
        if (!req.cookies.subdomain && isProd) {
            throw new Error('NoRedirect');
        }
        const subdomain = isProd ? req.cookies.subdomain : process.env.HOST;
        const protocol = req.secure ? 'https://' : 'http://';
        const code = req.query.code;
        const discordJson = await fetchToken_1.default(code);
        const token = discordJson.access_token;
        const [me, server] = await Promise.all([
            fetchUser_1.default(token),
            fetchUserGuilds_1.default(token),
        ]);
        const userId = await db_1.db.User.createLogin(me, server, discordJson.refresh_token);
        const serverId = await db_1.db.Server.getServerIdBySubdomain(isProd ? subdomain : 'localhost');
        if (!serverId) {
            throw new Error('NoSubdomainServerFound');
        }
        const user = await db_1.db.User.getFullUser(userId, serverId);
        const redirectUrl = isProd
            ? `${protocol}${subdomain}.${config_1.default.localUrl}`
            : `${protocol}${process.env.HOST}:${process.env.FRONTEND_PORT}`;
        if (!user) {
            return res.status(401).redirect(`${redirectUrl}/?token=invalid`);
        }
        const uid = uuid_1.v4();
        const ourToken = btoa_1.default(uid.replace(/-/gi, '')).replace(/=/gi, '');
        await db_1.redis.setUser(ourToken, user.id, serverId);
        await db_1.db.User.logUserAction(user.id, serverId, User_1.UserAction.login, JSON.stringify({ user }));
        res.redirect(`${redirectUrl}/?token=${ourToken}`);
    }
    catch (err) {
        logger_1.default.error('Error logging in User', {
            error: {
                error: JSON.stringify(err),
                trace: err.stack,
            },
        });
        res.sendStatus(500);
    }
});
exports.default = router;
