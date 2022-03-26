"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseModel_1 = __importDefault(require("./BaseModel"));
class LogsModel extends BaseModel_1.default {
    constructor(dbQuery) {
        super(dbQuery);
        this.winstonLog = (info) => {
            this.query(`
      INSERT INTO server_logs (log_type, log_subtype, log_data)
      VALUES ($1, $2, $3);
    `, [`winston_${info.level}`, info.service, JSON.stringify(info)]);
        };
        this.getLatestCommit = async () => {
            const log = await this.query(`
    SELECT log_data::text FROM server_logs
    WHERE log_type = 'etl-update'
    ORDER BY created_on DESC
    LIMIT 1;`, []);
            if (log.rowCount === 0) {
                return 'not here';
            }
            return JSON.parse(log.rows[0].log_data).hash;
        };
        this.updateLatestCommit = async (hash) => {
            await this.query(`
    INSERT INTO server_logs (log_type, log_data) VALUES
    ('etl-update', $1);
  `, [JSON.stringify({ hash })]);
            return;
        };
    }
}
exports.default = LogsModel;
