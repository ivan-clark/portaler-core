"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getColor = (type) => {
    if (type.includes('PLAYERCITY')) {
        return 'city';
    }
    if (type.includes('TUNNEL')) {
        if (type.includes('HIDEOUT')) {
            return 'road-ho';
        }
        return 'road';
    }
    if (type.includes('BLACK')) {
        return 'black';
    }
    if (type.includes('RED')) {
        return 'red';
    }
    if (type.includes('YELLOW')) {
        return 'yellow';
    }
    if (type === 'SAFEAREA') {
        return 'blue';
    }
    return 'home';
};
exports.default = getColor;
