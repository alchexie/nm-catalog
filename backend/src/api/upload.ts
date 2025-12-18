import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import { importData } from '../utils/excel.js';
import { toError } from '../utils/tools.js';

const router = Router();
const upload = multer({ dest: './files/' });

router.post('/', upload.array('files'), (req: Request, res: Response) => {
  const [files, desc, fullUpdate] = [
    req.files as Express.Multer.File[],
    req.body.desc === 'true',
    req.body.fullUpdate === 'true',
  ];
  if (!files || files.length === 0) return res.status(400).send('No files uploaded');

  try {
    const result = importData(
      files.map((file) => ({
        path: file.path,
        filename: file.originalname,
      })),
      { descend: desc, fullUpdate: fullUpdate }
    );
    res.json(result);
  } catch (error) {
    const err = toError(error);
    res.status(500).json({ error: err.message });
  } finally {
    files.forEach((file) => {
      fs.unlinkSync(file.path);
    });
  }
});

export default router;
