import pg, { Pool, PoolConfig } from 'pg';
import LogModel from './models/Logs';
import ServerModel from './models/Server';
import UserModel from './models/User';
export default class DatabaseConnector {
    pool: Pool;
    constructor(config: PoolConfig);
    dbQuery: (query: string, params?: (string | number | Date | number[])[]) => Promise<pg.QueryResult<any>>;
    Server: ServerModel;
    User: UserModel;
    Logs: LogModel;
}
