import { Router } from 'express';
import commonRoutes from './common.js';
import gameRoutes from './game.js';
import playlistRoutes from './playlist.js';

const router = Router();

router.use('/common', commonRoutes);
router.use('/game', gameRoutes);
router.use('/playlist', playlistRoutes);

export default router;
