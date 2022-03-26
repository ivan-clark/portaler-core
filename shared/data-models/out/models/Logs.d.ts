import BaseModel, { DBQuery } from './BaseModel';
import { WinstonLog } from '@portaler/logger';
export default class LogsModel extends BaseModel {
    constructor(dbQuery: DBQuery);
    winstonLog: (info: WinstonLog) => void;
    getLatestCommit: () => Promise<string>;
    updateLatestCommit: (hash: string) => Promise<void>;
}
