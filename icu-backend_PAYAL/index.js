const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const pool = require('./db');
const { preloadVitals, startSimulation } = require('./simulator');

// Load streaming vitals and start emitting
preloadVitals(pool).then(() => startSimulation());

// Import routes
app.use('/api', require('./routes/patients'));
app.use('/api', require('./routes/vitals'));
app.use('/api', require('./routes/alerts'));
app.use('/api', require('./routes/analytics'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
