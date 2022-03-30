"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_fetch_1 = __importDefault(require("node-fetch"));
const config_1 = __importDefault(require("../utils/config"));
const db_1 = require("../utils/db");
const logger_1 = __importDefault(require("../utils/logger"));
const alphaTest = new RegExp(/^[a-z0-9]+$/gi);
const router = express_1.Router();
// Lists all our servers
router.get('/list', async (req, res) => {
    try {
        const dbServerRes = await db_1.db.dbQuery(`SELECT * FROM servers ORDER BY id`, []);
        const servers = dbServerRes.rows.map((s) => ({
            id: s.id,
            discordId: s.discord_id,
            discordName: s.discord_name,
            subdomain: s.subdomain,
            createdOn: s.created_on,
        }));
        return res.status(200).json(servers);
    }
    catch (err) {
        logger_1.default.error('No Server', {
            error: {
                error: JSON.stringify(err),
                trace: err.stack,
            },
        });
        return res.status(500).send(err);
    }
});
// adds a subdomain to a server
router.post('/addSubdomain', async (req, res) => {
    try {
        const body = req.body;
        const discordUrl = req.body.discordUrl || null;
        if (typeof body.id !== 'number' ||
            (typeof body.subdomain !== 'string' && alphaTest.test(body.subdomain))) {
            throw new Error('BadPayload');
        }
        // configure your own DNS service
        if (config_1.default.dns) {
            const dnsOk = await node_fetch_1.default(config_1.default.dns, {
                method: 'POST',
                body: JSON.stringify({ subdomain: body.subdomain }),
            }).then((res) => res.ok);
            if (!dnsOk) {
                throw new Error('DNS Config Error');
            }
        }
        await db_1.db.dbQuery(`UPDATE servers SET subdomain = $1, is_public = $2, discord_url = $3 WHERE id = $4`, [body.subdomain, !!body.isPublic, discordUrl, body.id]);
        const server = await db_1.db.Server.getServer(body.id);
        if (server && server.subdomain) {
            await db_1.redis.setAsync(`server:${server.id}`, server.subdomain);
            await db_1.redis.setAsync(`server:${server.subdomain}`, JSON.stringify({
                isPublic: server.isPublic,
                serverId: server.id,
                discordUrl: server.discordUrl,
            }));
        }
        return res.status(200).send(server);
    }
    catch (err) {
        logger_1.default.error('Subdomain', {
            error: {
                error: JSON.stringify(err),
                trace: err.stack,
            },
        });
        return res.status(500);
    }
});
exports.default = router;
