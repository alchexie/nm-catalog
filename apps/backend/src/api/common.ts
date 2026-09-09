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
  try {
    const assetId = req.params.assetId;
    const buffer = await upstreem.getImage(<string>assetId);
    if (!buffer) {
      return res.status(404).json({ error: 'Image not found.' });
    }
    res.header('Content-Type', 'image/webp');
    res.header('Cache-Control', 'private, no-transform, max-age=1695605');
    return res.send(buffer);
  } catch (error) {
    const err = toError(error);
    res.status(500).json({ error: err.message });
  }
});

export default router;
