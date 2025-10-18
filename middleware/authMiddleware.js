// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const JWT_SECRET = process.env.JWT_SECRET;

async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });

  const token = auth.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Attach employee profile to req.user (without password)
    const employee = await prisma.employee.findUnique({
      where: { employeeID: payload.employeeID },
      select: {
        employeeID: true, name: true, email: true, role: true, active_flag: true, displayName: true
      }
    });
    if (!employee) return res.status(401).json({ error: 'Invalid token' });
    req.user = employee;
    next();
  } catch (err) {
    console.warn('authMiddleware token error', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;