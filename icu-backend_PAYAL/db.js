const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false 
  }
});


// Test database connection
pool.query('SELECT NOW()')
  .then(result => console.log('Database connection successful:', result.rows[0]))
  .catch(err => {
    console.error('Database connection failed:', err);
    // Continue even if DB fails
    console.log('IMPORTANT: Database connection failed but server will continue');
  });



module.exports = pool;
