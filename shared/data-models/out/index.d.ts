import { PoolConfig } from 'pg';
import { ClientOpts } from 'redis';
import DatabaseConnector from './DatabaseConnector';
import RedisConnector from './RedisConnector';
declare const getDatabases: (dbConfig: PoolConfig, redisConfig: ClientOpts) => Promise<{
    db: DatabaseConnector;
    redis: RedisConnector;
}>;
export { DatabaseConnector, RedisConnector };
export { IServerModel } from './models/Server';
export { IUserModel } from './models/User';
export default getDatabases;
