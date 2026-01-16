import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test database connection
console.log('Attempting to connect to database...');
pool.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch((err) => console.error('Failed to connect to database:', err));

app.get('/', (req, res) => {
  res.send('Dart Scorer API is running');
});

// API Routes
// POST /api/games -> Create new game.
app.post('/api/games', async (req, res) => {
  // Implementation
  res.status(501).send('Not Implemented');
});

// POST /api/games/:id/throw -> Submit a throw
app.post('/api/games/:id/throw', async (req, res) => {
  // Implementation
  res.status(501).send('Not Implemented');
});

// GET /api/games/:id/status -> Sync state
app.get('/api/games/:id/status', async (req, res) => {
  // Implementation
  res.status(501).send('Not Implemented');
});

// GET /api/players/:id/stats
app.get('/api/players/:id/stats', async (req, res) => {
  // Implementation
  res.status(501).send('Not Implemented');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
