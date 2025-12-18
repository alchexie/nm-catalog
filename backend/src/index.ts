import express, { Application } from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import apiRoutes from './api/index.js';

dotenv.config();

const app: Application = express();
app.use(compression());
app.use(cors());
app.use(express.json());
app.disable('x-powered-by');
app.use('/api', apiRoutes);

const port = +(process.env.PORT ?? 5002);
app.listen(port, '127.0.0.1', () => {
  console.log(`Server running on http://127.0.0.1:${port}`);
});
