"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmisRepository = void 0;
const base_repository_1 = require("./base.repository");
class PmisRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('pmis_users.json');
    }
    async findByUsername(username) {
        const all = await this.getAll();
        // Convert DB id to string to satisfy base repository type requirements
        const mapped = all.map(user => ({
            ...user,
            id: String(user.id)
        }));
        return mapped.find(user => user.username === username);
    }
    async findByEmail(email) {
        const all = await this.getAll();
        const mapped = all.map(user => ({
            ...user,
            id: String(user.id)
        }));
        return mapped.find(user => user.email.toLowerCase() === email.toLowerCase());
    }
}
exports.PmisRepository = PmisRepository;
