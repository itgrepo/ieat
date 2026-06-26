import { AuditLogRepository } from '../repositories/audit-log.repository';

const logRepo = new AuditLogRepository();

export class AuditLogger {
  static async log(event: string, details: any, userId?: string, ip?: string) {
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
    } catch (error) {
      console.error('Failed to persist audit log:', error);
    }
  }

  static authAttempt(provider: string, userId: string, ip?: string) {
    this.log('AUTH_ATTEMPT', { provider }, userId, ip);
  }

  static authSuccess(provider: string, userId: string, details: any, ip?: string) {
    this.log('AUTH_SUCCESS', { provider, ...details }, userId, ip);
  }

  static authFailure(provider: string, reason: string, details: any, ip?: string) {
    this.log('AUTH_FAILURE', { reason, ...details }, undefined, ip);
  }
}
