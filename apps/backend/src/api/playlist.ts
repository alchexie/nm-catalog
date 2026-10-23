import express, { type Request, type Response } from 'express';
import {
  CharacterPlaylistSection,
  PLAYLIST_SECTION_TYPE,
  PlaylistSeries,
  Series,
  type Game,
  type Playlist,
  type PlaylistDetail,
  type PlaylistSection,
  type PlaylistTrack,
  type PlaylistTrackGroup,
} from '@nm-catalog/shared';
import {
  stmt,
  readText,
  toError,
  COMMON_PATHS,
  DataRow,
  writeText,
  upstreem,
} from '@nm-catalog/core';
import { getGameByYear } from './game.js';

const router = express.Router();

router.get('/section', (_req: Request, res: Response) => {
  try {
    let fileName = COMMON_PATHS['res_playlist_section.json'];
    const rawSectionData: Record<string, DataRow[]> = JSON.parse(readText(fileName));
    const rawPlaylistData = Object.values(rawSectionData);
    const playlists = stmt.playlist
      .selectByIds(
        rawPlaylistData.map((x) => x.map((y) => y.id)).reduce((a, b) => [...a, ...b])
      )
      .all() as Playlist[];

    const playlistsMap = new Map(playlists.map((p) => [<string>p.id, p]));
    const result = [] as PlaylistSection[];
    Object.entries(rawSectionData).forEach((_, i) => {
      result.push({
        tag: PLAYLIST_SECTION_TYPE[i],
        playlists: rawPlaylistData[i]
          .map((x) => playlistsMap.get(<string>x.id))
          .filter((p): p is Playlist => p !== undefined),
      });
    });

    res.json(result);
  } catch (error) {
    const err = toError(error);
    res.status(500).json({ error: err.message });
  }
});

