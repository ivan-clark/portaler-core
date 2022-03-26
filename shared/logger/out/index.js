"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
exports.createLogger = (service) => winston_1.default.createLogger({
    format: winston_1.default.format.json(),
    defaultMeta: { service },
    transports: [new winston_1.default.transports.Console()],
});
exports.default = exports.createLogger;
