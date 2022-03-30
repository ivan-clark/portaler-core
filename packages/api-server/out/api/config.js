"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../utils/db");
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.Router();
const isProd = process.env.NODE_ENV === 'production';
router.get('/', async (req, res) => {
    try {
        const subdomain = isProd ? req.subdomains[0] : process.env.HOST;
        const serverConfigRes = await db_1.redis.getAsync(`server:${subdomain}`);
        const serverConfig = serverConfigRes ? JSON.parse(serverConfigRes) : false;
        res.status(200).send({
            publicRead: serverConfig.isPublic,
            discordUrl: serverConfig.discordUrl,
        });
    }
    catch (err) {
        logger_1.default.error('Error fetching config', {
            error: {
                error: JSON.stringify(err),
                trace: err.stack,
            },
        });
        res.status(200).send({ publicRead: false, discordUrl: null });
    }
});
exports.default = router;
