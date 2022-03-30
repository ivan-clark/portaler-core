"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zones_1 = require("../database/zones");
const db_1 = require("../utils/db");
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.Router();
router.get('/list', async (_, res) => {
    try {
        const zones = await db_1.redis.getZones();
        res.contentType('application/json').status(200).send(zones);
    }
    catch (err) {
        logger_1.default.error('Error fetching zones', {
            error: {
                error: JSON.stringify(err),
                trace: err.stack,
            },
        });
        res.sendStatus(500);
    }
});
router.get('/info/:id', async (req, res) => {
    try {
        const zone = await zones_1.getZoneMeta(Number(req.params.id));
        res.contentType('application/json').status(200).send(zone);
    }
    catch (err) {
        logger_1.default.error('Error fetching zone info', {
            error: {
                error: JSON.stringify(err),
                trace: err.stack,
            },
        });
        res.sendStatus(500);
    }
});
exports.default = router;
