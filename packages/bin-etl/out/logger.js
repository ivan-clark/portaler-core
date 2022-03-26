"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("@portaler/logger"));
const db_1 = require("./db");
const logger = logger_1.default((_a = process.env.SERVICE, (_a !== null && _a !== void 0 ? _a : 'bin-etl')));
logger.on('data', (info) => {
    try {
        setImmediate(() => {
            db_1.db.Logs.winstonLog(info);
        });
    }
    catch (err) {
        console.error(err);
    }
});
exports.default = logger;
