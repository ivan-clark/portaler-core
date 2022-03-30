"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const portal_1 = __importDefault(require("./portal"));
const router = express_1.Router();
router.use('/portal', portal_1.default);
exports.default = router;
