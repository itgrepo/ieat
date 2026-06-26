"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.datasetRepository = exports.DatasetRepository = void 0;
const base_repository_1 = require("./base.repository");
class DatasetRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('datasets.json');
    }
    async getByDatasetId(datasetId) {
        const all = await this.getAll();
        return all.find(item => item.datasetId === datasetId);
    }
}
exports.DatasetRepository = DatasetRepository;
exports.datasetRepository = new DatasetRepository();
