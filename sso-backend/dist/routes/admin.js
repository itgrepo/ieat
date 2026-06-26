"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attribute_mapper_1 = require("../mappings/attribute-mapper");
const audit_logger_1 = require("../audit-logs/audit-logger");
const provider_repository_1 = require("../repositories/provider.repository");
const router = (0, express_1.Router)();
const providerRepo = new provider_repository_1.ProviderRepository();
// Get all providers
router.get('/', async (req, res) => {
    try {
        const providers = await providerRepo.getAll();
        res.json(providers);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch providers' });
    }
});
// Test Mapping Logic
router.post('/test-mapping', (req, res) => {
    const { assertions, mapping } = req.body;
    if (!assertions || !mapping) {
        return res.status(400).json({ error: 'Missing assertions or mapping configuration' });
    }
    const result = attribute_mapper_1.AttributeMapper.map(assertions, mapping);
    audit_logger_1.AuditLogger.log('DIAGNOSTIC_MAPPING_TEST', { result });
    res.json({
        input: { assertions, mapping },
        output: result
    });
});
// Test Provider Configuration
router.post('/test-config', (req, res) => {
    const { config } = req.body;
    // Basic validation of config structure
    const requiredFields = ['entityId', 'ssoUrl', 'acsUrl', 'x509Certificate'];
    const missing = requiredFields.filter(f => !config[f]);
    if (missing.length > 0) {
        return res.status(400).json({
            status: 'error',
            message: `Missing required fields: ${missing.join(', ')}`
        });
    }
    res.json({
        status: 'ok',
        message: 'Configuration structure is valid'
    });
});
exports.default = router;
