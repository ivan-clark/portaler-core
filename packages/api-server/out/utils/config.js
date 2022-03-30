"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const port = Number(process.env.PORT || 4242);
const host = process.env.HOST;
const localUrl = `${host}${process.env.NODE_ENV !== 'production' ? `:${process.env.FRONTEND_PORT}` : ''}`;
// Build Regex for CORS
const replace = (_a = process.env.HOST) === null || _a === void 0 ? void 0 : _a.split('.').join('\\.');
const regex = new RegExp(`/${replace}/$`);
const discordApi = 'https://discord.com/api';
const discordAuthUrl = `${discordApi}/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_TOKEN}`;
const discordBotPerms = '268435456';
const config = {
    cors: {
        origin: regex,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    },
    port,
    host,
    localUrl,
    discord: {
        authUrl: `${discordAuthUrl}&redirect_uri=${encodeURI(process.env.DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20guilds`,
        botUrl: `${discordAuthUrl}&scope=bot&permissions=${discordBotPerms}`,
        redirectUri: process.env.DISCORD_REDIRECT_URI,
        apiUrl: discordApi,
        public: process.env.DISCORD_PUBLIC_TOKEN,
        client: process.env.DISCORD_CLIENT_TOKEN,
        secret: process.env.DISCORD_SECRET_TOKEN,
        role: process.env.DISCORD_ROLE,
    },
    db: {
        host: process.env.DB_HOST,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        port: Number(process.env.DB_PORT || 5432),
    },
    redis: {
        host: process.env.REDIS_HOST,
        password: process.env.REDIS_PASSWORD,
        port: Number(process.env.REDIS_PORT || 6379),
    },
    dns: process.env.USE_DNS || null,
};
exports.default = config;
