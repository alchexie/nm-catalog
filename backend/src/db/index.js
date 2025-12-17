const path = require('path');
const Database = require('better-sqlite3');
const { DB_PATH } = require('../utils/paths');

const db = new Database(DB_PATH);

module.exports = db;
