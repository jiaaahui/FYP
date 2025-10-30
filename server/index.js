// name=server/index.js
// Simple Express API exposing read endpoints for the migrated PostgreSQL data via Prisma.
// Usage:
//  - Set DATABASE_URL and GOOGLE_APPLICATION_CREDENTIALS in server/.env or environment.
//  - npm install
//  - npm run dev   (or npm start)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 1000;

function parsePaging(req) {
  const limit = Math.min(Number(req.query.limit) || DEFAULT_LIMIT, MAX_LIMIT);
  const offset = Number(req.query.offset) || 0;
  return { limit, offset };
}

// Helper: find by id OR legacyId
async function findByIdOrLegacy(model, param) {
  // model is prisma model accessor (prisma.role, prisma.employee etc.)
  // Try by primary id first, then by legacyId
  let record = null;
  try {
    record = await model.findUnique({ where: { id: param } });
  } catch (e) {
    // ignore - some models may not have id unique named 'id' (but our schema uses id)
  }
  if (record) return record;
  // try legacyId route
  try {
    record = await model.findUnique({ where: { legacyId: param } });
    if (record) return record;
  } catch (e) {
    // fallback: findFirst by legacyId (if unique constraint differs)
    try {
      record = await model.findFirst({ where: { legacyId: param } });
      if (record) return record;
    } catch (e2) {
      // ignore
    }
  }
  // final fallback: try employeeIdStr / orderIdStr etc
  try {
    record = await model.findFirst({ where: { OR: [{ employeeIdStr: param }, { orderIdStr: param }, { buildingIdStr: param }, { productIdStr: param }, { customerIdStr: param }, { truckIdStr: param }, { lorryTripIdStr: param }, { teamIdStr: param }] } });
    if (record) return record;
  } catch (e) {
    // ignore
  }
  return null;
}

// Generic list endpoint generator
function createListEndpoint(path, modelAccessor, include = {}, extraHandlers = {}) {
  app.get(path, async (req, res) => {
    const { limit, offset } = parsePaging(req);
    try {
      const items = await modelAccessor.findMany({
        take: limit,
        skip: offset,
        include
      });
      const total = await modelAccessor.count();
      res.json({ meta: { total, limit, offset }, data: items });
    } catch (err) {
      console.error(`GET ${path} error:`, err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get(`${path}/:id`, async (req, res) => {
    const id = req.params.id;
    try {
      const record = await findByIdOrLegacy(modelAccessor, id);
      if (!record) return res.status(404).json({ error: 'Not found' });
      // optionally include related data if extraHandlers provided
      res.json(record);
    } catch (err) {
      console.error(`GET ${path}/:id error:`, err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}

// --- Routes ---
// Roles
createListEndpoint('/api/roles', prisma.role);

// Teams
createListEndpoint('/api/teams', prisma.team, {
  assignments: { include: { employee: true } }
});

// Zones
createListEndpoint('/api/zones', prisma.zone, {
  buildings: true
});

// Buildings (include zone)
createListEndpoint('/api/buildings', prisma.building, {
  zone: true
});

// Products
createListEndpoint('/api/products', prisma.product);

// Customers
createListEndpoint('/api/customers', prisma.customer, {
  orders: { take: 20 } // small sample of orders per customer
});

// Employees (include role and team assignments)
createListEndpoint('/api/employees', prisma.employee, {
  role: true,
  teamAssignments: { include: { team: true } }
});

// Teams assignments - separate list
createListEndpoint('/api/assignments', prisma.employeeTeamAssignment, {
  employee: true,
  team: true
});

// Trucks and TruckZones
createListEndpoint('/api/trucks', prisma.truck, { truckZones: true });
createListEndpoint('/api/truck-zones', prisma.truckZone, { zone: true, truck: true });

// TimeSlots
createListEndpoint('/api/time-slots', prisma.timeSlot);

// Orders (include relations and orderProducts)
app.get('/api/orders', async (req, res) => {
  const { limit, offset } = parsePaging(req);
  try {
    const items = await prisma.order.findMany({
      take: limit,
      skip: offset,
      include: {
        customer: true,
        employee: true,
        building: true,
        orderProducts: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    const total = await prisma.order.count();
    res.json({ meta: { total, limit, offset }, data: items });
  } catch (err) {
    console.error('GET /api/orders error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  const id = req.params.id;
  try {
    let order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      // try by legacyId mapping
      order = await prisma.order.findUnique({ where: { legacyId: id } });
    }
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const full = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        customer: true,
        employee: true,
        building: true,
        orderProducts: { include: { product: true } }
      }
    });
    res.json(full);
  } catch (err) {
    console.error('GET /api/orders/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// OrderProducts
createListEndpoint('/api/order-products', prisma.orderProduct, {
  order: true,
  product: true
});

// Reports, Chats, AccessLogs
createListEndpoint('/api/reports', prisma.report);
createListEndpoint('/api/chats', prisma.chat);
createListEndpoint('/api/access-logs', prisma.accessLog);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    res.json({ ok: true, time: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Simple search endpoints (optional) - example: search employees by name
app.get('/api/search/employees', async (req, res) => {
  const q = (req.query.q || '').toString();
  if (!q) return res.status(400).json({ error: 'q param required' });
  try {
    const items = await prisma.employee.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      take: 50
    });
    res.json({ meta: { total: items.length }, data: items });
  } catch (err) {
    console.error('GET /api/search/employees error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  console.log('API examples: GET /api/employees, /api/orders, /api/buildings');
});

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});