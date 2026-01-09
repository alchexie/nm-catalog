import express, { type Request, type Response } from 'express';
import {
  Game,
  Playlist,
  PlaylistDetail,
  PlaylistSection,
  PlaylistSectionType,
  PlaylistTrack,
  PlaylistTrackGroup,
} from '@nm-catalog/shared';
import { stmt } from '../db/statements.js';
import { readText, toError } from '../utils/tools.js';
import { COMMON_PATHS } from '../utils/paths.js';
import { DataRow } from '../db/schema/index.js';

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
    Object.entries(rawData).forEach(([_x, y], i) => {
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
      const ptIds = (
        stmt.playlist_track.selectTrackByPid().all(id) as PlaylistTrack[]
      ).map((x) => x.id);
      const pTracks = (stmt.track.selectByIds(ptIds).all() as PlaylistTrack[]).sort(
        (a, b) => ptIds.indexOf(a.id) - ptIds.indexOf(b.id)
      );
      tracks.push(...pTracks);

      if (playlist.isrelatedgame) {
        const games = stmt.playlist_game.selectGameByPid().all(id) as Game[];
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
      } else {
        if (playlist.type !== 'SPECIAL') {
          if (!playlist.tracksnum) {
            // temp solution
            tracks.sort(() => Math.random() - 0.5);
          }
        }

        trackGroups.push({ tracks });
      }
    }

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
