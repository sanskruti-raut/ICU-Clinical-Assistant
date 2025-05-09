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
// Set up socket handlers
setupSocketHandlers(io);
// Regular API routes
app.use('/api', require('./routes/patients'));
app.use('/api', require('./routes/vitals'));
app.use('/api', require('./routes/alerts'));
app.use('/api', require('./routes/analytics'));
app.use('/api', scoreRouter); // Use the imported scoreRouter
app.use('/api', require('./routes/sepsis-alerts')); // Add the new sepsis alerts route
// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../icu-frontend_new/build')));
// Anything that doesn't match the above, send back index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../icu-frontend_new/build/index.html'));
});
// Start the server only after initialization is complete
async function startServer() {
  try {
    // Initialize weights for the sepsis score
    await initializeWeights();
    // Load streaming vitals and start the simulation with socket.io
    await preloadVitals(pool);
    startSimulation(io);
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => console.log('Server running on port ' + PORT));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}
// Call the async function to start the server
startServer();
