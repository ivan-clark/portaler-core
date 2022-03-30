"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
const checkAdmin = (req, res, next) => {
    if (!req.headers.authorization) {
        logger_1.default.emerg('Attempted admin endpoint', { headers: req.headers });
        return res.status(403);
    }
    const token = req.headers.authorization.split(' ')[1];
    if (token !== process.env.ADMIN_KEY) {
        return res.status(403);
    }
    next();
};
exports.default = checkAdmin;
