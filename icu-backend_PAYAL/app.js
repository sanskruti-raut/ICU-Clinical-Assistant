// index.js

// 1) Load environment variables immediately
require('dotenv').config();

const express  = require('express');
const path     = require('path');
const http     = require('http');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');

const pool     = require('./db');
const {
  preloadVitals,
  startSimulation,
  setupSocketHandlers
} = require('./simulator');
const scoreRouter = require('./routes/score');  // should export an Express Router

// 2) Create Express app
const app = express();

// 3) Parse JSON bodies
app.use(express.json());

// 4) Create HTTP server & Socket.IO
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

// 5) JWT configuration
const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '2h';

// 6) Authentication middleware
function authenticateJWT(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.sendStatus(401);
  }
  const token = auth.slice(7);
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.sendStatus(403);
    req.user = { id: payload.sub, role: payload.role };
    next();
  });
}

// 7) Public routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query(
      'SELECT id, password_hash, role FROM users WHERE email = $1',
      [email]
    );

    if (
      result.rows.length === 0 ||
      !bcrypt.compareSync(password, result.rows[0].password_hash)
    ) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user  = result.rows[0];
    const token = jwt.sign(
      { sub: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 8) Protected API routes
app.use('/api/patients',   authenticateJWT, require('./routes/patients'));
app.use('/api/vitals',     authenticateJWT, require('./routes/vitals'));
app.use('/api/alerts',     authenticateJWT, require('./routes/alerts'));
app.use('/api/analytics',  authenticateJWT, require('./routes/analytics'));
app.use('/api/score',      authenticateJWT, scoreRouter);

// 9) Serve React frontend static files
const frontendBuild = path.join(__dirname, '../icu-frontend_new/build');
app.use(express.static(frontendBuild));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuild, 'index.html'));
});

// 10) Socket handlers & simulation
setupSocketHandlers(io);

// 11) Start server, then preload vitals & begin simulation
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);

  preloadVitals(pool)
    .then(() => {
      console.log('Vitals preloaded, starting simulation');
      startSimulation(io);
    })
    .catch(err => {
      console.error('Error preloading vitals:', err);
      console.log('Starting simulation with empty data');
      startSimulation(io);
    });
});
