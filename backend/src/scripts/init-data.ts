/*
  Initialized data from xlsx files
  
  -- desc    # games in reverse order
  -- full    # full update
*/

import fs from 'fs';
import path from 'path';
import { closeDb } from '../db/index.js';
import { FILES_DIR } from '../utils/paths.js';
import { importData } from '../utils/excel.js';

const args = process.argv.slice(2);
const isDesc = args.includes('desc');
const isFullUpdate = args.includes('full');

const folderPath = path.join(FILES_DIR, 'xlsx');
const files = fs
  .readdirSync(folderPath)
  .filter((filename) => filename.endsWith('.xlsx'))
  .map((filename) => ({
    path: path.join(folderPath, filename),
    filename: filename,
  }));

try {
  importData(files, { descend: isDesc, fullUpdate: isFullUpdate });
} catch (error) {
  console.error(error);
} finally {
  closeDb();
}
