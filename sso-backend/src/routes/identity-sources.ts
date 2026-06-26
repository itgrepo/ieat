import { Router, Request, Response } from 'express';
import { IdentitySourceService } from '../services/identity-source/identity-source.service';
import { AuditLogger } from '../audit-logs/audit-logger';

const router = Router();
const service = new IdentitySourceService();

router.get('/', async (req: Request, res: Response) => {
  try {
    const sources = await service.getAll();
    res.json(sources);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch identity sources' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const source = await service.getById(id);
    if (!source) return res.status(404).json({ error: 'Not found' });
    res.json(source);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.body.sourceName || !req.body.protocolType) {
      return res.status(400).json({ error: 'Missing required fields: sourceName and protocolType are mandated.' });
    }
    await service.create(req.body);
    AuditLogger.log('IDP_CREATED', { name: req.body.sourceName, type: req.body.protocolType });
    res.status(201).json({ message: 'Created successfully' });
  } catch (error) {
    console.error('[Route] IDP Create Error:', error);
    res.status(500).json({ 
      error: 'Failed to create identity source', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await service.update(id, req.body);
    AuditLogger.log('IDP_UPDATED', { id, updates: req.body });
    res.json({ message: 'Updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

router.post('/parse-metadata', async (req: Request, res: Response) => {
  try {
    const { protocol, url, xml } = req.body;
    const result = await service.fetchAndParseMetadata(protocol, { url, xml });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Metadata parsing failed' });
  }
});

router.get('/:id/sp-summary', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await service.getSPSummary(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get SP summary' });
  }
});

router.get('/:id/sp-metadata', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const xml = await service.getSPMetadata(id);
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get SP metadata' });
  }
});

router.post('/:id/test-config', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await service.testConnection(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Test failed' });
  }
});

router.post('/:id/test-mapping', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { assertions } = req.body;
    const result = await service.testMapping(id, assertions);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Mapping test failed' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const repo = (service as any).repo; // Access repo through service
    await repo.delete(id);
    AuditLogger.log('IDP_DELETED', { id });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

export default router;
