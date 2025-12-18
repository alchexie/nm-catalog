import { LangCodeValue } from '@nm-catalog/shared';
import { DBTableConfig } from './index.js';

const tbTrack: DBTableConfig = {
  create: () => `
    CREATE TABLE IF NOT EXISTS track (
      id TEXT PRIMARY KEY,
      gid TEXT,
      idx INTEGER,
      duration TEXT,
      isloop INTEGER,
      isbest INTEGER,
      title_de_DE TEXT,
      title_en_US TEXT,
      title_es_ES TEXT,
      title_fr_FR TEXT,
      title_it_IT TEXT,
      title_ja_JP TEXT,
      title_ko_KR TEXT,
      title_zh_CN TEXT,
      title_zh_TW TEXT,
      img_de_DE TEXT,
      img_en_US TEXT,
      img_es_ES TEXT,
      img_fr_FR TEXT,
      img_it_IT TEXT,
      img_ja_JP TEXT,
      img_ko_KR TEXT,
      img_zh_CN TEXT,
      img_zh_TW TEXT
    );
  `,
  selectByIds: (ids: string[] = []) =>
    `SELECT * FROM track WHERE id in (${ids.map((id) => `'${id}'`).join(',')})`,
  selectByGid: () => `SELECT * FROM track WHERE gid = ? ORDER BY idx`,
  insert: (lang: LangCodeValue) => {
    const sLang = lang.replace('-', '_');
    return `
      INSERT INTO track (
        id, gid, idx, duration, isloop, isbest, title_${sLang}, img_${sLang}
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO
      UPDATE SET
        title_${sLang}=excluded.title_${sLang},
        img_${sLang}=excluded.img_${sLang}
    `;
  },
  delete: () => `DELETE FROM track`,
  deleteByGid: () => `DELETE FROM track WHERE gid = ?`,
};

export default tbTrack;
