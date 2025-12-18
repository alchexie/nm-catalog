import express, { type Request, type Response } from 'express';
import { Game, Playlist, PlaylistDetail, PlaylistTrack } from '@nm-catalog/shared';
import { stmt } from '../db/statements.js';
import { toError } from '../utils/tools.js';

const router = express.Router();

router.get('/:id/detail', (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const playlist = stmt.playlist.selectById().all(id)[0] as Playlist;
    const games: Game[] = [];
    const tracks: PlaylistTrack[] = [];

    if (['SINGLE_GAME_ALL', 'BEST', 'LOOP'].includes(playlist.type)) {
      games.push(...(stmt.playlist_game.selectGameByPid().all(id) as Game[]));

      const allTracks = stmt.track.selectByGid().all(games[0].id) as PlaylistTrack[];
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
    } else {
      if (playlist.tracksnum) {
        if (playlist.isrelatedgame) {
          games.push(...(stmt.playlist_game.selectGameByPid().all(id) as Game[]));
        }

        const ptIds = (
          stmt.playlist_track.selectTrackByPid().all(id) as PlaylistTrack[]
        ).map((x) => x.id);
        const pTracks = (stmt.track.selectByIds(ptIds).all() as PlaylistTrack[]).sort(
          (a, b) => ptIds.indexOf(a.id) - ptIds.indexOf(b.id)
        );
        tracks.push(...pTracks);
      } else {
        // const sUtc9 = now.toLocaleString('en-US', {
        //   timeZone: 'Asia/Tokyo',
        // });
        // # daily order (response/playlist_(pid).json)
      }
    }

    tracks.forEach((x, i) => {
      x.pidx = i + 1;
    });

    const result: PlaylistDetail = {
      playlist: playlist,
      games: games,
      tracks: tracks,
    };
    res.json(result);
  } catch (error) {
    const err = toError(error);
    res.status(500).json({ error: err.message });
  }
});

export default router;
