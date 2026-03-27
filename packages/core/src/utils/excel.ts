import fs from 'fs';
import xlsx from 'xlsx';
import { LangCodeValue } from '@nm-catalog/shared';
import { stmt } from '../db/statements.js';
import { getTransactionByStatement } from '../db/transaction.js';
import { DataCell } from '../db/schema/index.js';
import { info, writeText } from './tools.js';
import { COMMON_PATHS } from './paths.js';

type ExcelRow = Record<string, string | number>;
type NormalizedRow = Record<string, string | number>;
type NormalizeSheet = NormalizedRow[];
type NormalizeWorkbook = NormalizeSheet[];

const normalizeRow = (row: ExcelRow): NormalizedRow => {
  const normalized: NormalizedRow = {};
  for (let key in row) {
    const cleanKey = key.toLowerCase().replace(/_/g, '');
    normalized[cleanKey] = row[key];
  }
  return normalized;
};

const readExcels = (
  filePaths: string[],
  deleteAfterDone = false
): NormalizeWorkbook[] => {
  const result: NormalizeWorkbook[] = [];
  filePaths.forEach((path) => {
    const workbook = xlsx.readFile(path);
    const sheetNames = workbook.SheetNames;
    const normalizeWorkbook: NormalizeWorkbook = [];

    sheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const rawData: ExcelRow[] = xlsx.utils.sheet_to_json(sheet);
      const data: NormalizeSheet = rawData.map((x) => normalizeRow(x));
      normalizeWorkbook.push(data);
    });
    if (deleteAfterDone) {
      fs.unlinkSync(path);
    }
    result.push(normalizeWorkbook);
  });
  return result;
};

export const importData = (
  files: { path: string; filename: string }[],
  settings: { descend: boolean; fullUpdate: boolean }
): { total: number; new: number } => {
  const fullUpdate = settings.fullUpdate;
  if (fullUpdate) {
    stmt.game.delete().run();
    stmt.track.delete().run();
  }

  const [sources, filenames] = [
    readExcels(files.map((x) => x.path)),
    files.map((x) => x.filename),
  ];
  const ms = Date.now();
  const langs: LangCodeValue[] = stmt.lang
    .select()
    .all()
    .map((x: any) => x.id);
  const existedGameIds: string[] = !fullUpdate
    ? stmt.game
        .select()
        .all()
        .map((x: any) => x.id)
    : [];
  const newGameIds = sources[0][0]
    .filter((row) => !existedGameIds.includes(<string>row.id))
    .map((row) => row.id) as string[];

  info(`+++++++++ ${newGameIds.length} new game(s) found. +++++++++`);

  sources.forEach((workbook, i) => {
    const lang = ((fileName) => {
      return langs[langs.map((x) => fileName.includes(x)).indexOf(true)];
    })(filenames[i]);
    let diff = -1;
    const gameData: DataCell[][] = [];
    const trackData: DataCell[][] = [];
    const relateData: DataCell[][] = [];

    workbook.forEach((sheet, j) => {
      if (j === 0) {
        gameData.push(
          ...sheet
            .filter((row) => {
              if (fullUpdate) {
                return true;
              } else {
                return !existedGameIds.includes(<string>row.id);
              }
            })
            .map((row, k) => {
              let linkIdx = settings.descend ? k - 1 : k + 1;
              if (!fullUpdate) {
                linkIdx += existedGameIds.length;
              }
              return [
                row.id,
                row.year,
                row.hardware,
                row.islink ? sheet[linkIdx].id : '',
                row.name,
                (<string>row.thumbnailurl).split('/').reverse()[0],
                ms + (settings.descend ? -k : k),
              ];
            })
        );
      } else {
        const games = workbook[0];
        if (
          fullUpdate ||
          (!fullUpdate && newGameIds.includes(<string>workbook[0][j + diff].id))
        ) {
          trackData.push(
            ...sheet.map((row) => [
              row.id,
              games[j + diff].id,
              row.index,
              row.duration,
              +row.isloop,
              +row.isbest,
              row.name,
              (<string>row.thumbnailurl).split('/').reverse()[0],
            ])
          );
        }
        if (j < workbook.length - 1) {
          if (games[j + diff + 1].islink) {
            diff++;
          }
        }
      }

      let trans = getTransactionByStatement(stmt.game.insert(lang));
      trans(gameData);
      trans = getTransactionByStatement(stmt.track.insert(lang));
      trans(trackData);
    });

    if (i === sources.length - 1) {
      info(`Updating related data...`);

      stmt.game_related.delete().run();
      relateData.push(
        ...workbook[0]
          .map((row) => {
            const data = (<string>row.relatedgame)
              .split('|')
              .map((x) => {
                const result = workbook[0].find((y) => y.name === x)?.id;
                if (!result) {
                  return null;
                }
                return [row.id, result] as [string, string];
              })
              .filter((x): x is [string, string] => !!x);
            return data.flat(0);
          })
          .reduce((a, b) => [...a, ...b])
      );
      getTransactionByStatement(stmt.game_related.insert())(relateData);
    }
  });

  setTimeout(() => {
    writeText(COMMON_PATHS['new_game.json'], newGameIds);
    writeText(COMMON_PATHS['res_game_platform.json'], '');
    writeText(COMMON_PATHS['res_game_year.json'], '');
  });

  console.log('Data successfully updated.');

  return {
    total: sources[0][0].length,
    new: newGameIds.length,
  };
};
