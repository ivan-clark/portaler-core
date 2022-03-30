"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const luxon_1 = require("luxon");
const User_1 = require("@portaler/data-models/out/models/User");
const portals_1 = require("../database/portals");
const db_1 = require("../utils/db");
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.Router();
const ISO_OPTS = {
    suppressMilliseconds: true,
    includeOffset: false,
};
const getExpireTime = (size, hours, minutes) => {
    const _hours = size === 0 ? 999 : Number(hours);
    const _minutes = size === 0 ? 999 : Number(minutes);
    return luxon_1.DateTime.utc()
        .plus({
        hours: _hours,
        minutes: _minutes,
    })
        .toJSDate();
};
router.get('/', async (req, res) => {
    try {
        const dbPortals = await portals_1.getServerPortals(req.serverId);
        const now = luxon_1.DateTime.utc();
        const portals = dbPortals.map((p) => {
            const expires = luxon_1.DateTime.fromJSDate(p.expires).toUTC();
            const connection = [p.conn1, p.conn2].sort();
            return {
                id: p.id,
                connection,
                size: p.size,
                expiresUtc: expires.toISO(ISO_OPTS),
                timeLeft: expires.diff(now).as('seconds'),
            };
        });
        res.status(200).send(portals);
    }
    catch (err) {
        logger_1.default.error('Error fetching portals', {
            user: req.userId,
            server: req.serverId,
            error: err,
        });
        res.sendStatus(500);
    }
});
router.post('/', async (req, res) => {
    try {
        if (req.userId === 0) {
            return res.send(401);
        }
        const body = req.body;
        const expires = getExpireTime(body.size, body.hours, body.minutes);
        const conns = body.connection.sort();
        // TODO move the queries in this function to the new package
        // retain backwards compatibility until we can edit connections
        const dbRes = await db_1.db.dbQuery(`
      SELECT id
      FROM (SELECT * FROM portals WHERE server_id = $1 AND conn1 = $2 AND conn2 = $3) portal;
    `, [req.serverId, conns[0], conns[1]]);
        if (dbRes.rowCount === 0) {
            await db_1.db.dbQuery(`
      INSERT INTO portals (server_id, conn1, conn2, size, expires, created_by)
      VALUES ($1, $2, $3, $4, $5, $6);
    `, [req.serverId, conns[0], conns[1], body.size, expires, req.userId]);
            await db_1.db.User.logUserAction(req.userId, req.serverId, User_1.UserAction.add, JSON.stringify({
                conns,
                expires,
            }));
        }
        else {
            await db_1.db.dbQuery(`
        UPDATE portals
        SET size = $1, expires = $2
        WHERE id = $3;
      `, [body.size, expires, dbRes.rows[0].id]);
            const portalUpdateDb = await db_1.db.dbQuery(`
        SELECT ROW_TO_JSON(portal) as json_field
        FROM (SELECT * FROM portals WHERE id = $1) portal
        `, [dbRes.rows[0].id]);
            await db_1.db.User.logUserAction(req.userId, req.serverId, User_1.UserAction.update, JSON.stringify({
                from: dbRes.rows[0].json_field,
                to: portalUpdateDb.rows[0].json_field,
            }));
        }
        res.sendStatus(204);
    }
    catch (err) {
        logger_1.default.error('Error setting portals', {
            user: req.userId,
            server: req.serverId,
            error: {
                error: JSON.stringify(err),
                trace: err.stack,
            },
        });
        res.sendStatus(500);
    }
});
router.delete('/', async (req, res) => {
    try {
        if (req.userId === 0) {
            return res.sendStatus(401);
        }
        const portalIds = req.body.portals
            .map((p) => {
            const id = Number(p);
            if (isNaN(id)) {
                return null;
            }
            return id;
        })
            .filter(Boolean);
        await portals_1.deleteServerPortal(portalIds, req.userId, req.serverId);
        res.sendStatus(204);
    }
    catch (err) {
        logger_1.default.error('Unable to delete', {
            user: req.userId,
            server: req.serverId,
            error: {
                error: JSON.stringify(err),
                trace: err.stack,
            },
        });
        res.sendStatus(500);
    }
});
exports.default = router;
