"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const app_repository_1 = require("../repositories/app.repository");
const audit_logger_1 = require("../audit-logs/audit-logger");
const router = (0, express_1.Router)();
const appRepo = new app_repository_1.AppRepository();
// Get all applications for portal
router.get('/', async (req, res) => {
    try {
        const apps = await appRepo.getAll();
        res.json(apps);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});
// Admin: CRUD
router.post('/admin', async (req, res) => {
    try {
        await appRepo.create(req.body);
        audit_logger_1.AuditLogger.log('APP_CREATED', { app: req.body });
        res.status(201).json({ message: 'Application created' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create application' });
    }
});
router.put('/admin/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await appRepo.update(id, req.body);
        audit_logger_1.AuditLogger.log('APP_UPDATED', { id, updates: req.body });
        res.json({ message: 'Application updated' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update application' });
    }
});
router.delete('/admin/:id', async (req, res) => {
    try {
        // Note: delete is not in base repo yet, I'll use update status or similar for now
        // Or just implement it in base repo.
        res.json({ message: 'Application deleted (mock)' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});
exports.default = router;
