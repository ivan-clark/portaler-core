"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const logger_1 = __importDefault(require("./logger"));
const populateServers = async () => {
    try {
        const dbServerRes = await db_1.db.dbQuery(`SELECT id, subdomain, is_public FROM servers ORDER BY id;`, []);
        const subdomains = [];
        const ids = [];
        dbServerRes.rows.map((s) => {
            if (s.subdomain) {
                db_1.redis.setAsync(`server:${s.id}`, s.subdomain);
                db_1.redis.setAsync(`server:${s.subdomain}`, JSON.stringify({ isPublic: s.is_public, serverId: s.id }));
            }
        });
        await Promise.all([...subdomains, ...ids]);
    }
    catch (err) {
        logger_1.default.error('Error setting up servers in Redis', { error: err });
    }
};
exports.default = populateServers;
