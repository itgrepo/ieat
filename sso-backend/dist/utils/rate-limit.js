"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetLoginAttempts = exports.recordFailedLogin = exports.checkRateLimit = void 0;
// TODO: In production, use Redis for rate limiting across multiple instances
const loginAttempts = new Map();
const checkRateLimit = (ip, username) => {
    const normUser = username.trim().toLowerCase();
    const key = `${ip}:${normUser}`;
    const record = loginAttempts.get(key);
    if (record && record.lockUntil > Date.now()) {
        return false;
    }
    if (record && record.lockUntil <= Date.now()) {
        loginAttempts.delete(key);
    }
    return true;
};
exports.checkRateLimit = checkRateLimit;
const recordFailedLogin = (ip, username) => {
    const normUser = username.trim().toLowerCase();
    const key = `${ip}:${normUser}`;
    const record = loginAttempts.get(key) || { count: 0, lockUntil: 0 };
    record.count += 1;
    if (record.count >= 5) {
        record.lockUntil = Date.now() + 15 * 60 * 1000; // 15 mins
    }
    loginAttempts.set(key, record);
};
exports.recordFailedLogin = recordFailedLogin;
const resetLoginAttempts = (ip, username) => {
    const normUser = username.trim().toLowerCase();
    loginAttempts.delete(`${ip}:${normUser}`);
};
exports.resetLoginAttempts = resetLoginAttempts;
