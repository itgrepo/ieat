"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityMappingRepository = void 0;
const base_repository_1 = require("./base.repository");
class IdentityMappingRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('identity_mappings.json');
    }
    async findByExternalId(providerId, externalId) {
        const all = await this.getAll();
        return all.find(m => m.providerId === providerId && m.externalId === externalId);
    }
}
exports.IdentityMappingRepository = IdentityMappingRepository;
