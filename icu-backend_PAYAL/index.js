const express = require('express');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
dotenv.config();
const pool = require('./db');
const {
  preloadVitals,
  startSimulation,
  setupSocketHandlers
} = require('./simulator');

// Import both the router and the initialization function
const { scoreRouter, initializeWeights } = require('./routes/score');

// Import auth routes and middleware
const { router: authRouter, authenticateToken } = require('./routes/auth');

// Set up socket handlers
setupSocketHandlers(io);

// Body parser middleware
app.use(express.json());

// Public routes
app.use('/api/auth', authRouter);

// Add the /me endpoint that requires authentication
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Regular API routes (protected)
app.use('/api', authenticateToken, require('./routes/patients'));
app.use('/api', authenticateToken, require('./routes/vitals'));
app.use('/api', authenticateToken, require('./routes/alerts'));
app.use('/api', authenticateToken, require('./routes/analytics'));
app.use('/api', authenticateToken, scoreRouter);
app.use('/api', authenticateToken, require('./routes/sepsis-alerts'));

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../icu-frontend_new/build')));

// Anything that doesn't match the above, send back index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../icu-frontend_new/build/index.html'));
});

// Initialize weights at server startup
console.log('Initializing weights at server startup...');
initializeWeights();

// Start server async function that handles preloading data
async function startServer() {
  try {
    // Preload vitals data - pass the pool parameter
    await preloadVitals(pool);

    // Start the simulation after preloading data - pass the io parameter
    startSimulation(io);

    // Define PORT
    const PORT = process.env.PORT || 3000;

    // Start the server
    server.listen(PORT, () => {
      console.log('Server running on port ' + PORT);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
