"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderRepository = void 0;
const base_repository_1 = require("./base.repository");
class ProviderRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('identity_sources.json');
    }
}
exports.ProviderRepository = ProviderRepository;
