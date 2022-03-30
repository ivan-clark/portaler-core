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
const clearPortalInterval_1 = __importDefault(require("./utils/clearPortalInterval"));
const db_1 = __importStar(require("./utils/db"));
const migrations_1 = __importDefault(require("./utils/migrations"));
const populateServers_1 = __importDefault(require("./utils/populateServers"));
const initServer = async () => {
    await db_1.default();
    await migrations_1.default();
    await populateServers_1.default();
    const zones = await db_1.redis.getZones();
    if (!zones || zones.length < 100) {
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
    }
    clearPortalInterval_1.default();
    return true;
};
exports.default = initServer;
