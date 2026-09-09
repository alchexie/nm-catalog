import path from 'path';
import Database from 'better-sqlite3';
import { DB_PATH, info } from '@nm-catalog/core';

const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' });
const timestamp = now.replace(/[^0-9]/g, '').slice(2, 14);
const backupPath = path.join(path.dirname(DB_PATH), `data_${timestamp}.db`);
const db = new Database(DB_PATH);

db.exec(`VACUUM INTO '${backupPath}'`);
db.close();
info(`Database backed up to: ${backupPath}`);
