import express, { type Request, type Response } from 'express';
import { stmt } from '../db/statements.js';
import { toError } from '../utils/tools.js';

const router = express.Router();

router.get('/lang', (_req: Request, res: Response) => {
  try {
    const rows = stmt.lang.select().all();
    res.json(rows);
  } catch (error) {
    const err = toError(error);
    res.status(500).json({ error: err.message });
  }
});

router.get('/hardware', (_req: Request, res: Response) => {
  try {
    const rows = stmt.hardware.select().all();
    res.json(rows);
  } catch (error) {
    const err = toError(error);
    res.status(500).json({ error: err.message });
  }
});

export default router;
