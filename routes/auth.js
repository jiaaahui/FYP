// // server/routes/auth.js
// const express = require('express');
// const router = express.Router();
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const crypto = require('crypto');
// const prisma = require('../prismaClient');

// const JWT_SECRET = process.env.JWT_SECRET;
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; // e.g. '1h'

// // Helper: pick safe employee fields to return (no password)
// function safeEmployee(emp) {
//   if (!emp) return null;
//   const { password, ...rest } = emp;
//   return rest;
// }

// // Generate JWT
// function signToken(payload) {
//   return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
// }

// // POST /api/auth/login
// // Body: { email, password }
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body || {};
//   if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

//   try {
//     const employee = await prisma.employee.findFirst({
//       where: { email: { equals: email, mode: 'insensitive' } }
//     });
//     if (!employee) return res.status(401).json({ error: 'Invalid credentials' });

//     const hash = employee.password;
//     if (!hash) return res.status(401).json({ error: 'No password set for this account' });

//     const ok = await bcrypt.compare(password, hash);
//     if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

//     const payload = { employeeID: employee.employeeID, email: employee.email, role: employee.role };
//     const token = signToken(payload);

//     res.json({ token, employee: safeEmployee(employee) });
//   } catch (err) {
//     console.error('POST /api/auth/login error', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // GET /api/auth/validate
// // Auth: Authorization: Bearer <token>
// router.get('/validate', async (req, res) => {
//   const auth = req.headers.authorization;
//   if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });

//   const token = auth.slice('Bearer '.length);
//   try {
//     const payload = jwt.verify(token, JWT_SECRET);
//     // Fetch fresh employee info
//     const employee = await prisma.employee.findUnique({
//       where: { employeeID: payload.employeeID },
//       select: {
//         employeeID: true, name: true, email: true, contact_number: true, role: true, active_flag: true, displayName: true, createdAt: true, bio: true
//       }
//     });
//     if (!employee) return res.status(401).json({ error: 'Invalid token (user not found)' });
//     res.json({ valid: true, employee });
//   } catch (err) {
//     console.warn('Token validate failed', err);
//     return res.status(401).json({ error: 'Invalid or expired token' });
//   }
// });

// // POST /api/auth/reset-request
// // Body: { email }
// // Generates a reset token and persists it (expires in 1 hour).
// // In production, send this token by email to the user (here we return it for testing).
// router.post('/reset-request', async (req, res) => {
//   const { email } = req.body || {};
//   if (!email) return res.status(400).json({ error: 'Email is required' });

//   try {
//     const employee = await prisma.employee.findFirst({
//       where: { email: { equals: email, mode: 'insensitive' } }
//     });
//     if (!employee) {
//       // Do not reveal whether email exists — but we will return 200 for UX; optionally log
//       return res.json({ ok: true, message: 'If an account exists an email was sent' });
//     }

//     const token = crypto.randomBytes(32).toString('hex');
//     const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

//     // Persist reset token (Prisma model passwordReset required)
//     await prisma.passwordReset.create({
//       data: {
//         token,
//         employeeID: employee.employeeID,
//         expiresAt
//       }
//     });

//     // TODO: send email with reset link containing token (e.g. https://your-app/reset?token=...)
//     // For now return token for testing; remove in production
//     console.log(`Password reset token for ${employee.email}: ${token} (expires ${expiresAt.toISOString()})`);
//     return res.json({ ok: true, message: 'Password reset initiated', token });
//   } catch (err) {
//     console.error('POST /api/auth/reset-request error', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // POST /api/auth/reset-confirm
// // Body: { token, newPassword }
// router.post('/reset-confirm', async (req, res) => {
//   const { token, newPassword } = req.body || {};
//   if (!token || !newPassword) return res.status(400).json({ error: 'Token and newPassword are required' });
//   if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

//   try {
//     const reset = await prisma.passwordReset.findUnique({ where: { token } });
//     if (!reset || reset.expiresAt < new Date()) {
//       return res.status(400).json({ error: 'Invalid or expired token' });
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hash = await bcrypt.hash(newPassword, salt);

//     // Update employee password
//     await prisma.employee.update({
//       where: { employeeID: reset.employeeID },
//       data: { password: hash }
//     });

//     // Delete token record
//     await prisma.passwordReset.delete({ where: { token } });

//     res.json({ ok: true, message: 'Password updated' });
//   } catch (err) {
//     console.error('POST /api/auth/reset-confirm error', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// module.exports = router;

// server/routes/auth.js
// Modified login to perform a simple email+password check against the Employee table.
// Returns { success: true, employee: { ... } } on success (no JWT/token).
// Other routes (reset-request, reset-confirm) kept intact.

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../prismaClient');

// Helper: pick safe employee fields to return (no password)
function safeEmployee(emp) {
  if (!emp) return null;
  const { password, ...rest } = emp;
  return rest;
}

// POST /api/auth/login
// Body: { email, password }
// This route performs a plain credential check and returns the employee record on success.
// NOTE: This intentionally does NOT issue tokens — it's a simple sessionless check per request.
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  try {
    const employee = await prisma.employee.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } }
    });

    if (!employee) return res.status(401).json({ error: 'Invalid credentials' });

    const hash = employee.password;
    if (!hash) return res.status(401).json({ error: 'No password set for this account' });

    const ok = await bcrypt.compare(password, hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // Return safe employee object (without password)
    return res.json({ success: true, employee: safeEmployee(employee) });
  } catch (err) {
    console.error('POST /api/auth/login error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/*
  The rest of the file (password reset endpoints) can remain as-is.
  If you already have reset-request / reset-confirm routes below in this file,
  leave them unchanged. If not, implement them as needed.
*/

module.exports = router;