import { ClientOpts, RedisClient } from 'redis';
import { Zone } from '@portaler/types';
declare type ExpireTimes = 'EX' | 'PX' | 'NX' | 'XX' | 'KEEPTTL' | 'GET';
export default class RedisConnector {
    client: RedisClient;
    getAsync: (key: string) => Promise<any>;
    setAsync: (key: string, value: string, mode?: ExpireTimes, expires?: number) => Promise<any>;
    delAsync: (key: string) => Promise<any>;
    constructor(config: ClientOpts);
    setUser: (token: string, userId: number, serverId: number) => Promise<[any, any]>;
    getUser: (token: string) => Promise<string>;
    getToken: (userId: number, serverId: number) => Promise<any>;
    delUser: (token: string, userId: number, serverId: number) => Promise<[any, any]>;
    delServer: (serverId: number, userIds: number[]) => Promise<void>;
    setZones: (zones: Zone[]) => Promise<any>;
    getZones: () => Promise<any>;
    setZone: (zone: Zone) => Promise<any>;
    getZone: (id: number) => Promise<any>;
}
export {};
