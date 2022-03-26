"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_models_1 = __importDefault(require("@portaler/data-models"));
const config = {
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
};
let db;
exports.db = db;
let redis;
exports.redis = redis;
const getDb = async () => {
    const { db: tmpDb, redis: tmpRedis } = await data_models_1.default(config.db, config.redis);
    exports.db = db = tmpDb;
    exports.redis = redis = tmpRedis;
};
exports.default = getDb;
