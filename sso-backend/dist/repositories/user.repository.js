"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const base_repository_1 = require("./base.repository");
class UserRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('users.json');
    }
    async findByEmail(email) {
        const all = await this.getAll();
        return all.find(user => user.email.toLowerCase() === email.toLowerCase());
    }
    async findByUsername(username) {
        const all = await this.getAll();
        return all.find(user => user.username === username);
    }
}
exports.UserRepository = UserRepository;
