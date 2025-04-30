require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Create DB connection pool
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
  ssl: {
    rejectUnauthorized: false,
  },
});


// Test endpoint: GET /api/vitals
app.get('/api/vitals', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vitals LIMIT 10');
    res.json(result.rows);
  } catch (err) {
    console.error('Error querying vitals:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
