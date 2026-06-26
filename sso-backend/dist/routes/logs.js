"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_log_repository_1 = require("../repositories/audit-log.repository");
const router = (0, express_1.Router)();
const logRepo = new audit_log_repository_1.AuditLogRepository();
router.get('/', async (req, res) => {
    try {
        const logs = await logRepo.getAll();
        res.json(logs.reverse()); // Latest first
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});
exports.default = router;
