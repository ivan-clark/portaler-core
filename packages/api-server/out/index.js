"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const body_parser_1 = __importDefault(require("body-parser"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const api_1 = __importDefault(require("./api"));
const admin_1 = __importDefault(require("./api/admin"));
const auth_1 = __importDefault(require("./api/auth"));
const config_1 = __importDefault(require("./api/config"));
const zone_1 = __importDefault(require("./api/zone"));
const initServer_1 = __importDefault(require("./initServer"));
const checkAdmin_1 = __importDefault(require("./middleware/checkAdmin"));
const syntaxError_1 = __importDefault(require("./middleware/syntaxError"));
const validator_1 = __importDefault(require("./middleware/validator"));
const verifyUser_1 = __importDefault(require("./middleware/verifyUser"));
const config_2 = __importDefault(require("./utils/config"));
const logger_1 = __importDefault(require("./utils/logger"));
const app = express_1.default();
(async () => {
    await initServer_1.default();
    // app.enable('etag')
    app.use(cors_1.default(config_2.default.cors));
    app.use(body_parser_1.default.json());
    app.use(cookie_parser_1.default());
    app.use(compression_1.default());
    app.use(validator_1.default);
    app.use(syntaxError_1.default);
    // Un-authed routes
    app.use('/api/auth', auth_1.default);
    app.get('/api/health', (_, res) => res.status(200).send({ server: 'ok' }));
    app.get('/api/bot', (_, res) => res.redirect(config_2.default.discord.botUrl));
    app.use('/api/config', config_1.default);
    app.use('/api/zone', zone_1.default);
    // Authed routes
    app.use('/api/admin', checkAdmin_1.default, admin_1.default);
    app.use('/api', verifyUser_1.default, api_1.default);
    app.listen(config_2.default.port, () => logger_1.default.info(`Started: ${config_2.default.port}`));
})();
