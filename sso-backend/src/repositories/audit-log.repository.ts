import fs from 'fs/promises';
import path from 'path';

export interface AuditLog {
  id: string;
  timestamp: string;
  event: string;
  userId?: string;
  details: any;
  ip?: string;
}

export class AuditLogRepository {
  private filePath: string;

  constructor() {
    this.filePath = path.join(__dirname, '../../data/audit_logs.json');
  }

  async getAll(): Promise<AuditLog[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async add(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const all = await this.getAll();
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      ...log
    };
    all.push(newLog);
    // Keep only last 1000 logs
    const trimmed = all.slice(-1000);
    await fs.writeFile(this.filePath, JSON.stringify(trimmed, null, 2));
  }
}
