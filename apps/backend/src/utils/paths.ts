import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const ROOT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../'
);
export const FILES_DIR = path.join(ROOT_DIR, 'files');
export const RES_DIR = path.join(FILES_DIR, 'response');

export const DB_PATH = path.join(FILES_DIR, 'data.db');
export const COMMON_PATHS = {
  'new_game.json': path.join(FILES_DIR, 'new_game.json'),
  'updated_playlist.json': path.join(FILES_DIR, 'updated_playlist.json'),
  'error_img.json': path.join(FILES_DIR, 'error_img.json'),
  'res_playlist_section.json': path.join(RES_DIR, 'playlist_section.json'),
  'res_game_platform.json': path.join(RES_DIR, 'game_platform.json'),
  'res_game_year.json': path.join(RES_DIR, 'game_year.json'),
};

if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR, { recursive: true });
}
if (!fs.existsSync(RES_DIR)) {
  fs.mkdirSync(RES_DIR, { recursive: true });
}
