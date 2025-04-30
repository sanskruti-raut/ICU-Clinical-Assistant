// icu-backend/db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'mimicuser',
  host: 'localhost',
  database: 'mimic_local',
  password: 'mimicpass',
  port: 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};