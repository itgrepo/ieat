import { Router, Request, Response } from 'express';
import { AttributeMapper } from '../mappings/attribute-mapper';
import { AuditLogger } from '../audit-logs/audit-logger';
import { ProviderRepository } from '../repositories/provider.repository';

const router = Router();
const providerRepo = new ProviderRepository();

// Get all providers
router.get('/', async (req: Request, res: Response) => {
  try {
    const providers = await providerRepo.getAll();
    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// Test Mapping Logic
router.post('/test-mapping', (req: Request, res: Response) => {
  const { assertions, mapping } = req.body;
  
  if (!assertions || !mapping) {
    return res.status(400).json({ error: 'Missing assertions or mapping configuration' });
  }

  const result = AttributeMapper.map(assertions, mapping);
  
  AuditLogger.log('DIAGNOSTIC_MAPPING_TEST', { result });
  
  res.json({
    input: { assertions, mapping },
    output: result
  });
});

// Test Provider Configuration
router.post('/test-config', (req: Request, res: Response) => {
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

export default router;
