"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseModel_1 = __importDefault(require("./BaseModel"));
class ServerModel extends BaseModel_1.default {
    constructor(dbQuery) {
        super(dbQuery);
        this.create = async (discordId, discordName) => {
            const dbResServer = await this.query(`
      INSERT INTO servers(discord_id, discord_name)
      VALUES ($1, $2) RETURNING id;
    `, [discordId, discordName]);
            return dbResServer.rows[0].id;
        };
        this.createRole = async (serverId, roleId) => {
            const dbResRole = await this.query(`INSERT INTO server_roles(server_id, discord_role_id) VALUES($1, $2) RETURNING id`, [serverId, roleId]);
            return dbResRole.rows[0].id;
        };
        this.getServerConfig = async (subdomain) => {
            const dbRes = await this.query(`SELECT is_public FROM servers WHERE subdomain = $1`, [subdomain]);
            return dbRes.rowCount > 0 ? dbRes.rows[0].is_public : false;
        };
        this.getServer = async (id) => {
            try {
                const queryString = `
      SELECT
        s.id AS id,
        s.discord_id AS discord_id,
        s.discord_name AS discord_name,
        s.subdomain AS subdomain,
        s.created_on AS created_on,
        s.is_public AS is_public,
        s.discord_url AS discord_url,
        sr.id AS role_id,
        sr.discord_role_id AS discord_role_id,
        sr.last_updated AS role_last_updated
      FROM servers AS s
      LEFT JOIN server_roles AS sr ON sr.server_id = s.id
      WHERE ${typeof id === 'number' ? 's.id' : 's.discord_id'} = $1
    `;
                const dbResServer = await this.query(queryString, [id]);
                if (dbResServer.rowCount === 0) {
                    throw new Error('NoServerFound');
                }
                const fRow = dbResServer.rows[0];
                const server = {
                    id: fRow.id,
                    discordId: fRow.discord_id,
                    discordName: fRow.discord_name,
                    subdomain: fRow.subdomain,
                    createdOn: fRow.created_on,
                    isPublic: fRow.is_public,
                    discordUrl: fRow.discord_url,
                    roles: dbResServer.rows.map((r) => ({
                        id: r.role_id,
                        discordRoleId: r.discord_role_id,
                        lastUpdated: r.role_last_updated,
                    })),
                };
                return server;
            }
            catch (err) {
                return null;
            }
        };
        this.getServerIdBySubdomain = async (subDomain) => {
            const dbResServer = await this.query(`SELECT id FROM servers WHERE subdomain = $1`, [subDomain.toLowerCase()]);
            if (dbResServer.rowCount === 0) {
                return null;
            }
            return dbResServer.rows[0].id;
        };
    }
}
exports.default = ServerModel;
