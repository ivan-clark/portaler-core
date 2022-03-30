"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const postgres_migrations_1 = require("postgres-migrations");
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./logger"));
const migrations = async () => {
    try {
        await postgres_migrations_1.createDb(config_1.default.db.database, {
            ...config_1.default.db,
            defaultDatabase: 'postgres',
        });
        await postgres_migrations_1.migrate(config_1.default.db, path_1.default.resolve('./db_migrations'));
    }
    catch (err) {
        logger_1.default.error('Error populating servers', { error: err });
    }
};
exports.default = migrations;
