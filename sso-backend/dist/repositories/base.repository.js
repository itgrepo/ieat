"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
class BaseRepository {
    constructor(fileName) {
        this.filePath = path_1.default.join(process.cwd(), 'data', fileName);
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
    async getById(id) {
        const all = await this.getAll();
        return all.find(item => item.id === id);
    }
    async create(item) {
        try {
            const dir = path_1.default.dirname(this.filePath);
            if (!(0, fs_1.existsSync)(dir)) {
                await promises_1.default.mkdir(dir, { recursive: true });
            }
            const all = await this.getAll();
            all.push(item);
            await promises_1.default.writeFile(this.filePath, JSON.stringify(all, null, 2));
        }
        catch (error) {
            console.error(`[BaseRepository] Create failed for ${this.filePath}:`, error);
            throw error;
        }
    }
    async update(id, updates) {
        const all = await this.getAll();
        const index = all.findIndex(item => item.id === id);
        if (index !== -1) {
            all[index] = { ...all[index], ...updates };
            await promises_1.default.writeFile(this.filePath, JSON.stringify(all, null, 2));
        }
    }
    async delete(id) {
        const all = await this.getAll();
        const filtered = all.filter(item => item.id !== id);
        await promises_1.default.writeFile(this.filePath, JSON.stringify(filtered, null, 2));
    }
}
exports.BaseRepository = BaseRepository;
