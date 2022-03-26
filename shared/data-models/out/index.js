"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const async_retry_1 = __importDefault(require("async-retry"));
const DatabaseConnector_1 = __importDefault(require("./DatabaseConnector"));
exports.DatabaseConnector = DatabaseConnector_1.default;
const RedisConnector_1 = __importDefault(require("./RedisConnector"));
exports.RedisConnector = RedisConnector_1.default;
const getDatabases = async (dbConfig, redisConfig) => await async_retry_1.default(async () => {
    const db = new DatabaseConnector_1.default(dbConfig);
    const rows = await db.dbQuery('SELECT NOW();');
    if (rows.rowCount === 0) {
        throw new Error('Error connecting to db');
    }
    const redis = new RedisConnector_1.default(redisConfig);
    if (redis) {
        console.log('Connected to Db & Redis');
        return { db, redis };
    }
    else {
        throw new Error('Error connecting to Redis');
    }
}, {
    retries: 100,
    minTimeout: 100,
    maxTimeout: 1000,
    randomize: false,
    onRetry: (err, count) => console.log(`Retrying db connection ${count}`, err),
});
exports.default = getDatabases;
