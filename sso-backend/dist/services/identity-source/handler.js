"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentitySourceHandler = void 0;
const attribute_mapper_1 = require("../../mappings/attribute-mapper");
class IdentitySourceHandler {
    async parseMetadata(input) {
        return { error: 'Metadata parsing not supported for this protocol' };
    }
    async parseDiscovery(url) {
        return { error: 'Discovery fetch not supported for this protocol' };
    }
    testMapping(assertions, mapping) {
        return attribute_mapper_1.AttributeMapper.map(assertions, mapping);
    }
}
exports.IdentitySourceHandler = IdentitySourceHandler;
