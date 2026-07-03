import fs from 'fs';
import path from 'path';
import { DB_PATH, info } from '@nm-catalog/core';

const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' });
const timestamp = now.replace(/[^0-9]/g, '').slice(2, 14);
const backupPath = path.join(path.dirname(DB_PATH), `data_${timestamp}.db`);

fs.copyFileSync(DB_PATH, backupPath);
info(`Database backed up to: ${backupPath}`);
