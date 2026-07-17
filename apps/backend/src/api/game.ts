import express, { type Request, type Response } from 'express';
import type {
  Game,
  GameGroup,
  GameGroupBy,
  GameRelation,
  LangCodeValue,
  Playlist,
  Series,
  Track,
} from '@nm-catalog/shared';
import {
  stmt,
  DataRow,
  COMMON_PATHS,
  readText,
  toError,
  writeText,
  upstreem,
} from '@nm-catalog/core';

const router = express.Router();

const getGameList = (groupBy: GameGroupBy): Game[] => {
  const rows = stmt.game.selectGroupBy(groupBy).all() as Game[];
  rows.forEach((x) => {
    delete x.inserted;
  });
  return rows;
};

export const getGameByYear = async (): Promise<GameGroup[]> => {
  const fileName = COMMON_PATHS['res_game_year.json'];
  const data = readText(fileName);

  if (!data) {
    let gameList: Game[];

    try {
      gameList = getGameList('RELEASE');

      const gameListMap = new Map(gameList.map((x) => [x.id, x]));
      const result: GameGroup[] = (await upstreem.getGamesByYear()).map((x: DataRow) => ({
        name: x.releasedYear,
        games: (<any>x.items)
          .map((y: DataRow) => gameListMap.get(<string>y.id))
          .filter((y: DataRow) => !!y) as Game[],
      }));

      writeText(fileName, result);
      return result;
    } catch (error) {
      const err = toError(error);
      const msg = err.message;

      try {
        const result: GameGroup[] = [];
        gameList!.forEach((x) => {
          const last = result[result.length - 1];
          if (!last || last.name !== x.year.toString()) {
            result.push({
              name: x.year.toString(),
              games: [x],
            } as GameGroup);
          } else {
            last.games.push(x);
          }
        });
        return result;
      } catch (error) {
        const err = toError(error);
        throw {
          'Nintendo Api Error': msg,
          'Local Error': err.message,
        };
      }
    }
  } else {
    return JSON.parse(data);
  }
};

router.get('/recent', (_req: Request, res: Response) => {
  try {
    const result = getGameList('ADDED');
    res.json([
      {
        localeNameTag: 'game.all',
        games: result,
      },
    ]);
  } catch (error) {
    const err = toError(error);
    res.status(500).json({ error: err.message });
  }
});

router.get('/hardware', async (_req: Request, res: Response) => {
  const fileName = COMMON_PATHS['res_game_platform.json'];
  const data = readText(fileName);

  if (!data) {
    let gameList: Game[];

    try {
      gameList = getGameList('PLATFORM');

      const gameListMap = new Map(gameList.map((x) => [x.id, x]));
      const result: GameGroup[] = (await upstreem.getGamesByHardware()).map(
        (x: DataRow) => ({
          name: x.formalHardware,
          games: (<any>x.items)
            .map((y: DataRow) => gameListMap.get(<string>y.id))
            .filter((y: DataRow) => !!y) as Game[],
        })
      );

      writeText(fileName, result);
      res.json(result);
    } catch (error) {
      const err = toError(error);
      const msg = err.message;
      console.error(error);

      try {
        const result: GameGroup[] = [];
        gameList!.forEach((x) => {
          const last = result[result.length - 1];
          if (!last || last.name !== x.hardware) {
            result.push({
              name: x.hardware,
              games: [x],
            } as GameGroup);
          } else {
            last.games.push(x);
          }
        });
        res.json(result);
      } catch (error) {
        const err = toError(error);
        res.status(500).json({
          'Nintendo Api Error': msg,
          'Local Error': err.message,
        });
      }
    }
  } else {
    return res.json(JSON.parse(data));
  }
});

router.get('/release', async (_req: Request, res: Response) => {
  try {
    const result = await getGameByYear();
    res.json(result);
  } catch (error) {
    const err = toError(error);
    res.status(500).json({ error: err.message });
  }
});

