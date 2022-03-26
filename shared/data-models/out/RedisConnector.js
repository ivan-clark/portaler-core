"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = __importDefault(require("redis"));
const util_1 = require("util");
class RedisConnector {
    constructor(config) {
        this.setUser = async (token, userId, serverId) => {
            const hasUser = await this.getUser(`${userId}:${serverId}`);
            if (hasUser) {
                await this.delUser(hasUser, userId, serverId);
            }
            return await Promise.all([
                this.setAsync(token, `${userId}:${serverId}`),
                this.setAsync(`${userId}:${serverId}`, token),
            ]);
        };
        this.getUser = async (token) => await this.getAsync(token);
        this.getToken = async (userId, serverId) => await this.getAsync(`${userId}:${serverId}`);
        this.delUser = async (token, userId, serverId) => await Promise.all([
            this.delAsync(token),
            this.delAsync(`${userId}:${serverId}`),
        ]);
        this.delServer = async (serverId, userIds) => {
            const tokenList = await Promise.all(userIds.map((uid) => this.getToken(uid, serverId)));
            const delTokens = tokenList.map((t) => this.delAsync(t));
            const delUsers = userIds.map((uid) => this.delAsync(`${uid}:${serverId}`));
            const delServer = this.delAsync(`server:${serverId}`);
            await Promise.all([...delTokens, ...delUsers, delServer]);
        };
        this.setZones = async (zones) => {
            await this.delAsync('zones');
            return await this.setAsync('zones', JSON.stringify(zones));
        };
        this.getZones = async () => await this.getAsync('zones');
        this.setZone = async (zone) => await this.setAsync(`zone:${zone.id}`, JSON.stringify(zone), 'EX', 7200);
        this.getZone = async (id) => await this.getAsync(`zone:${id}`);
        this.client = redis_1.default.createClient({
            ...config,
            retry_strategy: ({ error }) => this.client.emit('error', error),
        });
        this.getAsync = util_1.promisify(this.client.get).bind(this.client);
        this.setAsync = util_1.promisify(this.client.set).bind(this.client);
        this.delAsync = util_1.promisify(this.client.del).bind(this.client);
    }
}
exports.default = RedisConnector;
