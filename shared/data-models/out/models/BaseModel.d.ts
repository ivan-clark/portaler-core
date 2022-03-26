import { QueryResult } from 'pg';
export declare type DBQuery = (query: string, params: (string | number | number[] | Date)[]) => Promise<QueryResult>;
export default class BaseModel {
    protected query: DBQuery;
    constructor(dbQuery: DBQuery);
}
