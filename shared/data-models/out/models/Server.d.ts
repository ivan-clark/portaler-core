import BaseModel, { DBQuery } from './BaseModel';
interface ServerRoles {
    id: number;
    discordRoleId: string;
    lastUpdated: string;
}
export interface IServerModel {
    id: number;
    discordId: string;
    discordName: string;
    roles: ServerRoles[];
    subdomain?: string | null;
    createdOn: Date;
    isPublic: boolean;
    discordUrl?: string | null;
}
export default class ServerModel extends BaseModel {
    constructor(dbQuery: DBQuery);
    create: (discordId: string, discordName: string) => Promise<number>;
    createRole: (serverId: number, roleId: string) => Promise<number>;
    getServerConfig: (subdomain: string) => Promise<boolean>;
    getServer: (id: string | number) => Promise<IServerModel | null>;
    getServerIdBySubdomain: (subDomain: string) => Promise<number | null>;
}
export {};
