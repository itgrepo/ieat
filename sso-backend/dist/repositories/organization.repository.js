"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationRepository = exports.OrganizationRepository = void 0;
const base_repository_1 = require("./base.repository");
class OrganizationRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('organizations.json');
    }
}
exports.OrganizationRepository = OrganizationRepository;
exports.organizationRepository = new OrganizationRepository();
