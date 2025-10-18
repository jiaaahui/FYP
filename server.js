// server/index.js
// Single entry that mounts auth routes and other API routers.
// - Enables CORS for development (adjust origin in production).
// - Make sure you have server/routes/auth.js present (from earlier).
// - Start with: PORT=3001 node server/index.js  (PowerShell: $env:PORT=3001; node server/index.js)

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

// Prisma client expects prismaClient.js in same folder
// const prisma = require('./prismaClient'); // only needed if you use it here

// Mount auth routes
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

// Example health route
app.get('/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Auth routes mounted: POST http://localhost:${port}/api/auth/login`);
  console.log(`Validate: GET http://localhost:${port}/api/auth/validate`);
});