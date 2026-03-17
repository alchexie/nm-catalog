import { Router } from 'express';
import listRoutes from './list.js';
import gameRoutes from './game.js';
import playlistRoutes from './playlist.js';

const router = Router();

router.use('/list', listRoutes);
router.use('/game', gameRoutes);
router.use('/playlist', playlistRoutes);

export default router;
