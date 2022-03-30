"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const logger_1 = __importDefault(require("./logger"));
const clearPortalInterval = () => setInterval(async () => {
    try {
        await db_1.db.dbQuery(`
        DELETE FROM portals WHERE expires < NOW();
        DELETE FROM portals WHERE size = 0 AND
          conn1 NOT IN (SELECT conn1 FROM portals WHERE size <> 0) AND
          conn1 NOT IN (SELECT conn2 FROM portals WHERE size <> 0) AND
          conn2 NOT IN (SELECT conn1 FROM portals WHERE size <> 0) AND
          conn2 NOT IN (SELECT conn2 FROM portals WHERE size <> 0);
      `);
    }
    catch (err) {
        logger_1.default.error('Error deleting expired portals', { error: err });
    }
}, 10000);
exports.default = clearPortalInterval;
