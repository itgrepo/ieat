import { Router, Request, Response } from 'express';
import { AuditLogRepository } from '../repositories/audit-log.repository';

const router = Router();
const logRepo = new AuditLogRepository();

router.get('/', async (req: Request, res: Response) => {
  try {
    const logs = await logRepo.getAll();
    res.json(logs.reverse()); // Latest first
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

export default router;