router.get('/series', async (_req: Request, res: Response) => {
  const fileName = COMMON_PATHS['res_game_series.json'];
  const data = readText(fileName);

  if (!data) {
    try {
      const gameList = stmt.game.selectGroupBy('SERIES').all() as Game[];
      const seriesMap = new Map(
        (
          stmt.series
            .selectByIds([...new Set(gameList.map((x) => x.sid).filter((x) => x))])
            .all() as Series[]
        ).map((s) => [s.id, s])
      );
      const addedSidSet = new Set<string>();

      const result: GameGroup[] = [];
      gameList.forEach((x, i) => {
        if (!addedSidSet.has(x.sid)) {
          addedSidSet.add(x.sid);
          const namedGroup = !x.sid
            ? { localeNameTag: 'game.uncategorized', games: [x] }
            : {
                localeNames: (() => {
                  const result = {} as Record<LangCodeValue, string>;
                  const series = seriesMap.get(x.sid);
                  if (series) {
                    Object.entries(series).forEach(([key, value]) => {
                      if (key.startsWith('title_') && value) {
                        const lang = key
                          .replace('title_', '')
                          .replace('_', '-') as LangCodeValue;
                        result[lang] = value;
                      }
                    });
                  }
                  return result;
                })(),
              };
          result.push(Object.assign({ games: [x] }, namedGroup) as GameGroup);
        } else {
          const last = result.at(-1);
          last!.games.push(x);
        }
      });

      const gamesSortByYear = (await getGameByYear())
        .map((x) => x.games)
        .reduce((a, b) => [...a, ...b], []);
      const gamesSortByYearMap = new Map(gamesSortByYear.map((x, i) => [x.id, i]));
      result.forEach((group) => {
        group.games.sort(
          (a, b) =>
            (gamesSortByYearMap.get(a.id) ?? Infinity) -
            (gamesSortByYearMap.get(b.id) ?? Infinity)
        );
      });
      result.sort((a, b) => {
        const aIsUncategorized = 'localeNameTag' in a;
        const bIsUncategorized = 'localeNameTag' in b;
        if (aIsUncategorized && !bIsUncategorized) {
          return 1;
        }
        if (!aIsUncategorized && bIsUncategorized) {
          return -1;
        }
        return (
          (gamesSortByYearMap.get(a.games[0].id) ?? Infinity) -
          (gamesSortByYearMap.get(b.games[0].id) ?? Infinity)
        );
      });

      writeText(fileName, result);
      res.json(result);
    } catch (error) {
      const err = toError(error);
      const msg = err.message;
      res.status(500).json({
        'Nintendo Api Error': msg,
        'Local Error': err.message,
      });
    }
  } else {
    res.json(JSON.parse(data));
  }
});

router.get('/:id/detail', async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const promises: [
      Promise<Game>,
      Promise<Track[]>,
      Promise<Playlist[]>,
      Promise<Game[]>,
    ] = [
      new Promise((resolve, reject) => {
        try {
          const result = stmt.game.selectById().get(id) as Game;
          delete result.inserted;
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }),

      new Promise((resolve, reject) => {
        try {
          const gid = (stmt.game.selectEntityById().get(id) as Game).id;
          const result = stmt.track.selectByGid().all(gid) as Track[];
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }),

      new Promise((resolve, reject) => {
        try {
          const gid = (stmt.game.selectEntityById().get(id) as Game).id;
          const result = stmt.playlist.selectByGid().all(gid) as Playlist[];
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }),

      new Promise(async (resolve, reject) => {
        try {
          const rgids = (stmt.game_related.selectByGid().all(id) as GameRelation[]).map(
            (x) => x.rgid
          );
          const linkIds = (stmt.game.selectLinkChainById().all(id) as Game[]).map(
            (x) => x.id
          );
          const linkRgids: string[] = [];
          if (linkIds.length > 0) {
            const validLinkIds = linkIds.filter((x) => x !== id);
            for (const linkId of validLinkIds) {
              const linkGameIds = (stmt.game.selectLinkChainById().all(linkId) as Game[])
                .map((x) => x.id)
                .filter((x) => x !== id);
              linkRgids.push(
                ...linkGameIds
                  .map((x) =>
                    (stmt.game_related.selectByGid().all(x) as GameRelation[]).map(
                      (y) => y.rgid
                    )
                  )
                  .flat()
              );
            }
          }

          const set = new Set([...rgids, ...linkIds, ...linkRgids]);
          set.delete(<string>id);
          const result = (await getGameByYear())
            .map((x) => x.games)
            .reduce((a, b) => [...a, ...b])
            .filter((x) => x.id !== id && (set.has(x.id) || set.has(x.link)));
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }),
    ];

    const [game, tracks, playlists, relateds] = await Promise.all(promises);
    const result = { game, tracks, playlists, relateds };
    res.json(result);
  } catch (error) {
    const err = toError(error);
    res.status(500).json({ error: err.message });
  }
});

export default router;
