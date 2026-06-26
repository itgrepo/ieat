"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dataset_repository_1 = require("../repositories/dataset.repository");
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
const allowedExts = ['.csv', '.xlsx', '.json', '.png', '.jpg', '.jpeg', '.pdf'];
const allowedMimes = [
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/json',
    'image/png',
    'image/jpeg',
    'application/pdf'
];
const upload = (0, multer_1.default)({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedExts.includes(ext) && allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type or extension'));
        }
    }
});
const getFilePath = (filename) => path_1.default.join(process.cwd(), 'data', filename);
const readJsonFile = async (filename, defaultVal = []) => {
    try {
        const file = getFilePath(filename);
        const data = await promises_1.default.readFile(file, 'utf-8');
        return JSON.parse(data);
    }
    catch (e) {
        return defaultVal;
    }
};
const writeJsonFile = async (filename, data) => {
    const file = getFilePath(filename);
    await promises_1.default.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
};
const cleanTableauUrl = (url) => {
    if (!url)
        return url;
    let cleaned = url.trim();
    // Pattern 1: IP Tableau ภายใน (192.168.9.157)
    const internalIpPattern = /^(https?:\/\/)?192\.168\.9\.157\/?/;
    // Pattern 2: Domain dsp.ieat.go.th ที่มี /tableau/ ติดมาด้วย
    const domainPattern = /^(https?:\/\/)?dsp\.ieat\.go\.th\/tableau\/?/;
    if (internalIpPattern.test(cleaned)) {
        cleaned = cleaned.replace(internalIpPattern, '');
        if (cleaned.startsWith('#/')) {
            cleaned = cleaned.substring(2);
        }
        if (cleaned.startsWith('/')) {
            cleaned = cleaned.substring(1);
        }
        return `/tableau/#/${cleaned}`;
    }
    else if (domainPattern.test(cleaned)) {
        cleaned = cleaned.replace(domainPattern, '');
        if (cleaned.startsWith('#/')) {
            cleaned = cleaned.substring(2);
        }
        if (cleaned.startsWith('/')) {
            cleaned = cleaned.substring(1);
        }
        return `/tableau/#/${cleaned}`;
    }
    return url;
};
const initJsonFiles = async () => {
    const rolesFile = getFilePath('roles.json');
    try {
        await promises_1.default.access(rolesFile);
    }
    catch {
        await writeJsonFile('roles.json', [
            { "previlage_id": "1", "previlage_name": "RootAdmin" },
            { "previlage_id": "2", "previlage_name": "Admin" },
            { "previlage_id": "3", "previlage_name": "User" }
        ]);
        await writeJsonFile('menu_permissions.json', [
            { "previlage_id": "1", "menu_name_id": "1", "menu_name": "Data Catalog", "value": "Yes" },
            { "previlage_id": "1", "menu_name_id": "2", "menu_name": "Analytics & Dashboard", "value": "Yes" },
            { "previlage_id": "1", "menu_name_id": "3", "menu_name": "Identity Providers", "value": "Yes" },
            { "previlage_id": "1", "menu_name_id": "4", "menu_name": "Audit Logs", "value": "Yes" },
            { "previlage_id": "2", "menu_name_id": "1", "menu_name": "Data Catalog", "value": "Yes" },
            { "previlage_id": "2", "menu_name_id": "2", "menu_name": "Analytics & Dashboard", "value": "Yes" },
            { "previlage_id": "2", "menu_name_id": "3", "menu_name": "Identity Providers", "value": "Yes" },
            { "previlage_id": "2", "menu_name_id": "4", "menu_name": "Audit Logs", "value": "Yes" },
            { "previlage_id": "3", "menu_name_id": "1", "menu_name": "Data Catalog", "value": "Yes" },
            { "previlage_id": "3", "menu_name_id": "2", "menu_name": "Analytics & Dashboard", "value": "No" },
            { "previlage_id": "3", "menu_name_id": "3", "menu_name": "Identity Providers", "value": "No" },
            { "previlage_id": "3", "menu_name_id": "4", "menu_name": "Audit Logs", "value": "No" }
        ]);
        await writeJsonFile('categories.json', [
            { "id": "1", "name": "เศรษฐกิจ" },
            { "id": "2", "name": "คมนาคม" },
            { "id": "3", "name": "การเงิน" },
            { "id": "4", "name": "สิ่งแวดล้อม" }
        ]);
        await writeJsonFile('groups.json', [
            { "group_id": "1", "group_name": "Administrators", "create_at": "2026-05-01T00:00:00.000Z" },
            { "group_id": "2", "group_name": "Data Providers", "create_at": "2026-05-02T00:00:00.000Z" },
            { "group_id": "3", "group_name": "Data Consumers", "create_at": "2026-05-03T00:00:00.000Z" }
        ]);
        await writeJsonFile('group_members.json', [
            { "group_id": "1", "user_id": "admin_001" },
            { "group_id": "2", "user_id": "pmis_dsp_user_001" },
            { "group_id": "3", "user_id": "8aef81ba-28f9-4a2d-9b9d-f7845ada439f" }
        ]);
        await writeJsonFile('group_datasets.json', [
            { "group_id": "1", "service_id": "1" },
            { "group_id": "1", "service_id": "2" },
            { "group_id": "2", "service_id": "3" }
        ]);
        await writeJsonFile('organizations.json', [
            { "id": "1", "name": "กระทรวงการพัฒนาสังคมและความมั่นคงของมนุษย์", "description": "ปลัดกระทรวงการพัฒนาสังคมและความมั่นคงของมนุษย์", "createdAt": "2026-04-28T03:23:34.000Z" },
            { "id": "2", "name": "ทดสอบแก้ไข", "description": "ทดสอบแก้ไข", "createdAt": "2026-04-28T03:23:34.000Z" },
            { "id": "3", "name": "Test", "description": "Test", "createdAt": "2026-04-28T03:23:34.000Z" },
            { "id": "4", "name": "ทดสอบTest", "description": "ทดสอบTest", "createdAt": "2026-04-28T03:23:34.000Z" },
            { "id": "5", "name": "องค์กรภายนอก", "description": "หน่วยงานเจ้าของข้อมูลจากองค์กรภายนอก", "createdAt": "2026-04-28T03:23:34.000Z" },
            { "id": "6", "name": "กรมกิจการเด็กและเยาวชน", "description": "หน่วยงานภายใต้กระทรวงการพัฒนาสังคมและความมั่นคงของมนุษย์", "createdAt": "2026-04-28T03:23:34.000Z" }
        ]);
    }
};
const initSubCategoriesFile = async () => {
    const subCategoriesFile = getFilePath('sub_categories.json');
    try {
        await promises_1.default.access(subCategoriesFile);
    }
    catch {
        await writeJsonFile('sub_categories.json', []);
    }
};
initJsonFiles().catch(console.error);
initSubCategoriesFile().catch(console.error);
// Decode base64 json user data if needed
const decodeUserData = (base64String) => {
    try {
        const withoutRandom = base64String.slice(0, -5);
        const reversed = withoutRandom.split('').reverse().join('');
        const jsonStr = decodeURIComponent(escape(atob(reversed)));
        return JSON.parse(jsonStr);
    }
    catch (e) {
        return null;
    }
};
const mapDatasetToApiResponse = (item) => ({
    service_id: item.id,
    dataset_id: item.datasetId || item.dataset_id || '-',
    service_name: item.name || item.service_name || 'Unnamed Dataset',
    organization: item.organization,
    category: item.category,
    sub_category: item.sub_category || 'ทั่วไป',
    description: item.description,
    service_description: item.description || item.service_description,
    accessibility: item.accessibility || 'Public',
    status: item.status || 'Active',
    access_type: item.access_type || item.accessibility || 'Public',
    api_enabled: item.apiEnabled === true || item.apiEnabled === 1 || item.apiEnabled === '1',
    data_format: item.dataFormat || item.data_format,
    permission_status: item.permission_status || null,
    has_access: (item.accessibility || 'Public') === 'Public' ? 1 : 0,
    contact_name: item.contact_name,
    contact_email: item.contact_email,
    tags: item.tags,
    purpose: item.purpose,
    dept_contact: item.dept_contact,
    update_freq_unit: item.update_freq_unit,
    update_freq_value: item.update_freq_value,
    geo_scope: item.geo_scope,
    data_source: item.data_source,
    gov_category: item.gov_category,
    license: item.license,
    access_conditions: item.access_conditions,
    sponsor: item.sponsor,
    smallest_unit: item.smallest_unit,
    url: item.url,
    languages: item.languages,
    objective_type: item.objective_type,
    external_dashboard_url: item.external_dashboard_url,
    external_api_url: item.external_api_url,
    dataset_type: item.dataset_type,
    file_path: item.file_path,
    api_type: item.api_type || 'public',
    api_endpoint: item.api_endpoint || '',
    api_db_name: item.api_db_name || '',
    api_source_type: item.api_source_type || 'table',
    api_source_name: item.api_source_name || '',
    api_request_fields: item.api_request_fields || [],
    api_response_fields: item.api_response_fields || []
});
const resolveSchemaAndTable = async (dbName, fullTableName) => {
    let schema = 'dbo';
    let tableName = fullTableName || '';
    if (!dbName || !fullTableName) {
        return { schema, tableName };
    }
    if (fullTableName.includes('.')) {
        const parts = fullTableName.split('.');
        schema = parts[0];
        tableName = parts.slice(1).join('.');
        return { schema, tableName };
    }
    try {
        const { queryWarehouse } = await import('../config/warehouseDb.js');
        const sql = (await import('mssql')).default;
        const cleanDbName = dbName.replace(/]/g, ']]');
        const query = `SELECT TOP 1 TABLE_SCHEMA FROM [${cleanDbName}].INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = @tableName`;
        const result = await queryWarehouse(query, [
            { name: 'tableName', type: sql.NVarChar, value: tableName }
        ]);
        if (result.recordset && result.recordset.length > 0) {
            schema = result.recordset[0].TABLE_SCHEMA;
        }
    }
    catch (err) {
        console.error('Error in resolveSchemaAndTable:', err);
    }
    return { schema, tableName };
};
router.get('/retrieveService', async (req, res) => {
    try {
        const datasets = await dataset_repository_1.datasetRepository.getAll();
        const activeDatasets = datasets.filter((d) => d.status !== 'Deleted');
        const mappedData = activeDatasets.map(mapDatasetToApiResponse);
        return res.json({ status: 'success', data: mappedData });
    }
    catch (error) {
        console.error('Error fetching datasets:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/getService', async (req, res) => {
    try {
        const datasets = await dataset_repository_1.datasetRepository.getAll();
        const activeDatasets = datasets.filter((d) => d.status !== 'Deleted');
        const mappedData = activeDatasets.map(mapDatasetToApiResponse);
        return res.json({ status: 'success', data: mappedData });
    }
    catch (error) {
        console.error('Error in getService:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/requestDatasetPermission', async (req, res) => {
    const { user, service_id, fields, reason } = req.body;
    if (!user || !service_id || !reason) {
        return res.status(400).json({ status: 'error', message: 'Missing parameters' });
    }
    return res.json({ status: 'success', message: 'Permission requested' });
});
router.post('/addService', upload.any(), async (req, res) => {
    try {
        const body = req.body;
        const files = req.files;
        let file_path = '';
        if (files && files.length > 0) {
            const file = files[0];
            const uploadsDir = path_1.default.join(process.cwd(), 'data', 'uploads');
            await promises_1.default.mkdir(uploadsDir, { recursive: true });
            const ext = path_1.default.extname(file.originalname).toLowerCase();
            const fileName = `${(0, uuid_1.v4)()}${ext}`;
            const absolutePath = path_1.default.resolve(path_1.default.join(uploadsDir, path_1.default.basename(fileName)));
            if (!absolutePath.startsWith(path_1.default.resolve(uploadsDir)))
                throw new Error('Path traversal detected');
            await promises_1.default.writeFile(absolutePath, file.buffer);
            file_path = `/data/uploads/${fileName}`;
        }
        const newId = (0, uuid_1.v4)();
        const newDataset = {
            id: newId,
            datasetId: body.dataset_id || `DS-${Date.now()}`,
            name: body.service_name || 'Unnamed Dataset',
            category: body.category || 'General',
            organization: body.organization || 'General',
            accessibility: body.accessibility || 'Public',
            description: body.description || '',
            status: body.status || 'Active',
            dataFormat: body.data_format || 'CSV',
            apiEnabled: body.api_enabled === 'true' || body.api_enabled === '1' || body.api_enabled === true,
            createdAt: new Date(),
            updatedAt: new Date(),
            // Extra fields
            sub_category: body.sub_category,
            contact_name: body.contact_name,
            contact_email: body.contact_email,
            tags: body.tags,
            purpose: body.purpose,
            dept_contact: body.dept_contact,
            update_freq_unit: body.update_freq_unit,
            update_freq_value: body.update_freq_value ? Number(body.update_freq_value) : undefined,
            geo_scope: body.geo_scope,
            data_source: body.data_source,
            gov_category: body.gov_category,
            license: body.license,
            access_conditions: body.access_conditions,
            sponsor: body.sponsor,
            smallest_unit: body.smallest_unit,
            url: body.url,
            languages: body.languages,
            objective_type: body.objective_type,
            external_dashboard_url: cleanTableauUrl(body.external_dashboard_url),
            external_api_url: body.external_api_url,
            dataset_type: body.dataset_type,
            file_path: file_path || body.file_path
        };
        await dataset_repository_1.datasetRepository.create(newDataset);
        return res.json({ status: 'success', message: 'Service added successfully' });
    }
    catch (error) {
        console.error('Error adding dataset:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.put('/addService', upload.any(), async (req, res) => {
    try {
        const body = req.body;
        const files = req.files;
        const id = body.service_id;
        if (!id) {
            return res.status(400).json({ status: 'error', message: 'Missing service_id' });
        }
        const existing = await dataset_repository_1.datasetRepository.getById(id);
        if (!existing) {
            return res.status(404).json({ status: 'error', message: 'Dataset not found' });
        }
        if (body.service_status === 'Deleted' || body.status === 'Deleted') {
            if (existing.file_path) {
                const fullPath = path_1.default.join(process.cwd(), existing.file_path.startsWith('/') ? existing.file_path.substring(1) : existing.file_path);
                try {
                    await promises_1.default.unlink(fullPath);
                }
                catch (e) { /* ignore if not found */ }
            }
            await dataset_repository_1.datasetRepository.delete(id);
            return res.json({ status: 'success', message: 'Dataset deleted successfully' });
        }
        let file_path = existing.file_path;
        if (files && files.length > 0) {
            const file = files[0];
            const uploadsDir = path_1.default.join(process.cwd(), 'data', 'uploads');
            await promises_1.default.mkdir(uploadsDir, { recursive: true });
            const ext = path_1.default.extname(file.originalname).toLowerCase();
            const fileName = `${(0, uuid_1.v4)()}${ext}`;
            const absolutePath = path_1.default.resolve(path_1.default.join(uploadsDir, path_1.default.basename(fileName)));
            if (!absolutePath.startsWith(path_1.default.resolve(uploadsDir)))
                throw new Error('Path traversal detected');
            if (existing.file_path) {
                const oldFullPath = path_1.default.join(process.cwd(), existing.file_path.startsWith('/') ? existing.file_path.substring(1) : existing.file_path);
                try {
                    await promises_1.default.unlink(oldFullPath);
                }
                catch (e) { /* ignore */ }
            }
            await promises_1.default.writeFile(absolutePath, file.buffer);
            file_path = `/data/uploads/${fileName}`;
        }
        const updates = {
            updatedAt: new Date(),
        };
        if (body.dataset_id)
            updates.datasetId = body.dataset_id;
        if (body.service_name)
            updates.name = body.service_name;
        if (body.category)
            updates.category = body.category;
        if (body.organization)
            updates.organization = body.organization;
        if (body.accessibility)
            updates.accessibility = body.accessibility;
        if (body.description)
            updates.description = body.description;
        if (body.status || body.service_status)
            updates.status = body.status || body.service_status;
        if (body.data_format)
            updates.dataFormat = body.data_format;
        if (body.api_enabled !== undefined)
            updates.apiEnabled = body.api_enabled === 'true' || body.api_enabled === '1' || body.api_enabled === true;
        // Optional fields
        if (body.sub_category !== undefined)
            updates.sub_category = body.sub_category;
        if (body.contact_name !== undefined)
            updates.contact_name = body.contact_name;
        if (body.contact_email !== undefined)
            updates.contact_email = body.contact_email;
        if (body.tags !== undefined)
            updates.tags = body.tags;
        if (body.purpose !== undefined)
            updates.purpose = body.purpose;
        if (body.dept_contact !== undefined)
            updates.dept_contact = body.dept_contact;
        if (body.update_freq_unit !== undefined)
            updates.update_freq_unit = body.update_freq_unit;
        if (body.update_freq_value !== undefined)
            updates.update_freq_value = body.update_freq_value ? Number(body.update_freq_value) : undefined;
        if (body.geo_scope !== undefined)
            updates.geo_scope = body.geo_scope;
        if (body.data_source !== undefined)
            updates.data_source = body.data_source;
        if (body.gov_category !== undefined)
            updates.gov_category = body.gov_category;
        if (body.license !== undefined)
            updates.license = body.license;
        if (body.access_conditions !== undefined)
            updates.access_conditions = body.access_conditions;
        if (body.sponsor !== undefined)
            updates.sponsor = body.sponsor;
        if (body.smallest_unit !== undefined)
            updates.smallest_unit = body.smallest_unit;
        if (body.url !== undefined)
            updates.url = body.url;
        if (body.languages !== undefined)
            updates.languages = body.languages;
        if (body.objective_type !== undefined)
            updates.objective_type = body.objective_type;
        if (body.external_dashboard_url !== undefined)
            updates.external_dashboard_url = cleanTableauUrl(body.external_dashboard_url);
        if (body.external_api_url !== undefined)
            updates.external_api_url = body.external_api_url;
        if (body.dataset_type !== undefined)
            updates.dataset_type = body.dataset_type;
        if (file_path)
            updates.file_path = file_path;
        await dataset_repository_1.datasetRepository.update(id, updates);
        return res.json({ status: 'success', message: 'Service updated successfully' });
    }
    catch (error) {
        console.error('Error updating dataset:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/saveApiConfig', async (req, res) => {
    const { service_id, api_enabled, api_type, api_endpoint, api_db_name, api_source_type, api_source_name, api_request_fields, api_response_fields, description } = req.body;
    if (!service_id) {
        return res.status(400).json({ status: 'error', message: 'Missing service_id' });
    }
    try {
        const allDatasets = await dataset_repository_1.datasetRepository.getAll();
        let targetDataset = allDatasets.find((d) => d.api_endpoint && d.api_endpoint === api_endpoint);
        if (targetDataset) {
            const updates = {
                apiEnabled: api_enabled === true || api_enabled === 1 || api_enabled === '1',
                api_type: api_type,
                api_endpoint: api_endpoint,
                api_db_name: api_db_name,
                api_source_type: api_source_type,
                api_source_name: api_source_name,
                api_request_fields: api_request_fields,
                api_response_fields: api_response_fields,
                updatedAt: new Date()
            };
            if (description !== undefined) {
                updates.description = description;
            }
            await dataset_repository_1.datasetRepository.update(targetDataset.id, updates);
            return res.json({ status: 'success', message: 'API config saved successfully' });
        }
        const baseDataset = allDatasets.find((d) => String(d.id) === String(service_id));
        if (!baseDataset) {
            return res.status(404).json({ status: 'error', message: 'Dataset not found' });
        }
        if (baseDataset.api_endpoint && baseDataset.api_endpoint !== api_endpoint) {
            // Clone dataset record
            const cleanEndpoint = api_endpoint.replace(/[^a-zA-Z0-9_-]/g, '');
            const newId = `${baseDataset.id}_${cleanEndpoint}`;
            const newDataset = {
                ...baseDataset,
                id: newId,
                apiEnabled: api_enabled === true || api_enabled === 1 || api_enabled === '1',
                api_type: api_type,
                api_endpoint: api_endpoint,
                api_db_name: api_db_name,
                api_source_type: api_source_type,
                api_source_name: api_source_name,
                api_request_fields: api_request_fields,
                api_response_fields: api_response_fields,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            if (description !== undefined) {
                newDataset.description = description;
            }
            await dataset_repository_1.datasetRepository.create(newDataset);
        }
        else {
            const updates = {
                apiEnabled: api_enabled === true || api_enabled === 1 || api_enabled === '1',
                api_type: api_type,
                api_endpoint: api_endpoint,
                api_db_name: api_db_name,
                api_source_type: api_source_type,
                api_source_name: api_source_name,
                api_request_fields: api_request_fields,
                api_response_fields: api_response_fields,
                updatedAt: new Date()
            };
            if (description !== undefined) {
                updates.description = description;
            }
            await dataset_repository_1.datasetRepository.update(baseDataset.id, updates);
        }
        return res.json({ status: 'success', message: 'API config saved successfully' });
    }
    catch (error) {
        console.error('Error saving API config:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/getAvailableDatabases', async (req, res) => {
    try {
        const { queryWarehouse } = await import('../config/warehouseDb.js');
        const result = await queryWarehouse('SELECT name FROM sys.databases WHERE database_id > 4');
        const dbs = result.recordset.map((row) => row.name);
        return res.json({ status: 'success', data: dbs });
    }
    catch (error) {
        console.error('Error fetching databases:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to fetch databases' });
    }
});
router.post('/getAvailableTables', async (req, res) => {
    const { db_name } = req.body;
    if (!db_name) {
        return res.status(400).json({ status: 'error', message: 'Database name is required' });
    }
    try {
        const { queryWarehouse } = await import('../config/warehouseDb.js');
        const cleanDbName = db_name.replace(/]/g, ']]');
        const query = `SELECT TABLE_SCHEMA as [schema], TABLE_NAME as name, TABLE_TYPE as type FROM [${cleanDbName}].INFORMATION_SCHEMA.TABLES`;
        const result = await queryWarehouse(query);
        const tables = result.recordset.map((row) => {
            const fullName = row.schema && row.schema !== 'dbo' ? `${row.schema}.${row.name}` : row.name;
            return {
                name: fullName,
                type: row.type === 'VIEW' ? 'view' : 'table'
            };
        });
        return res.json({ status: 'success', data: tables });
    }
    catch (error) {
        console.error('Error fetching tables:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to fetch tables' });
    }
});
router.post('/getTableColumns', async (req, res) => {
    const { db_name, table_name } = req.body;
    if (!db_name || !table_name) {
        return res.status(400).json({ status: 'error', message: 'Database and Table name are required' });
    }
    try {
        const { queryWarehouse } = await import('../config/warehouseDb.js');
        const sql = (await import('mssql')).default;
        const cleanDbName = db_name.replace(/]/g, ']]');
        let schemaName = '';
        let pureTableName = table_name;
        if (table_name.includes('.')) {
            const parts = table_name.split('.');
            schemaName = parts[0];
            pureTableName = parts.slice(1).join('.');
        }
        let query = `SELECT COLUMN_NAME as name, DATA_TYPE as type FROM [${cleanDbName}].INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @tableName`;
        const params = [{ name: 'tableName', type: sql.NVarChar, value: pureTableName }];
        if (schemaName) {
            query += ` AND TABLE_SCHEMA = @schemaName`;
            params.push({ name: 'schemaName', type: sql.NVarChar, value: schemaName });
        }
        const result = await queryWarehouse(query, params);
        const columns = result.recordset.map((row) => ({
            name: row.name,
            type: row.type
        }));
        return res.json({ status: 'success', data: columns });
    }
    catch (error) {
        console.error('Error fetching columns:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to fetch columns' });
    }
});
const user_repository_1 = require("../repositories/user.repository");
const api_credential_repository_1 = require("../repositories/api-credential.repository");
// Helper to format date as YYYY-MM-DD HH:mm:ss
const formatDateTime = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};
router.post('/getAvailableUsers', async (req, res) => {
    try {
        const userRepo = new user_repository_1.UserRepository();
        const users = await userRepo.getAll();
        const mappedUsers = users.map((u) => {
            const fullName = u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username;
            const parts = fullName.split(' ');
            const firstname = parts[0] || '';
            const lastname = parts.slice(1).join(' ') || '';
            return {
                user_id: u.id,
                username: u.username,
                firstname,
                lastname,
                fullName
            };
        });
        return res.json({ status: 'success', data: mappedUsers });
    }
    catch (err) {
        return res.json({ status: 'error', message: 'Failed to fetch users' });
    }
});
router.post('/getApiCredentials', async (req, res) => {
    try {
        const { service_id } = req.body;
        if (!service_id) {
            return res.status(400).json({ status: 'error', message: 'Missing service_id' });
        }
        const credentials = await api_credential_repository_1.apiCredentialRepository.getByServiceId(service_id);
        const userRepo = new user_repository_1.UserRepository();
        const users = await userRepo.getAll();
        const mappedCredentials = credentials.map(cred => {
            const user = users.find(u => u.id === cred.user_id);
            const username = user ? user.username : 'unknown';
            const fullName = user ? (user.fullName || user.username) : '';
            const parts = fullName.split(' ');
            const firstname = parts[0] || '';
            const lastname = parts.slice(1).join(' ') || '';
            return {
                credential_id: cred.id,
                api_key: cred.id,
                username,
                firstname,
                lastname,
                secret_key: cred.secret_key,
                status: cred.status,
                expires_at: cred.expires_at || null,
                created_at: cred.created_at,
                scope_json: cred.scope_json || {}
            };
        });
        return res.json({ status: 'success', data: mappedCredentials });
    }
    catch (err) {
        console.error('Error in getApiCredentials:', err);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/addApiCredential', async (req, res) => {
    try {
        const { service_id, target_user_id, secret_key, expires_at } = req.body;
        if (!service_id || !target_user_id || !secret_key) {
            return res.status(400).json({ status: 'error', message: 'Missing parameters' });
        }
        let formattedExpiresAt = null;
        if (expires_at) {
            formattedExpiresAt = expires_at.replace('T', ' ');
        }
        const newCred = {
            id: (0, uuid_1.v4)(),
            service_id,
            user_id: target_user_id,
            secret_key,
            status: 'active',
            expires_at: formattedExpiresAt,
            created_at: formatDateTime(new Date()),
            scope_json: {}
        };
        await api_credential_repository_1.apiCredentialRepository.create(newCred);
        return res.json({ status: 'success', message: 'API Key created successfully' });
    }
    catch (err) {
        console.error('Error in addApiCredential:', err);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/revokeApiCredential', async (req, res) => {
    try {
        const { credential_id } = req.body;
        if (!credential_id) {
            return res.status(400).json({ status: 'error', message: 'Missing credential_id' });
        }
        await api_credential_repository_1.apiCredentialRepository.update(credential_id, { status: 'revoked' });
        return res.json({ status: 'success', message: 'API Key revoked successfully' });
    }
    catch (err) {
        console.error('Error in revokeApiCredential:', err);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/resumeApiCredential', async (req, res) => {
    try {
        const { credential_id } = req.body;
        if (!credential_id) {
            return res.status(400).json({ status: 'error', message: 'Missing credential_id' });
        }
        await api_credential_repository_1.apiCredentialRepository.update(credential_id, { status: 'active' });
        return res.json({ status: 'success', message: 'API Key activated successfully' });
    }
    catch (err) {
        console.error('Error in resumeApiCredential:', err);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/deleteApiCredential', async (req, res) => {
    try {
        const { credential_id } = req.body;
        if (!credential_id) {
            return res.status(400).json({ status: 'error', message: 'Missing credential_id' });
        }
        await api_credential_repository_1.apiCredentialRepository.delete(credential_id);
        return res.json({ status: 'success', message: 'API Key deleted successfully' });
    }
    catch (err) {
        console.error('Error in deleteApiCredential:', err);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/extendApiCredential', async (req, res) => {
    try {
        const { credential_id, expires_at } = req.body;
        if (!credential_id) {
            return res.status(400).json({ status: 'error', message: 'Missing credential_id' });
        }
        let formattedExpiresAt = null;
        if (expires_at) {
            formattedExpiresAt = expires_at.replace('T', ' ');
        }
        await api_credential_repository_1.apiCredentialRepository.update(credential_id, { expires_at: formattedExpiresAt });
        return res.json({ status: 'success', message: 'API Key expiry updated successfully' });
    }
    catch (err) {
        console.error('Error in extendApiCredential:', err);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/updateApiScope', async (req, res) => {
    try {
        const { credential_id, scope_json } = req.body;
        if (!credential_id) {
            return res.status(400).json({ status: 'error', message: 'Missing credential_id' });
        }
        await api_credential_repository_1.apiCredentialRepository.update(credential_id, { scope_json });
        return res.json({ status: 'success', message: 'API Scope updated successfully' });
    }
    catch (err) {
        console.error('Error in updateApiScope:', err);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/getScopeCombinations', async (req, res) => {
    const { service_id, column1, value1, column2 } = req.body;
    if (!service_id || !column1 || !value1 || !column2) {
        return res.status(400).json({ status: 'error', message: 'Missing parameters' });
    }
    try {
        const dataset = await dataset_repository_1.datasetRepository.getById(String(service_id));
        if (!dataset) {
            return res.status(404).json({ status: 'error', message: 'Dataset not found' });
        }
        const dbName = dataset.api_db_name;
        const tableName = dataset.api_source_name;
        if (!dbName || !tableName) {
            return res.status(400).json({ status: 'error', message: 'API not fully configured with Database/Table' });
        }
        const { queryWarehouse } = await import('../config/warehouseDb.js');
        const sql = (await import('mssql')).default;
        const { schema, tableName: resolvedTableName } = await resolveSchemaAndTable(dbName, tableName);
        // Sanitize columns to prevent SQL injection
        const cleanCol1 = column1.replace(/[^a-zA-Z0-9_]/g, '');
        const cleanCol2 = column2.replace(/[^a-zA-Z0-9_]/g, '');
        const queryStr = `SELECT DISTINCT [${cleanCol1}] as val1, [${cleanCol2}] as val2 FROM [${dbName}].[${schema}].[${resolvedTableName}] WHERE [${cleanCol1}] = @val1`;
        const result = await queryWarehouse(queryStr, [
            { name: 'val1', type: sql.NVarChar, value: value1 }
        ]);
        return res.json({ status: 'success', data: result.recordset });
    }
    catch (err) {
        console.error('Error in getScopeCombinations:', err);
        return res.status(500).json({ status: 'error', message: 'Failed to fetch combinations' });
    }
});
// Group User Management (Database Persistent)
router.post('/getGroups', async (req, res) => {
    try {
        const groupsList = await readJsonFile('groups.json', []);
        const groupMembers = await readJsonFile('group_members.json', []);
        const groupDatasets = await readJsonFile('group_datasets.json', []);
        const data = groupsList.map((g) => {
            const members = groupMembers.filter((m) => String(m.group_id) === String(g.group_id));
            const datasets = groupDatasets.filter((d) => String(d.group_id) === String(g.group_id));
            return {
                group_id: g.group_id,
                group_name: g.group_name,
                create_at: g.create_at || new Date().toISOString(),
                member_count: members.length,
                dataset_count: datasets.length
            };
        });
        return res.json({ status: 'success', data });
    }
    catch (error) {
        console.error('Error in getGroups:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/addGroup', async (req, res) => {
    try {
        const { group_name } = req.body;
        if (!group_name) {
            return res.status(400).json({ status: 'error', message: 'Missing group_name' });
        }
        const groupsList = await readJsonFile('groups.json', []);
        const newId = String(groupsList.length > 0 ? Math.max(...groupsList.map((g) => Number(g.group_id))) + 1 : 1);
        const newGroup = {
            group_id: newId,
            group_name,
            create_at: new Date().toISOString()
        };
        groupsList.push(newGroup);
        await writeJsonFile('groups.json', groupsList);
        return res.json({ status: 'success', message: 'Group added successfully', group: newGroup });
    }
    catch (error) {
        console.error('Error in addGroup:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/getGroupMembers', async (req, res) => {
    try {
        const { group_id } = req.body;
        if (!group_id) {
            return res.status(400).json({ status: 'error', message: 'Missing group_id' });
        }
        const userRepo = new user_repository_1.UserRepository();
        const allUsers = await userRepo.getAll();
        const groupMembers = await readJsonFile('group_members.json', []);
        // Find assigned user IDs
        const assignedUserIds = groupMembers
            .filter((m) => String(m.group_id) === String(group_id))
            .map((m) => m.user_id);
        const mapUser = (u) => {
            const fullName = u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username;
            const parts = fullName.split(' ');
            const firstname = parts[0] || '';
            const lastname = parts.slice(1).join(' ') || '';
            return {
                user_id: u.id,
                username: u.username,
                firstname,
                lastname
            };
        };
        const assigned = allUsers.filter(u => assignedUserIds.includes(u.id)).map(mapUser);
        const available = allUsers.filter(u => !assignedUserIds.includes(u.id)).map(mapUser);
        return res.json({
            status: 'success',
            assigned,
            available
        });
    }
    catch (error) {
        console.error('Error in getGroupMembers:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/updateGroupMembers', async (req, res) => {
    try {
        const { group_id, user_ids } = req.body;
        if (!group_id || !Array.isArray(user_ids)) {
            return res.status(400).json({ status: 'error', message: 'Missing parameters' });
        }
        let groupMembers = await readJsonFile('group_members.json', []);
        // Remove existing members for this group
        groupMembers = groupMembers.filter((m) => String(m.group_id) !== String(group_id));
        // Add new ones
        user_ids.forEach((uid) => {
            groupMembers.push({
                group_id: String(group_id),
                user_id: uid
            });
        });
        await writeJsonFile('group_members.json', groupMembers);
        return res.json({ status: 'success', message: 'Group members updated successfully' });
    }
    catch (error) {
        console.error('Error in updateGroupMembers:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/deleteGroup', async (req, res) => {
    try {
        const { group_id } = req.body;
        if (!group_id) {
            return res.status(400).json({ status: 'error', message: 'Missing group_id' });
        }
        const groupsList = await readJsonFile('groups.json', []);
        const filteredGroups = groupsList.filter((g) => String(g.group_id) !== String(group_id));
        await writeJsonFile('groups.json', filteredGroups);
        // Clean up members and datasets
        const groupMembers = await readJsonFile('group_members.json', []);
        const filteredMembers = groupMembers.filter((m) => String(m.group_id) !== String(group_id));
        await writeJsonFile('group_members.json', filteredMembers);
        const groupDatasets = await readJsonFile('group_datasets.json', []);
        const filteredDatasets = groupDatasets.filter((d) => String(d.group_id) !== String(group_id));
        await writeJsonFile('group_datasets.json', filteredDatasets);
        return res.json({ status: 'success', message: 'Group deleted successfully' });
    }
    catch (error) {
        console.error('Error in deleteGroup:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/getUsers', async (req, res) => {
    try {
        const userRepo = new user_repository_1.UserRepository();
        const users = await userRepo.getAll();
        const mappedUsers = users.map((u) => ({
            id: u.id,
            username: u.username,
            email: u.email,
            role: u.role || 'user',
            groups: u.department || 'general',
            status: u.status || 'active'
        }));
        return res.json({ status: 'success', data: mappedUsers });
    }
    catch (err) {
        return res.json({ status: 'error', message: 'Failed to fetch users' });
    }
});
// Group Dataset Access
router.post('/getGroupDatasetAccess', async (req, res) => {
    try {
        const { group_id } = req.body;
        if (!group_id) {
            return res.status(400).json({ status: 'error', message: 'Missing group_id' });
        }
        const datasets = await dataset_repository_1.datasetRepository.getAll();
        const groupDatasets = await readJsonFile('group_datasets.json', []);
        const assignedServiceIds = groupDatasets
            .filter((d) => String(d.group_id) === String(group_id))
            .map((d) => String(d.service_id));
        const mapDataset = (d) => ({
            service_id: d.id,
            service_name: d.name || 'Unnamed Dataset',
            provider_name: d.organization || 'General'
        });
        const assigned = datasets.filter(d => assignedServiceIds.includes(String(d.id))).map(mapDataset);
        const available = datasets.filter(d => !assignedServiceIds.includes(String(d.id))).map(mapDataset);
        return res.json({
            status: 'success',
            assigned,
            available
        });
    }
    catch (error) {
        console.error('Error in getGroupDatasetAccess:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/updateGroupDatasetAccess', async (req, res) => {
    try {
        const { group_id, service_ids } = req.body;
        if (!group_id || !Array.isArray(service_ids)) {
            return res.status(400).json({ status: 'error', message: 'Missing parameters' });
        }
        let groupDatasets = await readJsonFile('group_datasets.json', []);
        // Remove existing dataset mappings for this group
        groupDatasets = groupDatasets.filter((d) => String(d.group_id) !== String(group_id));
        // Add new ones
        service_ids.forEach((sid) => {
            groupDatasets.push({
                group_id: String(group_id),
                service_id: String(sid)
            });
        });
        await writeJsonFile('group_datasets.json', groupDatasets);
        return res.json({ status: 'success', message: 'Group dataset access updated successfully' });
    }
    catch (error) {
        console.error('Error in updateGroupDatasetAccess:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
// Dataset Access Groups
router.post('/getDatasetAccessGroups', async (req, res) => {
    try {
        const { service_id } = req.body;
        if (!service_id) {
            return res.status(400).json({ status: 'error', message: 'Missing service_id' });
        }
        const groups = await readJsonFile('groups.json', []);
        const groupDatasets = await readJsonFile('group_datasets.json', []);
        const assignedGroupIds = groupDatasets
            .filter((d) => String(d.service_id) === String(service_id))
            .map((d) => String(d.group_id));
        const mapGroup = (g) => ({
            group_id: g.group_id,
            group_name: g.group_name || 'Unnamed Group'
        });
        const assigned = groups.filter((g) => assignedGroupIds.includes(String(g.group_id))).map(mapGroup);
        const available = groups.filter((g) => !assignedGroupIds.includes(String(g.group_id))).map(mapGroup);
        return res.json({
            status: 'success',
            assigned,
            available
        });
    }
    catch (error) {
        console.error('Error in getDatasetAccessGroups:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/updateDatasetAccessGroups', async (req, res) => {
    try {
        const { service_id, group_ids } = req.body;
        if (!service_id || !Array.isArray(group_ids)) {
            return res.status(400).json({ status: 'error', message: 'Missing parameters' });
        }
        let groupDatasets = await readJsonFile('group_datasets.json', []);
        // Remove existing group mappings for this service
        groupDatasets = groupDatasets.filter((d) => String(d.service_id) !== String(service_id));
        // Add new ones
        group_ids.forEach((gid) => {
            groupDatasets.push({
                group_id: String(gid),
                service_id: String(service_id)
            });
        });
        await writeJsonFile('group_datasets.json', groupDatasets);
        return res.json({ status: 'success', message: 'Dataset group access updated successfully' });
    }
    catch (error) {
        console.error('Error in updateDatasetAccessGroups:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
// Dataset Access Users
router.post('/getDatasetAccessUsers', async (req, res) => {
    try {
        const { service_id } = req.body;
        if (!service_id) {
            return res.status(400).json({ status: 'error', message: 'Missing service_id' });
        }
        const userRepo = new user_repository_1.UserRepository();
        const users = await userRepo.getAll();
        const userDatasets = await readJsonFile('user_datasets.json', []);
        const assignedUserIds = userDatasets
            .filter((d) => String(d.service_id) === String(service_id))
            .map((d) => String(d.user_id));
        const mapUser = (u) => {
            const parts = (u.fullName || u.username || '').split(' ');
            const firstname = parts[0] || u.username;
            const lastname = parts.slice(1).join(' ') || '';
            return {
                user_id: u.id,
                username: u.username,
                firstname,
                lastname
            };
        };
        const assigned = users.filter((u) => assignedUserIds.includes(String(u.id))).map(mapUser);
        const available = users.filter((u) => !assignedUserIds.includes(String(u.id))).map(mapUser);
        return res.json({
            status: 'success',
            assigned,
            available
        });
    }
    catch (error) {
        console.error('Error in getDatasetAccessUsers:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/updateDatasetAccessUsers', async (req, res) => {
    try {
        const { service_id, user_ids } = req.body;
        if (!service_id || !Array.isArray(user_ids)) {
            return res.status(400).json({ status: 'error', message: 'Missing parameters' });
        }
        let userDatasets = await readJsonFile('user_datasets.json', []);
        // Remove existing user mappings for this service
        userDatasets = userDatasets.filter((d) => String(d.service_id) !== String(service_id));
        // Add new ones
        user_ids.forEach((uid) => {
            userDatasets.push({
                user_id: String(uid),
                service_id: String(service_id)
            });
        });
        await writeJsonFile('user_datasets.json', userDatasets);
        return res.json({ status: 'success', message: 'Dataset user access updated successfully' });
    }
    catch (error) {
        console.error('Error in updateDatasetAccessUsers:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
// API Monitor
router.post('/getApiMonitorStats', async (req, res) => {
    try {
        const { start_date, end_date } = req.body;
        const logs = await readJsonFile('audit_logs.json', []);
        // Filter by dates if provided
        let filteredLogs = logs;
        if (start_date && end_date) {
            const start = new Date(start_date);
            const end = new Date(end_date + 'T23:59:59.999Z');
            filteredLogs = logs.filter((l) => {
                const d = new Date(l.timestamp);
                return d >= start && d <= end;
            });
        }
        const total_requests = filteredLogs.length;
        const failed_count = filteredLogs.filter((l) => l.event && (l.event.includes('FAILURE') || l.event.includes('FAILED'))).length;
        const success_count = total_requests - failed_count;
        // Count unique IPs
        const ips = new Set(filteredLogs.map((l) => l.ip || '127.0.0.1'));
        const unique_ips = ips.size || 1;
        // Calculate daily traffic trend
        const trendMap = new Map();
        filteredLogs.forEach((l) => {
            if (l.timestamp) {
                const dateStr = l.timestamp.split('T')[0];
                trendMap.set(dateStr, (trendMap.get(dateStr) || 0) + 1);
            }
        });
        const trend = Array.from(trendMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
        if (trend.length === 0) {
            const today = new Date();
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                trend.push({ date: dateStr, count: 0 });
            }
        }
        return res.json({
            status: 'success',
            summary: {
                total_requests,
                success_count,
                failed_count,
                unique_ips
            },
            trend
        });
    }
    catch (error) {
        console.error('Error in getApiMonitorStats:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/getApiMonitorLogs', async (req, res) => {
    try {
        const { start_date, end_date, limit, offset } = req.body;
        const logs = await readJsonFile('audit_logs.json', []);
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        let filteredLogs = logs;
        if (start_date && end_date) {
            const start = new Date(start_date);
            const end = new Date(end_date + 'T23:59:59.999Z');
            filteredLogs = logs.filter((l) => {
                const d = new Date(l.timestamp);
                return d >= start && d <= end;
            });
        }
        const mappedLogs = filteredLogs.map((l, idx) => {
            const isFailed = l.event && (l.event.includes('FAILURE') || l.event.includes('FAILED'));
            const statusPrefix = isFailed ? '[401] ' : '[200] ';
            const path = l.details?.endpoint || l.details?.path || '/api/v1/auth/validate';
            const cleanPath = path.split('?')[0];
            return {
                log_id: l.id || `log-${idx}`,
                create_at: formatDateTime(new Date(l.timestamp)),
                log_detail: `${statusPrefix}${l.event || 'API_CALL'}`,
                path: cleanPath,
                ip: l.ip || '127.0.0.1',
                country: l.details?.country || 'Thailand'
            };
        });
        const lim = Number(limit) || 50;
        const off = Number(offset) || 0;
        const paginated = mappedLogs.slice(off, off + lim);
        return res.json({
            status: 'success',
            data: paginated
        });
    }
    catch (error) {
        console.error('Error in getApiMonitorLogs:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
// Catalog Permissions
router.post('/getCatalog', async (req, res) => {
    try {
        const datasets = await dataset_repository_1.datasetRepository.getAll();
        const mappedData = datasets.map(mapDatasetToApiResponse);
        return res.json({ status: 'success', data: mappedData });
    }
    catch (error) {
        console.error('Error in getCatalog:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
// User & Role/Permission (/mgmt/*)
router.post('/mgmt/addUser', async (req, res) => {
    try {
        const userRepo = new user_repository_1.UserRepository();
        const allUsers = await userRepo.getAll();
        const rolesList = await readJsonFile('roles.json', []);
        const data = allUsers.map((u) => {
            const roleName = u.role || 'User';
            const roleObj = rolesList.find((r) => r.previlage_name.toLowerCase() === roleName.toLowerCase()) ||
                rolesList.find((r) => r.previlage_name === 'User');
            return {
                user_id: u.id,
                username: u.username,
                email: u.email,
                create_at: u.createdAt || new Date().toISOString(),
                previlage_id: roleObj ? roleObj.previlage_id : '3',
                previlage_name: roleObj ? roleObj.previlage_name : 'User'
            };
        });
        return res.json(data);
    }
    catch (error) {
        console.error('Error in mgmt/addUser:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/mgmt/createUser', async (req, res) => {
    try {
        const { username, email, password, status, roles, groups } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ status: 'error', message: 'Missing required fields: username, email, password' });
        }
        const userRepo = new user_repository_1.UserRepository();
        // Check for duplicate username
        const existing = await userRepo.findByUsername(username);
        if (existing) {
            return res.status(409).json({ status: 'error', message: `Username "${username}" already exists` });
        }
        // Check for duplicate email
        const existingEmail = await userRepo.findByEmail(email);
        if (existingEmail) {
            return res.status(409).json({ status: 'error', message: `Email "${email}" already exists` });
        }
        // Map first role to role string
        const roleName = (Array.isArray(roles) && roles.length > 0) ? roles[0] : 'User';
        const department = (Array.isArray(groups) && groups.length > 0) ? groups[0] : 'general';
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: (0, uuid_1.v4)(),
            username,
            email,
            password: hashedPassword,
            fullName: username,
            role: roleName,
            department,
            status: status || 'active',
            createdAt: new Date().toISOString()
        };
        await userRepo.create(newUser);
        return res.json({ status: 'success', message: `User "${username}" created successfully`, userId: newUser.id });
    }
    catch (error) {
        console.error('Error in mgmt/createUser:', error);
        if (error.code === 'MODULE_NOT_FOUND') {
            // bcryptjs not available, store plain password
            try {
                const { username, email, password, status, roles, groups } = req.body;
                const userRepo = new user_repository_1.UserRepository();
                const roleName = (Array.isArray(roles) && roles.length > 0) ? roles[0] : 'User';
                const department = (Array.isArray(groups) && groups.length > 0) ? groups[0] : 'general';
                const newUser = {
                    id: (0, uuid_1.v4)(),
                    username,
                    email,
                    password,
                    fullName: username,
                    role: roleName,
                    department,
                    status: status || 'active',
                    createdAt: new Date().toISOString()
                };
                await userRepo.create(newUser);
                return res.json({ status: 'success', message: `User "${username}" created successfully`, userId: newUser.id });
            }
            catch (innerError) {
                return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
            }
        }
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/mgmt/getRoles', async (req, res) => {
    try {
        const rolesList = await readJsonFile('roles.json', []);
        return res.json(rolesList);
    }
    catch (error) {
        console.error('Error in mgmt/getRoles:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/mgmt/getMenu', async (req, res) => {
    try {
        const menuPermissions = await readJsonFile('menu_permissions.json', []);
        return res.json({ status: 'success', data: menuPermissions });
    }
    catch (error) {
        console.error('Error in mgmt/getMenu:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/mgmt/savePermission', async (req, res) => {
    try {
        const { data } = req.body;
        if (!data || !data.previlage_id || !data.menu_name_id) {
            return res.status(400).json({ status: 'error', message: 'Missing permission payload' });
        }
        const menuPermissions = await readJsonFile('menu_permissions.json', []);
        const idx = menuPermissions.findIndex((p) => String(p.previlage_id) === String(data.previlage_id) &&
            String(p.menu_name_id) === String(data.menu_name_id));
        if (idx !== -1) {
            menuPermissions[idx].value = data.value;
            await writeJsonFile('menu_permissions.json', menuPermissions);
        }
        else {
            menuPermissions.push({
                previlage_id: String(data.previlage_id),
                menu_name_id: String(data.menu_name_id),
                menu_name: data.menu_name || 'Feature',
                value: data.value || 'No'
            });
            await writeJsonFile('menu_permissions.json', menuPermissions);
        }
        return res.send('success');
    }
    catch (error) {
        console.error('Error in mgmt/savePermission:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/mgmt/addRole', async (req, res) => {
    try {
        const { role_name } = req.body;
        if (!role_name) {
            return res.status(400).json({ status: 'error', message: 'Missing role_name' });
        }
        const rolesList = await readJsonFile('roles.json', []);
        const newId = String(rolesList.length > 0 ? Math.max(...rolesList.map((r) => Number(r.previlage_id))) + 1 : 1);
        const newRole = {
            previlage_id: newId,
            previlage_name: role_name
        };
        rolesList.push(newRole);
        await writeJsonFile('roles.json', rolesList);
        const menuPermissions = await readJsonFile('menu_permissions.json', []);
        const defaultMenus = [
            { id: '1', name: 'Data Catalog' },
            { id: '2', name: 'Analytics & Dashboard' },
            { id: '3', name: 'Identity Providers' },
            { id: '4', name: 'Audit Logs' }
        ];
        defaultMenus.forEach(m => {
            menuPermissions.push({
                previlage_id: newId,
                menu_name_id: m.id,
                menu_name: m.name,
                value: m.name === 'Data Catalog' ? 'Yes' : 'No'
            });
        });
        await writeJsonFile('menu_permissions.json', menuPermissions);
        return res.json({ status: 'success', message: 'Role created successfully', role: newRole });
    }
    catch (error) {
        console.error('Error in mgmt/addRole:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/mgmt/deleteRole', async (req, res) => {
    try {
        const { previlage_id } = req.body;
        if (!previlage_id) {
            return res.status(400).json({ status: 'error', message: 'Missing previlage_id' });
        }
        const rolesList = await readJsonFile('roles.json', []);
        const roleIdx = rolesList.findIndex((r) => String(r.previlage_id) === String(previlage_id));
        if (roleIdx === -1) {
            return res.status(404).json({ status: 'error', message: 'Role not found' });
        }
        const roleToDelete = rolesList[roleIdx];
        const systemRoleIds = ['1', '2', '3'];
        const systemRoleNames = ['rootadmin', 'admin', 'user'];
        if (systemRoleIds.includes(String(roleToDelete.previlage_id)) ||
            systemRoleNames.includes(roleToDelete.previlage_name.toLowerCase())) {
            return res.status(400).json({ status: 'error', message: 'Cannot delete system roles' });
        }
        // Update users holding this role to fallback to 'User'
        const userRepo = new user_repository_1.UserRepository();
        const allUsers = await userRepo.getAll();
        for (const u of allUsers) {
            if (u.role && u.role.toLowerCase() === roleToDelete.previlage_name.toLowerCase()) {
                await userRepo.update(u.id, { role: 'User' });
            }
        }
        // Remove from roles list
        rolesList.splice(roleIdx, 1);
        await writeJsonFile('roles.json', rolesList);
        // Remove corresponding menu permissions
        const menuPermissions = await readJsonFile('menu_permissions.json', []);
        const filteredPermissions = menuPermissions.filter((p) => String(p.previlage_id) !== String(previlage_id));
        await writeJsonFile('menu_permissions.json', filteredPermissions);
        return res.json({ status: 'success', message: 'Role deleted successfully' });
    }
    catch (error) {
        console.error('Error in mgmt/deleteRole:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/mgmt/updateUserById', async (req, res) => {
    try {
        const { target_user_id, previlage_id } = req.body;
        if (!target_user_id || !previlage_id) {
            return res.status(400).json({ status: 'error', message: 'Missing parameters' });
        }
        const rolesList = await readJsonFile('roles.json', []);
        const roleObj = rolesList.find((r) => String(r.previlage_id) === String(previlage_id));
        if (!roleObj) {
            return res.status(404).json({ status: 'error', message: 'Role not found' });
        }
        const userRepo = new user_repository_1.UserRepository();
        await userRepo.update(target_user_id, { role: roleObj.previlage_name });
        return res.json({ status: 'success', message: 'User role updated successfully' });
    }
    catch (error) {
        console.error('Error in mgmt/updateUserById:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/changePassword', async (req, res) => {
    try {
        const { currentPassword, password, user_id } = req.body;
        if (!password || !user_id) {
            return res.status(400).json({ status: 'error', message: 'Missing parameters' });
        }
        const decodedUserId = decodeUserData(user_id);
        if (!decodedUserId) {
            return res.status(400).json({ status: 'error', message: 'Invalid user token' });
        }
        const userRepo = new user_repository_1.UserRepository();
        const user = await userRepo.getById(decodedUserId);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        // Update password in local database
        await userRepo.update(decodedUserId, { password });
        const { AuditLogger } = await import('../audit-logs/audit-logger.js');
        AuditLogger.log('PASSWORD_CHANGED', { username: user.username, userId: decodedUserId });
        return res.json({ status: 'success', message: 'Password changed successfully' });
    }
    catch (error) {
        console.error('Error in changePassword:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/editProfileUser', async (req, res) => {
    try {
        const { user: encodedUser } = req.body;
        if (!encodedUser) {
            return res.status(400).json({ status: 'error', message: 'Missing user parameter' });
        }
        const decoded = decodeUserData(encodedUser);
        if (!decoded) {
            return res.status(400).json({ status: 'error', message: 'Invalid user payload' });
        }
        const userId = decoded.user_id || decoded.id;
        if (!userId) {
            return res.status(400).json({ status: 'error', message: 'Missing user ID' });
        }
        const userRepo = new user_repository_1.UserRepository();
        const existingUser = await userRepo.getById(userId);
        if (!existingUser) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        const fullName = `${decoded.firstname || ''} ${decoded.lastname || ''}`.trim();
        const updates = {
            fullName: fullName || existingUser.fullName,
            firstname: decoded.firstname,
            lastname: decoded.lastname,
            usage_objective: decoded.usage_objective,
            other_object: decoded.other_object
        };
        await userRepo.update(userId, updates);
        const updatedUser = await userRepo.getById(userId);
        return res.json({
            status: 'success',
            message: 'Profile updated successfully',
            data: [updatedUser]
        });
    }
    catch (error) {
        console.error('Error in editProfileUser:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/getUserApiKey', async (req, res) => {
    try {
        const { user: encodedUser, service_id } = req.body;
        let userId = '';
        if (encodedUser) {
            const decoded = decodeUserData(encodedUser);
            userId = decoded?.user_id || decoded?.id || '';
        }
        if (!userId) {
            return res.status(400).json({ status: 'error', message: 'Missing or invalid user identifier' });
        }
        // Read api_credentials.json to find if this user has any active API keys
        const credentials = await api_credential_repository_1.apiCredentialRepository.getAll();
        let userCred;
        if (service_id) {
            userCred = credentials.find((c) => String(c.user_id) === String(userId) && String(c.service_id) === String(service_id) && c.status === 'active');
        }
        if (!userCred) {
            userCred = credentials.find((c) => String(c.user_id) === String(userId) && c.status === 'active');
        }
        if (userCred) {
            return res.json({ status: 'success', apikey: userCred.id, secretkey: userCred.secret_key || '' });
        }
        // Fallback to userRepo config
        const userRepo = new user_repository_1.UserRepository();
        const user = await userRepo.getById(userId);
        if (user && user.apikey) {
            return res.json({ status: 'success', apikey: user.apikey, secretkey: user.secretkey || '' });
        }
        return res.json({ status: 'success', apikey: '', secretkey: '' });
    }
    catch (error) {
        console.error('Error in getUserApiKey:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/generateApiKey', async (req, res) => {
    try {
        const { user: encodedUser } = req.body;
        let userId = '';
        if (encodedUser) {
            const decoded = decodeUserData(encodedUser);
            userId = decoded?.user_id || decoded?.id || '';
        }
        if (!userId) {
            return res.status(400).json({ status: 'error', message: 'Missing or invalid user identifier' });
        }
        const newApiKey = (0, uuid_1.v4)();
        // Link this key to the first available service in credentials
        const datasets = await dataset_repository_1.datasetRepository.getAll();
        const firstDataset = datasets[0];
        const serviceId = firstDataset ? firstDataset.id : 'default-service';
        const newCred = {
            id: newApiKey,
            service_id: serviceId,
            user_id: userId,
            secret_key: (0, uuid_1.v4)().substring(0, 16),
            status: 'active',
            created_at: new Date().toISOString()
        };
        await api_credential_repository_1.apiCredentialRepository.create(newCred);
        const userRepo = new user_repository_1.UserRepository();
        await userRepo.update(userId, { apikey: newApiKey });
        const updatedUser = await userRepo.getById(userId);
        const userWithSecret = updatedUser ? { ...updatedUser, secretkey: newCred.secret_key } : null;
        return res.json({
            status: 'success',
            message: 'API Key generated successfully',
            data: [userWithSecret]
        });
    }
    catch (error) {
        console.error('Error in generateApiKey:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/mgmt/deleteUser', async (req, res) => {
    try {
        const { target_user_id } = req.body;
        if (!target_user_id) {
            return res.status(400).json({ status: 'error', message: 'Missing target_user_id' });
        }
        const userRepo = new user_repository_1.UserRepository();
        await userRepo.delete(target_user_id);
        return res.json({ status: 'success', message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Error in mgmt/deleteUser:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
// Organization Management
router.post('/getOrganizations', async (req, res) => {
    try {
        const orgs = await readJsonFile('organizations.json', []);
        const data = orgs.map((o) => ({
            org_id: o.id,
            org_name: o.name,
            org_description: o.description || ''
        }));
        return res.json({ status: 'success', data });
    }
    catch (error) {
        console.error('Error in getOrganizations:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/addOrganization', async (req, res) => {
    try {
        const { org_name, org_description } = req.body;
        if (!org_name) {
            return res.status(400).json({ status: 'error', message: 'Missing org_name' });
        }
        const orgs = await readJsonFile('organizations.json', []);
        const newId = String(orgs.length > 0 ? Math.max(...orgs.map((o) => Number(o.id))) + 1 : 1);
        const newOrg = {
            id: newId,
            name: org_name,
            description: org_description || '',
            createdAt: new Date().toISOString()
        };
        orgs.push(newOrg);
        await writeJsonFile('organizations.json', orgs);
        return res.json({ status: 'success', message: 'Organization added successfully' });
    }
    catch (error) {
        console.error('Error in addOrganization:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/updateOrganization', async (req, res) => {
    try {
        const { org_id, org_name, org_description } = req.body;
        if (!org_id || !org_name) {
            return res.status(400).json({ status: 'error', message: 'Missing parameters' });
        }
        const orgs = await readJsonFile('organizations.json', []);
        const idx = orgs.findIndex((o) => String(o.id) === String(org_id));
        if (idx !== -1) {
            orgs[idx].name = org_name;
            orgs[idx].description = org_description || '';
            await writeJsonFile('organizations.json', orgs);
            return res.json({ status: 'success', message: 'Organization updated successfully' });
        }
        return res.status(404).json({ status: 'error', message: 'Organization not found' });
    }
    catch (error) {
        console.error('Error in updateOrganization:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/deleteOrganization', async (req, res) => {
    try {
        const { org_id } = req.body;
        if (!org_id) {
            return res.status(400).json({ status: 'error', message: 'Missing org_id' });
        }
        const orgs = await readJsonFile('organizations.json', []);
        const filteredOrgs = orgs.filter((o) => String(o.id) !== String(org_id));
        await writeJsonFile('organizations.json', filteredOrgs);
        return res.json({ status: 'success', message: 'Organization deleted successfully' });
    }
    catch (error) {
        console.error('Error in deleteOrganization:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
// Category Management
router.post('/getCategories', async (req, res) => {
    try {
        const categoriesList = await readJsonFile('categories.json', []);
        return res.json({ status: 'success', data: categoriesList });
    }
    catch (error) {
        console.error('Error in getCategories:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/addCategory', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ status: 'error', message: 'Missing name' });
        }
        const categoriesList = await readJsonFile('categories.json', []);
        const newId = String(categoriesList.length > 0 ? Math.max(...categoriesList.map((c) => Number(c.id))) + 1 : 1);
        const newCategory = {
            id: newId,
            name
        };
        categoriesList.push(newCategory);
        await writeJsonFile('categories.json', categoriesList);
        return res.json({ status: 'success', message: 'Category added successfully' });
    }
    catch (error) {
        console.error('Error in addCategory:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/updateCategory', async (req, res) => {
    try {
        const { id, name } = req.body;
        if (!id || !name) {
            return res.status(400).json({ status: 'error', message: 'Missing parameters' });
        }
        const categoriesList = await readJsonFile('categories.json', []);
        const idx = categoriesList.findIndex((c) => String(c.id) === String(id));
        if (idx !== -1) {
            categoriesList[idx].name = name;
            await writeJsonFile('categories.json', categoriesList);
            return res.json({ status: 'success', message: 'Category updated successfully' });
        }
        return res.status(404).json({ status: 'error', message: 'Category not found' });
    }
    catch (error) {
        console.error('Error in updateCategory:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/deleteCategory', async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ status: 'error', message: 'Missing id' });
        }
        const categoriesList = await readJsonFile('categories.json', []);
        const filteredCategories = categoriesList.filter((c) => String(c.id) !== String(id));
        await writeJsonFile('categories.json', filteredCategories);
        return res.json({ status: 'success', message: 'Category deleted successfully' });
    }
    catch (error) {
        console.error('Error in deleteCategory:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
// Sub-Category Management
router.post('/getSubCategories', async (req, res) => {
    try {
        const subCategoriesList = await readJsonFile('sub_categories.json', []);
        const categoriesList = await readJsonFile('categories.json', []);
        const populated = subCategoriesList.map((s) => {
            const parent = categoriesList.find((c) => String(c.id) === String(s.category_id));
            return {
                ...s,
                category_name: parent ? parent.name : 'Unknown'
            };
        });
        return res.json({ status: 'success', data: populated });
    }
    catch (error) {
        console.error('Error in getSubCategories:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/addSubCategory', upload.single('icon'), async (req, res) => {
    try {
        const { category_id, name } = req.body;
        const file = req.file;
        if (!category_id || !name) {
            return res.status(400).json({ status: 'error', message: 'Missing parameters' });
        }
        let iconPath = '';
        if (file) {
            const uploadsDir = path_1.default.join(process.cwd(), 'uploads', 'sub_categories');
            await promises_1.default.mkdir(uploadsDir, { recursive: true });
            const ext = path_1.default.extname(file.originalname) || '.png';
            const fileName = `${(0, uuid_1.v4)()}${ext}`;
            const filePath = path_1.default.join(uploadsDir, fileName);
            await promises_1.default.writeFile(filePath, file.buffer);
            iconPath = `/uploads/sub_categories/${fileName}`;
        }
        const subCategoriesList = await readJsonFile('sub_categories.json', []);
        const newId = String(subCategoriesList.length > 0 ? Math.max(...subCategoriesList.map((s) => Number(s.id))) + 1 : 1);
        const newSub = {
            id: newId,
            category_id,
            name,
            icon: iconPath
        };
        subCategoriesList.push(newSub);
        await writeJsonFile('sub_categories.json', subCategoriesList);
        return res.json({ status: 'success', message: 'Sub-category added successfully' });
    }
    catch (error) {
        console.error('Error in addSubCategory:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/updateSubCategory', upload.single('icon'), async (req, res) => {
    try {
        const { id, category_id, name } = req.body;
        const file = req.file;
        if (!id || !category_id || !name) {
            return res.status(400).json({ status: 'error', message: 'Missing parameters' });
        }
        const subCategoriesList = await readJsonFile('sub_categories.json', []);
        const idx = subCategoriesList.findIndex((s) => String(s.id) === String(id));
        if (idx === -1) {
            return res.status(404).json({ status: 'error', message: 'Sub-category not found' });
        }
        const sub = subCategoriesList[idx];
        sub.category_id = category_id;
        sub.name = name;
        if (file) {
            // Delete old file
            if (sub.icon) {
                const oldPath = path_1.default.join(process.cwd(), sub.icon.substring(1));
                try {
                    await promises_1.default.unlink(oldPath);
                }
                catch (e) {
                    console.warn('Could not delete old icon file:', oldPath, e);
                }
            }
            const uploadsDir = path_1.default.join(process.cwd(), 'uploads', 'sub_categories');
            await promises_1.default.mkdir(uploadsDir, { recursive: true });
            const ext = path_1.default.extname(file.originalname) || '.png';
            const fileName = `${(0, uuid_1.v4)()}${ext}`;
            const filePath = path_1.default.join(uploadsDir, fileName);
            await promises_1.default.writeFile(filePath, file.buffer);
            sub.icon = `/uploads/sub_categories/${fileName}`;
        }
        await writeJsonFile('sub_categories.json', subCategoriesList);
        return res.json({ status: 'success', message: 'Sub-category updated successfully' });
    }
    catch (error) {
        console.error('Error in updateSubCategory:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
router.post('/deleteSubCategory', async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ status: 'error', message: 'Missing id' });
        }
        const subCategoriesList = await readJsonFile('sub_categories.json', []);
        const sub = subCategoriesList.find((s) => String(s.id) === String(id));
        if (sub) {
            // Delete file
            if (sub.icon) {
                const oldPath = path_1.default.join(process.cwd(), sub.icon.substring(1));
                try {
                    await promises_1.default.unlink(oldPath);
                }
                catch (e) {
                    console.warn('Could not delete icon file during subcategory deletion:', oldPath, e);
                }
            }
            const filteredList = subCategoriesList.filter((s) => String(s.id) !== String(id));
            await writeJsonFile('sub_categories.json', filteredList);
            return res.json({ status: 'success', message: 'Sub-category deleted successfully' });
        }
        return res.status(404).json({ status: 'error', message: 'Sub-category not found' });
    }
    catch (error) {
        console.error('Error in deleteSubCategory:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
// ===== FILE API: Read from uploaded Excel/CSV files =====
router.get('/v1/file/:datasetId', async (req, res) => {
    const datasetId = req.params.datasetId;
    const apiKey = req.headers.apikey || req.headers['apikey'] || req.headers['api_key'] || req.headers['api-key'];
    if (!apiKey) {
        return res.status(401).json({ status: 'error', message: 'Missing apikey in headers' });
    }
    try {
        // 1. Find Dataset
        const datasets = await dataset_repository_1.datasetRepository.getAll();
        const dataset = datasets.find((d) => d.datasetId === datasetId || d.id === datasetId);
        if (!dataset) {
            return res.status(404).json({ status: 'error', message: 'Dataset not found' });
        }
        // 2. Validate API key exists in credentials
        const credentials = await api_credential_repository_1.apiCredentialRepository.getByServiceId(dataset.id);
        const validCred = credentials.find((c) => c.id === apiKey && c.status === 'active');
        if (!validCred) {
            return res.status(401).json({ status: 'error', message: 'Invalid or inactive API key' });
        }
        // 3. Check if file exists
        const filePath = dataset.file_path;
        if (!filePath) {
            return res.status(404).json({ status: 'error', message: 'No file uploaded for this dataset' });
        }
        // 4. Read and parse file
        const fullPath = path_1.default.join(process.cwd(), filePath.startsWith('/') ? filePath.substring(1) : filePath);
        try {
            await promises_1.default.access(fullPath);
        }
        catch {
            return res.status(404).json({ status: 'error', message: 'File not found on server' });
        }
        const ext = path_1.default.extname(fullPath).toLowerCase();
        let rows = [];
        if (ext === '.csv') {
            const content = await promises_1.default.readFile(fullPath, 'utf-8');
            const lines = content.split('\n').filter(l => l.trim());
            if (lines.length > 0) {
                const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                    const row = {};
                    headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
                    rows.push({ id: (0, uuid_1.v4)(), key: (0, uuid_1.v4)(), value: row });
                }
            }
        }
        else if (ext === '.xlsx' || ext === '.xls') {
            // For Excel files, try to use xlsx library if available, else return error
            try {
                const XLSX = require('xlsx');
                const workbook = XLSX.readFile(fullPath);
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);
                rows = jsonData.map((row) => ({ id: (0, uuid_1.v4)(), key: (0, uuid_1.v4)(), value: row }));
            }
            catch (xlsxErr) {
                return res.status(500).json({ status: 'error', message: 'Excel parsing not available. Please upload CSV format.' });
            }
        }
        else {
            return res.status(400).json({ status: 'error', message: `Unsupported file format: ${ext}` });
        }
        return res.json({
            total_rows: rows.length,
            offset: 0,
            source: 'file',
            file_name: path_1.default.basename(fullPath),
            rows: rows
        });
    }
    catch (error) {
        console.error(`File API Error for ${datasetId}:`, error);
        return res.status(500).json({ status: 'error', message: 'Internal server error while reading file' });
    }
});
router.get('/v1/:apiName', async (req, res) => {
    const apiName = req.params.apiName;
    const apiKey = req.headers.apikey || req.headers['apikey'] || req.headers['api_key'] || req.headers['api-key'];
    const secretKey = req.headers.secretkey || req.headers['secretkey'] || req.headers['secret_key'] || req.headers['secret-key'];
    if (!apiKey || !secretKey) {
        return res.status(401).json({ status: 'error', message: 'Missing apikey or secret key in headers' });
    }
    try {
        // 1. Find API Service
        const datasets = await dataset_repository_1.datasetRepository.getAll();
        const apiConfig = datasets.find((d) => d.datasetId === apiName || d.api_endpoint === apiName);
        if (!apiConfig) {
            return res.status(404).json({ status: 'error', message: 'API Service not found' });
        }
        if (!apiConfig.apiEnabled) {
            return res.status(403).json({ status: 'error', message: 'API Service is inactive' });
        }
        // 2. Validate Credentials
        const credentials = await api_credential_repository_1.apiCredentialRepository.getByServiceId(apiConfig.id);
        const validCred = credentials.find(c => c.id === apiKey && c.secret_key === secretKey && c.status === 'active');
        if (!validCred) {
            return res.status(401).json({ status: 'error', message: 'Invalid or inactive API credentials' });
        }
        // 3. Build SQL Query
        const { queryWarehouse } = await import('../config/warehouseDb.js');
        const sql = (await import('mssql')).default;
        const reqFields = apiConfig.api_request_fields ?
            (Array.isArray(apiConfig.api_request_fields)
                ? apiConfig.api_request_fields
                : typeof apiConfig.api_request_fields === 'string'
                    ? apiConfig.api_request_fields.split(',').map((f) => f.trim())
                    : [])
            : [];
        const resFields = apiConfig.api_response_fields ?
            (Array.isArray(apiConfig.api_response_fields)
                ? apiConfig.api_response_fields
                : typeof apiConfig.api_response_fields === 'string'
                    ? apiConfig.api_response_fields.split(',').map((f) => f.trim())
                    : [])
            : [];
        const allFields = Array.from(new Set([...reqFields, ...resFields]));
        const selectStr = allFields.length > 0 ? allFields.map(f => `[${f}]`).join(', ') : '*';
        const tableName = apiConfig.api_source_name;
        const dbName = apiConfig.api_db_name;
        const { schema, tableName: resolvedTableName } = await resolveSchemaAndTable(dbName, tableName);
        let queryStr = `SELECT ${selectStr} FROM [${dbName}].[${schema}].[${resolvedTableName}] WHERE 1=1`;
        const queryParams = [];
        // 4. Apply Scopes if API type is 'scope'
        if (apiConfig.api_type === 'scope') {
            const scopes = validCred.scope_json || {};
            let paramCount = 0;
            const standardScopes = [];
            const compositeScopes = [];
            for (const [key, val] of Object.entries(scopes)) {
                if (key === 'composite' && Array.isArray(val)) {
                    compositeScopes.push(...val);
                }
                else {
                    standardScopes.push([key, val]);
                }
            }
            // Apply standard scopes (field IN (values...))
            for (const [field, val] of standardScopes) {
                if (val && val !== '*') {
                    const values = Array.isArray(val) ? val : [val];
                    if (values.length > 0) {
                        const placeholders = values.map((v) => {
                            const pName = `p${paramCount++}`;
                            queryParams.push({ name: pName, type: sql.NVarChar, value: v });
                            return `@${pName}`;
                        });
                        queryStr += ` AND [${field}] IN (${placeholders.join(', ')})`;
                    }
                }
            }
            // Apply composite scopes: e.g. AND ((col1 = val1 AND col2 = val2) OR (col1 = val1 AND col2 = val3))
            if (compositeScopes.length > 0) {
                const orClauses = compositeScopes.map((c) => {
                    const pName1 = `p${paramCount++}`;
                    const pName2 = `p${paramCount++}`;
                    queryParams.push({ name: pName1, type: sql.NVarChar, value: c.val1 });
                    queryParams.push({ name: pName2, type: sql.NVarChar, value: c.val2 });
                    return `([${c.col1}] = @${pName1} AND [${c.col2}] = @${pName2})`;
                });
                queryStr += ` AND (${orClauses.join(' OR ')})`;
            }
        }
        let rows = [];
        // Check if it's a mock API call for testing (like POP-001)
        if (apiName === 'POP-001' || !dbName) {
            console.log('Returning mock data for POP-001');
            rows = [
                { id: (0, uuid_1.v4)(), key: (0, uuid_1.v4)(), value: { VesselName: "Oceanic Explorer", ArrivalDate: "2026-06-10", Status: "Completed" } },
                { id: (0, uuid_1.v4)(), key: (0, uuid_1.v4)(), value: { VesselName: "Sea Princess", ArrivalDate: "2026-06-11", Status: "Completed" } },
                { id: (0, uuid_1.v4)(), key: (0, uuid_1.v4)(), value: { VesselName: "Global Freight", ArrivalDate: "2026-06-15", Status: "In Port" } }
            ];
        }
        else {
            // 5. Execute Query
            const result = await queryWarehouse(queryStr, queryParams);
            // 6. Format Response
            rows = result.recordset.map((row) => ({
                id: (0, uuid_1.v4)(),
                key: (0, uuid_1.v4)(),
                value: row
            }));
        }
        return res.json({
            total_rows: rows.length,
            offset: 0,
            rows: rows
        });
    }
    catch (error) {
        console.error(`API Gateway Error for ${apiName}:`, error);
        return res.status(500).json({ status: 'error', message: 'Internal server error while fetching data' });
    }
});
exports.default = router;
