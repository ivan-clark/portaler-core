"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("@portaler/data-models/out/models/User");
const db_1 = require("../utils/db");
exports.getServerPortals = async (serverId) => (await db_1.db.dbQuery('SELECT * FROM portals WHERE server_id = $1;', [serverId]))
    .rows;
exports.addServerPortal = async (serverId, conns, size, expires, userId) => {
    try {
        await db_1.db.dbQuery(`
    INSERT INTO portals (server_id, conn1, conn2, size, expires, created_by)
    VALUES ($1, $2, $3, $4, $5, $6);
  `, [serverId, conns[0], conns[1], size, expires, userId]);
        await db_1.db.User.logUserAction(userId, serverId, User_1.UserAction.add, JSON.stringify({
            conns,
            expires,
        }));
        return;
    }
    catch (err) {
        throw err;
    }
};
exports.deleteServerPortal = async (portalIds, userId, serverId) => {
    const portalDb = await db_1.db.dbQuery(`
    SELECT ROW_TO_JSON(portal) as json_field
    FROM (SELECT * FROM portals WHERE id = ANY($1::int[]) AND server_id = $2) portal
    `, [portalIds, serverId]);
    if (portalDb.rowCount > 0) {
        await db_1.db.dbQuery(`DELETE FROM portals WHERE id = ANY($1::int[]) AND server_id = $2`, [portalIds, serverId]);
        await db_1.db.User.logUserAction(userId, serverId, User_1.UserAction.delete, JSON.stringify(portalDb.rows[0].json_field));
        return;
    }
    throw Error('User does not have permissions');
};
exports.updateServerPortal = async (portalId, conns, size, expires, userId, serverId) => {
    const portalDb = await db_1.db.dbQuery(`
    SELECT ROW_TO_JSON(portal) as json_field, server_id
    FROM (SELECT * FROM portals WHERE id = $1) portal
    `, [portalId]);
    if (serverId === portalDb.rows[0].server_id) {
        await db_1.db.dbQuery(`
      UPDATE portals
      SET conn1 = $1,
        conn2 = $2,
        size = $3,
        expires = $4
      WHERE id = $5 AND serverId = $6 RETURNING `, [conns[0], conns[1], size, expires, portalId, serverId]);
        const portalUpdateDb = await db_1.db.dbQuery(`
      SELECT ROW_TO_JSON(portal) as json_field
      FROM (SELECT * FROM portals WHERE id = $1) portal
      `, [portalId]);
        await db_1.db.User.logUserAction(userId, serverId, User_1.UserAction.update, JSON.stringify({
            from: portalDb.rows[0].json_field,
            to: portalUpdateDb.rows[0].json_field,
        }));
        return;
    }
    throw Error('User does not have permissions');
};
