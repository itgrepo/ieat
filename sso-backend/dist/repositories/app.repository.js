"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppRepository = void 0;
const base_repository_1 = require("./base.repository");
class AppRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('applications.json');
    }
}
exports.AppRepository = AppRepository;
