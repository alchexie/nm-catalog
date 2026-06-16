import express, { type Request, type Response } from 'express';
import { stmt, toError, upstreem } from '@nm-catalog/core';

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

router.get('/image/:assetId', async (req: Request, res: Response) => {
  const assetId = req.params.assetId;
  const buffer = await upstreem.getImage(<string>assetId);

  res.header('Content-Type', 'image/webp');
  res.header('Cache-Control', 'private, no-transform, max-age=1695605');
  return res.send(buffer);
});

export default router;
