const express = require('express');
const router = express.Router();

const listRoutes = require('./list');
const gameRoutes = require('./game');
const uploadRoutes = require('./upload');

router.use('/list', listRoutes);
router.use('/game', gameRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;
