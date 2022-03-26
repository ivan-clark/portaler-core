"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const logger_1 = __importDefault(require("./logger"));
const db_1 = __importStar(require("./db"));
const getNewFile_1 = __importDefault(require("./getNewFile"));
const worldProcess_1 = __importDefault(require("./worldProcess"));
const timer = 3600 * 12 * 1000; // 12hrs
const fileGetter = async () => {
    const fileData = await getNewFile_1.default();
    if (!fileData) {
        return;
    }
    const inserts = await worldProcess_1.default(fileData);
    inserts.forEach(async (stmt) => {
        await db_1.db.dbQuery(stmt);
    });
    // TODO move this to data-model
    const zoneRes = await db_1.db.dbQuery(`
  SELECT *
  FROM zones
  ORDER BY zone_name;
  `, []);
    const zoneList = zoneRes.rows.map((z) => ({
        id: z.id,
        albionId: z.albion_id,
        name: z.zone_name,
        tier: z.tier,
        color: z.color,
        type: z.zone_type,
        isDeep: z.is_deep_road,
    }));
    await db_1.redis.setZones(zoneList);
};
(async () => {
    await db_1.default();
    fileGetter();
    setInterval(fileGetter, timer);
    logger_1.default.info('ETL started');
})();
