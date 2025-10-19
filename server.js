// server.js (update)
// Adds a lightweight request logger and clearer startup logs.
// Ensure you start this file (node server.js) with PORT set to the value the client expects (3001).

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Allow frontend origin (during dev). Change to your front-end origin in production.
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger for debugging
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.path);
  next();
});

// Mount auth routes
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

// Optional: mount your consolidated API if you use api.js instead of server.js
const api = require('./api');
app.use('/', api);

// Example health route
app.get('/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Auth routes mounted (POST /api/auth/login, GET /api/auth/validate)`);
});