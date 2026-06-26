"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiCredentialRepository = exports.ApiCredentialRepository = void 0;
const base_repository_1 = require("./base.repository");
class ApiCredentialRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('api_credentials.json');
    }
    async getByServiceId(serviceId) {
        const all = await this.getAll();
        return all.filter(item => item.service_id === serviceId);
    }
}
exports.ApiCredentialRepository = ApiCredentialRepository;
exports.apiCredentialRepository = new ApiCredentialRepository();
