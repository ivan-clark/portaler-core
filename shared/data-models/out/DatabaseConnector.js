"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const Logs_1 = __importDefault(require("./models/Logs"));
const Server_1 = __importDefault(require("./models/Server"));
const User_1 = __importDefault(require("./models/User"));
class DatabaseConnector {
    constructor(config) {
        this.dbQuery = (query, params = []) => this.pool.query(query, params);
        this.Server = new Server_1.default(this.dbQuery);
        this.User = new User_1.default(this.dbQuery);
        this.Logs = new Logs_1.default(this.dbQuery);
        this.pool = new pg_1.Pool(config);
    }
}
exports.default = DatabaseConnector;
