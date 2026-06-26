"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogRepository = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class AuditLogRepository {
    constructor() {
        this.filePath = path_1.default.join(__dirname, '../../data/audit_logs.json');
    }
    async getAll() {
        try {
            const data = await promises_1.default.readFile(this.filePath, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            return [];
        }
    }
    async add(log) {
        const all = await this.getAll();
        const newLog = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            ...log
        };
        all.push(newLog);
        // Keep only last 1000 logs
        const trimmed = all.slice(-1000);
        await promises_1.default.writeFile(this.filePath, JSON.stringify(trimmed, null, 2));
    }
}
exports.AuditLogRepository = AuditLogRepository;
