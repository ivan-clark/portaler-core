import { GuildMember } from 'discord.js';
import { QueryResult } from 'pg';
import { DiscordMe, DiscordMeGuild } from '@portaler/types';
import BaseModel, { DBQuery } from './BaseModel';
interface ServerRoleId {
    serverId: string;
    roleId: string;
}
export interface IUserModel {
    id: number;
    discordId: string;
    discordName: string;
    serverAccess?: ServerRoleId[];
    discordRefresh?: string | null;
    createdOn: Date;
}
export declare enum UserAction {
    add = "add",
    update = "update",
    delete = "delete",
    login = "login"
}
export default class UserModel extends BaseModel {
    constructor(dbQuery: DBQuery);
    createUser: (member: GuildMember, serverId: number, roles: number[]) => Promise<QueryResult<any>[]>;
    createLogin: (userInfo: DiscordMe, servers: DiscordMeGuild[], refreshToken: string) => Promise<number>;
    addRoles: (userId: number, roleIds: number[], serverId: number) => Promise<boolean>;
    getUserByDiscord: (userId: string) => Promise<IUserModel | null>;
    getFullUser: (userId: string | number, serverId: number) => Promise<IUserModel | null>;
    logUserAction: (userId: number, serverId: number, action: UserAction, details: string) => Promise<QueryResult<any>>;
    removeUserRoles: (userId: number, roleIds: number[]) => Promise<QueryResult<any>[]>;
    removeUserServer: (userId: number, serverId: number) => Promise<QueryResult<any>>;
}
export {};
