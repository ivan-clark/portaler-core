"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
const syntaxError = (error, req, res, next) => {
    if (error instanceof SyntaxError) {
        logger_1.default.error('Syntax Error', { error });
        return res.status(500).json({ error: 'SyntaxError' });
    }
    else {
        next();
    }
};
exports.default = syntaxError;
