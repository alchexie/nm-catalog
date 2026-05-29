import { DBTableConfig } from './index.js';

const tbSeries: DBTableConfig = {
  create: () => `
    CREATE TABLE IF NOT EXISTS series (
      id TEXT PRIMARY KEY,
      title_de_DE TEXT,
      title_en_US TEXT,
      title_es_ES TEXT,
      title_fr_FR TEXT,
      title_it_IT TEXT,
      title_ja_JP TEXT,
      title_ko_KR TEXT,
      title_zh_CN TEXT,
      title_zh_TW TEXT
    );
  `,
  selectById: () => `SELECT * FROM series WHERE id = ?`,
  selectByIds: (ids: string[] = []) =>
    `SELECT * FROM series WHERE id in (${ids.map((id) => `'${id}'`).join(',')})`,
  insert: () => {
    return `
        INSERT INTO series (
          id, title_de_DE, title_en_US, title_es_ES, title_fr_FR, title_it_IT, title_ja_JP, title_ko_KR, title_zh_CN, title_zh_TW
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO
        UPDATE SET
          title_de_DE=excluded.title_de_DE,
          title_en_US=excluded.title_en_US,
          title_es_ES=excluded.title_es_ES,
          title_fr_FR=excluded.title_fr_FR,
          title_it_IT=excluded.title_it_IT,
          title_ja_JP=excluded.title_ja_JP,
          title_ko_KR=excluded.title_ko_KR,
          title_zh_CN=excluded.title_zh_CN,
          title_zh_TW=excluded.title_zh_TW
      `;
  },
};

export default tbSeries;
