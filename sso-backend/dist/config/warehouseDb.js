"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryWarehouse = exports.getWarehousePool = void 0;
const mssql_1 = __importDefault(require("mssql"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConfig = {
    user: 'sa',
    password: 'ie@Td13!',
    server: '192.168.10.208',
    database: 'master', // Default DB to connect to
    options: {
        encrypt: false, // For local/internal network without SSL
        trustServerCertificate: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};
let pool = null;
const getWarehousePool = async () => {
    try {
        if (pool) {
            return pool;
        }
        pool = await mssql_1.default.connect(dbConfig);
        console.log('Connected to MS.SQL Data Warehouse successfully.');
        return pool;
    }
    catch (error) {
        console.error('Data Warehouse Connection Error:', error);
        pool = null;
        throw error;
    }
};
exports.getWarehousePool = getWarehousePool;
const queryWarehouse = async (queryString, params = []) => {
    try {
        const cp = await (0, exports.getWarehousePool)();
        const request = cp.request();
        // Add parameters if any
        for (const param of params) {
            request.input(param.name, param.type, param.value);
        }
        const result = await request.query(queryString);
        return result;
    }
    catch (error) {
        console.error('Data Warehouse Query Error:', error);
        throw error;
    }
};
exports.queryWarehouse = queryWarehouse;
