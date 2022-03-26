"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseModel_1 = __importDefault(require("./BaseModel"));
const Server_1 = __importDefault(require("./Server"));
var UserAction;
(function (UserAction) {
    UserAction["add"] = "add";
    UserAction["update"] = "update";
    UserAction["delete"] = "delete";
    UserAction["login"] = "login";
})(UserAction = exports.UserAction || (exports.UserAction = {}));
class UserModel extends BaseModel_1.default {
    constructor(dbQuery) {
        super(dbQuery);
        this.createUser = async (member, serverId, roles) => {
            try {
                const user = await this.getUserByDiscord(member.user.id);
                let userId = user ? user.id : null;
                if (!userId) {
                    const dbResUser = await this.query(`
          INSERT INTO users(discord_id, discord_name, discord_discriminator)
          VALUES ($1, $2, $3) RETURNING id;
          `, [member.user.id, member.user.username, member.user.discriminator]);
                    userId = dbResUser.rows[0].id;
                }
                if (userId === null) {
                    throw new Error('NoUserFound');
                }
                const adds = [];
                adds.push(this.query(`INSERT INTO user_servers(user_id, server_id) VALUES($1, $2)`, [userId, serverId]));
                roles.forEach((r) => {
                    adds.push(this.query(`INSERT INTO user_roles(user_id, role_id) VALUES($1, $2)`, [userId, r]));
                });
                return await Promise.all(adds);
            }
            catch (err) {
                throw err;
            }
        };
        this.createLogin = async (userInfo, servers, refreshToken) => {
            if (!userInfo.username) {
                throw new Error('NoUsername');
            }
            if (!userInfo.discriminator) {
                throw Error('NoUserDiscriminator');
            }
            if (!refreshToken) {
                throw Error('NoRefreshToken');
            }
            try {
                const serverModel = new Server_1.default(this.query);
                const serverResponse = await Promise.all(servers.map(async (s) => await serverModel.getServer(s.id)));
                const existingServers = serverResponse.filter(Boolean);
                if (existingServers.length === 0) {
                    throw Error('NoServersFoundForUser');
                }
                const userExists = await this.getUserByDiscord(userInfo.id);
                let userId = userExists ? userExists.id : null;
                if (!userId) {
                    const dbResUser = await this.query(`
          INSERT INTO users(discord_id, discord_name, discord_discriminator, discord_refresh)
          VALUES ($1, $2, $3, $4) RETURNING id;
          `, [userInfo.id, userInfo.username, userInfo.discriminator, refreshToken]);
                    userId = dbResUser.rows[0].id;
                }
                else {
                    await this.query(`UPDATE users SET discord_refresh = $1 WHERE id = $2`, [refreshToken, userId]);
                }
                if (userId === null || !userId) {
                    throw new Error('UserNotFoundOrCreated');
                }
                await Promise.all(existingServers.map((s) => {
                    var _a, _b;
                    if ((_b = (_a = userExists) === null || _a === void 0 ? void 0 : _a.serverAccess) === null || _b === void 0 ? void 0 : _b.find((ue) => ue.serverId === s.discordId)) {
                        return this.query(`INSERT INTO user_servers(user_id, server_id) VALUES($1, $2)`, [userId, s.id]);
                    }
                    return Promise.resolve(null);
                }));
                return userId;
            }
            catch (err) {
                throw err;
            }
        };
        this.addRoles = async (userId, roleIds, serverId) => {
            const dbUserServerRes = await this.query(`SELECT * FROM user_servers WHERE user_id = $1 AND server_id = $2`, [userId, serverId]);
            if (dbUserServerRes.rowCount === 0) {
                await this.query(`INSERT INTO user_servers(user_id, server_id) VALUES($1, $2)`, [userId, serverId]);
            }
            const adds = roleIds.map((r) => this.query(`INSERT INTO user_roles(user_id, role_id) VALUES($1, $2)`, [
                userId,
                r,
            ]));
            await Promise.all(adds);
            return true;
        };
        this.getUserByDiscord = async (userId) => {
            try {
                const dbResUser = await this.query(`SELECT * FROM users WHERE discord_id = $1`, [userId]);
                if (dbResUser.rowCount === 0) {
                    return null;
                }
                const fRow = dbResUser.rows[0];
                const user = {
                    id: fRow.id,
                    discordId: fRow.discord_id,
                    discordName: `${fRow.discord_name}#${fRow.discriminator}`,
                    discordRefresh: fRow.refresh,
                    createdOn: fRow.created_on,
                };
                return user;
            }
            catch (err) {
                return null;
            }
        };
        this.getFullUser = async (userId, serverId) => {
            try {
                const dbResUser = await this.query(`
      SELECT u.id AS id,
        u.discord_id AS discord_id,
        u.discord_name AS discord_name,
        u.discord_discriminator AS discriminator,
        u.discord_refresh AS refresh,
        u.created_on AS created_on,
        sr.server_id AS server_id,
        sr.discord_role_id AS role_id
      FROM users AS u
      JOIN user_servers AS us ON us.user_id = u.id
      JOIN server_roles AS sr ON sr.id = us.server_id
      JOIN user_roles AS ur ON ur.user_id = u.id AND ur.role_id = sr.id
      WHERE ${typeof userId === 'string' ? 'u.discord_id' : 'u.id'} = $1
        AND sr.server_id = $2
    `, [userId, serverId]);
                if (dbResUser.rowCount === 0) {
                    return null;
                }
                const fRow = dbResUser.rows[0];
                const user = {
                    id: fRow.id,
                    discordId: fRow.discord_id,
                    discordName: `${fRow.discord_name}#${fRow.discriminator}`,
                    discordRefresh: fRow.refresh,
                    createdOn: fRow.created_on,
                    serverAccess: dbResUser.rows.map((r) => ({
                        serverId: r.server_id,
                        roleId: r.role_id,
                    })),
                };
                return user;
            }
            catch (err) {
                return null;
            }
        };
        this.logUserAction = (userId, serverId, action, details) => this.query(`
      INSERT INTO user_logs (user_id, server_id, user_action, details)
      VALUES ($1, $2, $3, $4);
    `, [userId, serverId, action, details]);
        this.removeUserRoles = (userId, roleIds) => Promise.all(roleIds.map((r) => this.query(`DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2`, [userId, r])));
        this.removeUserServer = (userId, serverId) => this.query(`DELETE FROM user_servers WHERE user_id = $1 AND server_id = $2`, [userId, serverId]);
    }
}
exports.default = UserModel;
