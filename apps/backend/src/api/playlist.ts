import express, { type Request, type Response } from 'express';
import {
  PlaylistSectionType,
  type Game,
  type Playlist,
  type PlaylistDetail,
  type PlaylistSection,
  type PlaylistTrack,
  type PlaylistTrackGroup,
} from '@nm-catalog/shared';
import { stmt, readText, toError, COMMON_PATHS, DataRow } from '@nm-catalog/core';

const router = express.Router();

router.get('/', (_req: Request, res: Response) => {
  const fileName = COMMON_PATHS['res_playlist_section.json'];
  try {
    const rawData: Record<string, DataRow[]> = JSON.parse(readText(fileName));
    const rawPlaylistData = Object.values(rawData);
    const playlists = stmt.playlist
      .selectByIds(
        rawPlaylistData.map((x) => x.map((y) => y.id)).reduce((a, b) => [...a, ...b])
      )
      .all() as Playlist[];

    const result = [] as PlaylistSection[];
    Object.entries(rawData).forEach((_, i) => {
      result.push({
        tag: PlaylistSectionType[i],
        playlists: rawPlaylistData[i].map((x) => playlists.find((y) => y.id === x.id)!),
      });
    });
    res.json(result);
  } catch (error) {
    const err = toError(error);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/detail', (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const playlist = stmt.playlist.selectById().all(id)[0] as Playlist;
    const tracks: PlaylistTrack[] = [];
    const trackGroups: PlaylistTrackGroup[] = [];

    if (['SINGLE_GAME_ALL', 'BEST', 'LOOP'].includes(playlist.type)) {
      const game = <Game>stmt.playlist_game.selectGameByPid().all(id)[0];
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
      const pTracks = (stmt.track.selectByIds(ptIds).all() as PlaylistTrack[]).sort(
        (a, b) => ptIds.indexOf(a.id) - ptIds.indexOf(b.id)
      );
      tracks.push(...pTracks);

      if (playlist.type !== 'SPECIAL') {
        let games: Game[] = [];
        if (playlist.isrelatedgame) {
          games = stmt.playlist_game.selectGameByPid().all(id) as Game[];
        } else {
          games = (
            stmt.game.selectByIds([...new Set(tracks.map((x) => x.gid))]).all() as Game[]
          ).sort((a, b) => a.year - b.year);

          const orderMap = new Map(games.map((g, i) => [g.id, i]));
          tracks.sort((a, b) => {
            const orderDiff =
              (orderMap.get(a.gid!) ?? Infinity) - (orderMap.get(b.gid!) ?? Infinity);
            return orderDiff !== 0 ? orderDiff : a.idx - b.idx;
          });
        }

        tracks.forEach((x, i) => {
          if (i === 0 || x.gid !== tracks[i - 1].gid) {
            trackGroups.push({
              game: games.find((y) => y.id === x.gid),
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
          const orderedTracks = specialPlaylists
            .flatMap(
              (x) => stmt.playlist_track.selectTrackByPid().all(x.id) as PlaylistTrack[]
            )
            .filter((x) => lastGroupTrackIds.includes(x.id));
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
    res.json(result);
  } catch (error) {
    const err = toError(error);
    res.status(500).json({ error: err.message });
  }
});

export default router;
