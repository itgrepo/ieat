import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig: sql.config = {
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

let pool: sql.ConnectionPool | null = null;

export const getWarehousePool = async (): Promise<sql.ConnectionPool> => {
  try {
    if (pool) {
      return pool;
    }
    pool = await sql.connect(dbConfig);
    console.log('Connected to MS.SQL Data Warehouse successfully.');
    return pool;
  } catch (error) {
    console.error('Data Warehouse Connection Error:', error);
    pool = null;
    throw error;
  }
};

export const queryWarehouse = async (queryString: string, params: { name: string; type: any; value: any }[] = []) => {
  try {
    const cp = await getWarehousePool();
    const request = cp.request();
    
    // Add parameters if any
    for (const param of params) {
      request.input(param.name, param.type, param.value);
    }
    
    const result = await request.query(queryString);
    return result;
  } catch (error) {
    console.error('Data Warehouse Query Error:', error);
    throw error;
  }
};