router.get('/character', async (req: Request, res: Response) => {
  const fileName = COMMON_PATHS['res_playlist_character.json'];
  let data: any = readText(fileName);

  try {
    if (!data) {
      data = (await upstreem.getCharacterPlaylistInfo()).playlists.map(
        (x: DataRow) => x.id
      );
    } else {
      data = JSON.parse(readText(fileName)) as any[];
    }

    let result: CharacterPlaylistSection[] = [];
    if (typeof data[0] === 'string') {
      const playlistSeries = stmt.playlist_game
        .selectRelatedSeries(data)
        .all() as PlaylistSeries[];
      const seriesIdSet = new Set<string>(playlistSeries.map((x) => x.sid));
      result = (
        [...seriesIdSet].map((x) => ({
          series: stmt.series.selectById().get(x) as Series | undefined,
          playlists: (
            stmt.playlist
              .selectByIds(playlistSeries.filter((y) => y.sid === x).map((y) => y.pid))
              .all() as Playlist[]
          ).sort((a, b) => data.indexOf(a.id) - data.indexOf(b.id)),
        })) as CharacterPlaylistSection[]
      ).sort((a, b) => {
        if (!a.series !== !b.series) {
          return a.series ? -1 : 1;
        }
        return data.indexOf(a.playlists[0].id) - data.indexOf(b.playlists[0].id);
      });

      const unclassified = result.at(-1);
      if (unclassified && !unclassified.series) {
        const classifiedPids = playlistSeries.filter((x) => !!x.sid).map((x) => x.pid);
        unclassified.playlists = unclassified.playlists.filter(
          (x) => classifiedPids.indexOf(x.id) < 0
        );
      }

      const gidByYearIndexMap = new Map(
        (await getGameByYear())
          .map((x) => x.games)
          .flat()
          .map((x, i) => [x.id, i])
      );
      result.forEach((x) => {
        const sortKeyMap = new Map<string, number>();
        x.playlists.forEach((y) => {
          const games = stmt.playlist_game.selectGameByPid().all(y.id) as Game[];
          sortKeyMap.set(
            y.id,
            games.length
              ? Math.min(
                  ...games.map((g) => gidByYearIndexMap.get(g.id) ?? Number.MAX_SAFE_INTEGER)
                )
              : Number.MAX_SAFE_INTEGER
          );
        });
        x.playlists.sort(
          (a, b) =>
            (sortKeyMap.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
            (sortKeyMap.get(b.id) ?? Number.MAX_SAFE_INTEGER)
        );
      });

      writeText(fileName, result);
    } else {
      result = data;
    }
    res.json(result);
  } catch (error) {
    const err = toError(error);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/detail', async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const playlist = stmt.playlist.selectById().get(id) as Playlist;
    const tracks: PlaylistTrack[] = [];
    const trackGroups: PlaylistTrackGroup[] = [];

    if (['SINGLE_GAME_ALL', 'BEST', 'LOOP'].includes(playlist.type)) {
      const game = stmt.playlist_game.selectGameByPid().get(id) as Game;
      const allTracks = stmt.track.selectByGid().all(game.id) as PlaylistTrack[];
      tracks.push(
        ...allTracks.filter((x) => {
          switch (playlist.type) {
            case 'SINGLE_GAME_ALL':
              return true;
            case 'BEST':
              return x.isbest;
            case 'LOOP':
              return x.isloop;
          }
        })
      );
      trackGroups.push({ game, tracks });
    } else {
      let ptList!: PlaylistTrack[];
      if (!playlist.fetchstrategy) {
        ptList = stmt.playlist_track.selectTrackByPid().all(id) as PlaylistTrack[];
      } else {
        ptList = stmt.sql(playlist.fetchstrategy).all() as PlaylistTrack[];
      }
      const ptIds = ptList.map((x) => x.id);
      const idIndexMap = new Map(ptIds.map((id, i) => [id, i]));
      const pTracks = (stmt.track.selectByIds(ptIds).all() as PlaylistTrack[]).sort(
        (a, b) => (idIndexMap.get(a.id) ?? Infinity) - (idIndexMap.get(b.id) ?? Infinity)
      );
      tracks.push(...pTracks);

      if (playlist.type !== 'SPECIAL') {
        let games: Game[] = [];
        if (playlist.isrelatedgame) {
          games = stmt.playlist_game.selectGameByPid().all(id) as Game[];
        } else {
          const gidByYear = (await getGameByYear())
            .map((x) => x.games.map((y) => y.id))
            .flat()
            .reverse();
          games = (
            stmt.game.selectByIds([...new Set(tracks.map((x) => x.gid))]).all() as Game[]
          ).sort((a, b) => gidByYear.indexOf(a.id) - gidByYear.indexOf(b.id));

          const orderMap = new Map(games.map((g, i) => [g.id, i]));
          tracks.sort((a, b) => {
            const orderDiff =
              (orderMap.get(a.gid!) ?? Infinity) - (orderMap.get(b.gid!) ?? Infinity);
            return orderDiff !== 0 ? orderDiff : a.idx - b.idx;
          });
        }

        const gamesMap = new Map(games.map((g) => [g.id, g]));
        tracks.forEach((x, i) => {
          if (i === 0 || x.gid !== tracks[i - 1].gid) {
            trackGroups.push({
              game: gamesMap.get(x.gid!),
              tracks: [],
            });
          }
          const group = trackGroups.at(-1);
          group!.tracks.push(x);
        });

        const last = trackGroups.at(-1)!;
        if (!last?.game) {
          trackGroups.pop();

          const specialPlaylists = (
            stmt.playlist_track
              .selectPlaylistByTids([...new Set(last?.tracks.map((x) => x.id))])
              .all() as Playlist[]
          ).filter((x) => x.type === 'SPECIAL');
          const lastGroupTrackIds = last.tracks.map((x) => x.id);
          const lastGroupTrackIdSet = new Set(lastGroupTrackIds);
          const orderedTracks = specialPlaylists
            .flatMap(
              (x) => stmt.playlist_track.selectTrackByPid().all(x.id) as PlaylistTrack[]
            )
            .filter((x) => lastGroupTrackIdSet.has(x.id));
          new Array(lastGroupTrackIds.length).fill(0).forEach((_, i) => {
            tracks[tracks.length - lastGroupTrackIds.length + i] = orderedTracks[i];
          });

          trackGroups.push({ tracks: tracks.slice(-lastGroupTrackIds.length) });
        }
      } else {
        trackGroups.push({ tracks });
      }
    }

    delete playlist.fetchstrategy;
    tracks.forEach((x, i) => {
      x.pidx = i + 1;
    });

    const result: PlaylistDetail = { playlist, trackGroups };
    if (result.playlist.isrelatedgame) {
      if (result.playlist.type !== 'MULTIPLE') {
        const gid = (
          stmt.game.selectEntityById().get(result.trackGroups[0].game?.id) as Game
        ).id;
        result.relatedPlaylists = stmt.playlist.selectByGid().all(gid) as Playlist[];
      } else {
        const gids = (stmt.playlist_game.selectGameByPid().all(id) as Game[]).map(
          (x) => x.id
        );
        const rgids = (stmt.game.selectAllByIds(gids).all() as Game[]).map((x) => x.id);
        const gamesSortByYear = (await getGameByYear()).map((x) => x.games).flat();
        result.relatedGames = gamesSortByYear.filter((x) => rgids.includes(x.id));
      }
    }
    res.json(result);
  } catch (error) {
    const err = toError(error);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:gid/game', async (req: Request, res: Response) => {
  try {
    const gid = req.params.gid;
    const result = stmt.playlist.selectByGid().all(gid) as Playlist[];
    res.json(result);
  } catch (error) {
    const err = toError(error);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:tid/track/', async (req: Request, res: Response) => {
  try {
    const tid = req.params.tid;
    const result = stmt.playlist_track.selectPlaylistByTid().all(tid) as Playlist[];
    res.json(result);
  } catch (error) {
    const err = toError(error);
    res.status(500).json({ error: err.message });
  }
});

export default router;
