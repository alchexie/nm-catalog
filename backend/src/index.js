const express = require('express');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const apiRoutes = require('./api');

const app = express();
app.use(compression());
app.use(cors());
app.use(express.json());
app.disable('x-powered-by');
app.use('/api', apiRoutes);

const port = process.env.PORT || 3000;
app.listen(port, '127.0.0.1', () => {
  console.log(`Server running on http://127.0.0.1:${port}`);
});
