"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogger = void 0;
const audit_log_repository_1 = require("../repositories/audit-log.repository");
const logRepo = new audit_log_repository_1.AuditLogRepository();
class AuditLogger {
    static async log(event, details, userId, ip) {
        const logEntry = {
            event,
            details,
            userId,
            ip
        };
        // Console for development
        console.log(`[AUDIT] ${JSON.stringify({ timestamp: new Date().toISOString(), ...logEntry })}`);
        // Persist to repository
        try {
            await logRepo.add(logEntry);
        }
        catch (error) {
            console.error('Failed to persist audit log:', error);
        }
    }
    static authAttempt(provider, userId, ip) {
        this.log('AUTH_ATTEMPT', { provider }, userId, ip);
    }
    static authSuccess(provider, userId, details, ip) {
        this.log('AUTH_SUCCESS', { provider, ...details }, userId, ip);
    }
    static authFailure(provider, reason, details, ip) {
        this.log('AUTH_FAILURE', { reason, ...details }, undefined, ip);
    }
}
exports.AuditLogger = AuditLogger;
