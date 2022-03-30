"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_models_1 = __importDefault(require("@portaler/data-models"));
const config_1 = __importDefault(require("./config"));
let db;
exports.db = db;
let redis;
exports.redis = redis;
const getDb = async () => {
    const { db: tmpDb, redis: tmpRedis } = await data_models_1.default(config_1.default.db, config_1.default.redis);
    exports.db = db = tmpDb;
    exports.redis = redis = tmpRedis;
};
exports.default = getDb;
