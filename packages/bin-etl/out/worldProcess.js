"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const md5_1 = __importDefault(require("md5"));
const db_1 = require("./db");
const getColor_1 = __importDefault(require("./getColor"));
const getMarker_1 = __importDefault(require("./getMarker"));
const getTier_1 = __importDefault(require("./getTier"));
const fixStr = (str) => str.replace(/'/gi, "''");
const resourceMapProcess = (zId, isCity, resource) => {
    if (isCity || !resource) {
        return null;
    }
    if (Array.isArray(resource)) {
        return resource
            .map((r) => Number(r.tier) === 1
            ? null
            : `((SELECT id FROM zones WHERE albion_id = '${zId}'), '${fixStr(r.name)}', '${getTier_1.default(r.tier)}', ${r.count})`)
            .filter(Boolean);
    }
    return Number(resource.tier) === 1
        ? null
        : [
            `((SELECT id FROM zones WHERE albion_id = '${zId}'), '${fixStr(resource.name)}', '${getTier_1.default(resource.tier)}', ${resource.count})`,
        ];
};
const miniMapMarkerProcess = (zId, isCity, marker) => {
    if (isCity || !marker) {
        return null;
    }
    if (Array.isArray(marker)) {
        return marker.map((m) => `((SELECT id FROM zones WHERE albion_id = '${zId}'), '${fixStr(getMarker_1.default(m.type))}', ${m.pos.split(' ')[0]}, ${m.pos.split(' ')[1]})`);
    }
    return [
        `((SELECT id FROM zones WHERE albion_id = '${zId}'), '${fixStr(getMarker_1.default(marker.type))}', ${marker.pos.split(' ')[0]}, ${marker.pos.split(' ')[1]})`,
    ];
};
const mobCountProcess = (zId, isCity, mob) => {
    if (isCity || !mob || (!Array.isArray(mob) && mob.name.trim() === '')) {
        return null;
    }
    if (Array.isArray(mob)) {
        return mob
            .map((m) => {
            const nameArr = m.name.split('_');
            const name = fixStr(nameArr.splice(2).join(' '));
            const tier = getTier_1.default(nameArr[0]);
            return m.name.trim() === '' || tier === 'I' || tier === '?'
                ? null
                : `((SELECT id FROM zones WHERE albion_id = '${zId}'), '${name}', '${tier}', ${m.count})`;
        })
            .filter(Boolean);
    }
    const nameArr = mob.name.split('_');
    const name = nameArr.splice(2).join(' ');
    const tier = getTier_1.default(nameArr[0]);
    return mob.name.trim() === '' || tier === 'I' || tier === '?'
        ? null
        : [
            `((SELECT id FROM zones WHERE albion_id = '${zId}'), '${name}', '${tier}', ${mob.count})`,
        ];
};
const worldProcess = async (worldFile) => {
    // trim file by type
    const trimmedType = worldFile.filter((z) => (z.type.startsWith('TUNNEL') ||
        z.type.startsWith('OPENPVP') ||
        z.type.startsWith('SAFEAREA') ||
        z.type.startsWith('PLAYERCITY') ||
        z.type.startsWith('PASSAGE')) &&
        !z.displayname.toLowerCase().includes('debug') &&
        !z.type.includes('DUNGEON_') &&
        !z.type.includes('EXPEDITION_') &&
        !z.type.includes('ARENA_') &&
        !z.type.includes('_NOFURNITURE') &&
        !z.id.includes('RoadPve') &&
        !z.id.includes('ChampionsRealmLive') &&
        z.type !== 'PASSAGE_SAFEAREA');
    const zones = await db_1.db.dbQuery(`
    SELECT albion_id, zone_name, tier, zone_type, color, is_deep_road
    FROM zones;
  `);
    const zoneHashes = new Map();
    zones.rows.forEach((r) => {
        const hashStr = `${r.albion_id}${r.zone_name}${r.tier}${r.zone_type}${r.color}${r.is_deep_road}`.toUpperCase();
        zoneHashes.set(r.albion_id, [hashStr, md5_1.default(hashStr)]);
    });
    const zoneExits = {};
    const valueArr = trimmedType.map((z) => {
        var _a, _b, _c;
        const tier = getTier_1.default(z.file);
        const color = getColor_1.default(z.type);
        if ((_a = z.exits) === null || _a === void 0 ? void 0 : _a.exit) {
            if (Array.isArray(z.exits.exit)) {
                zoneExits[z.id] = {
                    out: z.exits.exit.map((e) => e.id.slice(0, 36)),
                    in: z.exits.exit.map((e) => ({
                        id: e.targetid.slice(0, 36),
                        type: e.targettype,
                    })),
                };
            }
            else {
                zoneExits[z.id] = {
                    out: [z.exits.exit.id.slice(0, 36)],
                    in: [
                        {
                            id: z.exits.exit.targetid.slice(0, 36),
                            type: z.exits.exit.targettype,
                        },
                    ],
                };
            }
        }
        // TODO query all zones and see if anything has changed or if it exists
        const retObj = {
            insertResources: resourceMapProcess(z.id, color === 'city', z.distribution.resource),
            insertMarkers: miniMapMarkerProcess(z.id, color === 'city', (_b = z.minimapmarkers) === null || _b === void 0 ? void 0 : _b.marker),
            insertMobs: mobCountProcess(z.id, color === 'city', (_c = z.mobcounts) === null || _c === void 0 ? void 0 : _c.mob),
        };
        const isDeep = (color.includes('road') && z.type.includes('DEEP'))
            .toString()
            .toUpperCase();
        const oldHash = zoneHashes.get(z.id);
        if (!oldHash) {
            retObj.insertZone = `('${z.id}', '${fixStr(z.displayname)}', '${tier}','${fixStr(z.type)}', '${color}', ${isDeep})`;
        }
        else {
            const hashStr = `${z.id}${z.displayname}${tier}${z.type}${color}${isDeep}`.toUpperCase();
            const newHash = md5_1.default(hashStr);
            if (oldHash[1] !== newHash) {
                retObj.updateZone = `UPDATE zones SET zone_name = '${fixStr(z.displayname)}', tier = '${tier}', zone_type = '${fixStr(z.type)}', color = '${color}', is_deep_road = ${isDeep}
        WHERE albion_id = '${z.id}';`;
            }
        }
        return retObj;
    });
    const insertValues = valueArr
        .map((v) => v.insertZone)
        .filter(Boolean)
        .join(',\n');
    const insertZoneStatement = !insertValues.length
        ? 'SELECT NOW();'
        : `
  INSERT INTO zones (albion_id, zone_name, tier, zone_type, color, is_deep_road) VALUES
  ${insertValues}
  ON CONFLICT DO NOTHING;
  `;
    const updateZoneStatement = valueArr
        .map((v) => v.updateZone)
        .filter(Boolean)
        .join('\n');
    // we don't need to check for changes, we just need to reload everything
    const flatResources = valueArr
        .map((v) => { var _a; return (_a = v.insertResources) === null || _a === void 0 ? void 0 : _a.filter(Boolean).flat(); })
        .filter(Boolean)
        .flat();
    const insertZoneResources = `
  TRUNCATE TABLE zone_resources;
  INSERT INTO zone_resources (zone_id, resource_type, resource_tier, resource_count) VALUES
  ${flatResources.join(',\n')};
  `;
    // we don't need to check for changes, we just need to reload everything
    const flatMarkers = valueArr
        .map((v) => { var _a; return (_a = v.insertMarkers) === null || _a === void 0 ? void 0 : _a.filter(Boolean).flat(); })
        .filter(Boolean)
        .flat();
    const insertZoneMarkers = `
  TRUNCATE TABLE zone_markers;
  INSERT INTO zone_markers (zone_id, marker_type, posX, posY) VALUES
  ${flatMarkers.join(',\n')};
  `;
    // we don't need to check for changes, we just need to reload everything
    const flatMobs = valueArr
        .map((v) => { var _a; return (_a = v.insertMobs) === null || _a === void 0 ? void 0 : _a.filter(Boolean).flat(); })
        .filter(Boolean)
        .flat();
    const insertZoneMobs = `
  TRUNCATE TABLE zone_mobs;
  INSERT INTO zone_mobs (zone_id, mob_name, mob_tier, mob_count) VALUES
  ${flatMobs.join(',\n')};
  `;
    // Create Connections
    const connections = [];
    for (const [key, value] of Object.entries(zoneExits)) {
        value.in.forEach((inVal) => {
            for (const [k, v] of Object.entries(zoneExits)) {
                if (v.out.includes(inVal.id)) {
                    connections.push([key, k, inVal.type]);
                    break;
                }
            }
        });
    }
    const insertConnections = `
  TRUNCATE TABLE royal_connections;
  INSERT INTO royal_connections (zone_one, zone_two, conn_type) VALUES
  ${connections
        .map((c) => `((SELECT id FROM zones WHERE albion_id = '${c[0]}'), (SELECT id FROM zones WHERE albion_id = '${c[1]}'), '${c[2]}')`)
        .join(',\n')}
    ON CONFLICT DO NOTHING;
  `;
    return [
        insertZoneStatement,
        updateZoneStatement,
        insertZoneResources,
        insertZoneMarkers,
        insertZoneMobs,
        insertConnections,
    ];
};
exports.default = worldProcess;
