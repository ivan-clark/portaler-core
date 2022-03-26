import winston from 'winston';
export interface WinstonLog {
    level: 'emerg' | 'alert' | 'crit' | 'error' | 'warning' | 'notice' | 'info' | 'debug';
    message: string;
    service: string;
    metadata?: object;
    stack?: string | object;
    [key: string]: any;
}
export declare const createLogger: (service: string) => winston.Logger;
export default createLogger;
