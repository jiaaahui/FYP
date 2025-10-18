/**
 * Auto-generated CRUD routes for all models in prisma/schema.prisma.
 *
 * Register the exported router in your Express app:
 *   const crudRouter = require('./routes/generatedCrud');
 *   app.use('/api', crudRouter);
 *
 * Important:
 * - Ensure you ran `npx prisma generate` so the generated client exists at ../generated/prisma.
 * - This file exposes endpoints for each model under /api/<modelName>
 *
 * Example endpoints:
 *   GET    /api/app_user
 *   GET    /api/app_user/:user_id
 *   POST   /api/app_user
 *   PUT    /api/app_user/:user_id
 *   DELETE /api/app_user/:user_id
 *
 * Change: create (POST) now auto-generates a UUID for the primary key if
 * the request body does not include the primary key field. This centralises
 * id generation server-side.
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../prismaClient');

const router = express.Router();

// Map model -> primary key field name (as found in your prisma/schema.prisma)
const MODEL_PK_MAP = {
  app_user: 'user_id',
  building: 'id',
  chats: 'id',
  customer: 'id',
  employee: 'id',
  employee_team_assignment: 'id',
  employeeteamassignment: 'id',
  lorry_trip: 'lorry_trip_id',
  lorrytrip: 'id',
  order_product: 'id',
  orderproduct: 'id',
  orders: 'id',
  orders_rel: 'order_id',
  product: 'id',
  routing_cache: 'id',
  routingcache: 'id',
  team: 'id',
  timeslot: 'id',
  timeslot_order: 'id',
  truck: 'id',
  truck_zone: 'id',
  truckzone: 'id',
  users: 'id',
  zone: 'id',
};

// Helper to create a router for a model
function createModelRouter(modelName, pk) {
  const r = express.Router();

  // list
  r.get('/', async (req, res) => {
    try {
      const items = await prisma[modelName].findMany();
      res.json(items);
    } catch (err) {
      console.error(`Error listing ${modelName}:`, err);
      res.status(500).json({ error: 'Unable to list records' });
    }
  });

  // read
  r.get(`/:${pk}`, async (req, res) => {
    const pkValue = req.params[pk];
    try {
      const item = await prisma[modelName].findUnique({
        where: { [pk]: pkValue },
      });
      if (!item) return res.status(404).json({ error: `${modelName} not found` });
      res.json(item);
    } catch (err) {
      console.error(`Error fetching ${modelName} ${pkValue}:`, err);
      res.status(500).json({ error: 'Unable to fetch record' });
    }
  });

  // create (now auto-generates PK if missing)
  r.post('/', async (req, res) => {
    // Expect client to send an object matching the model fields.
    // For models that keep properties inside a JSON 'data' column,
    // clients will typically send { data: { ... } }.
    const incoming = req.body || {};

    // Ensure the primary key exists. If not provided, generate a UUID (string).
    if (incoming[pk] == null) {
      // only generate if the schema expects a string primary key; in your schema most PKs are String
      incoming[pk] = uuidv4();
    }

    try {
      const created = await prisma[modelName].create({ data: incoming });
      res.status(201).json(created);
    } catch (err) {
      console.error(`Error creating ${modelName}:`, err);
      res.status(500).json({ error: 'Unable to create record', details: err.message });
    }
  });

  // update
  r.put(`/:${pk}`, async (req, res) => {
    const pkValue = req.params[pk];
    const data = req.body;
    try {
      const updated = await prisma[modelName].update({
        where: { [pk]: pkValue },
        data,
      });
      res.json(updated);
    } catch (err) {
      console.error(`Error updating ${modelName} ${pkValue}:`, err);
      // Prisma error for not found is P2025
      if (err.code === 'P2025') {
        return res.status(404).json({ error: `${modelName} not found` });
      }
      res.status(500).json({ error: 'Unable to update record', details: err.message });
    }
  });

  // delete
  r.delete(`/:${pk}`, async (req, res) => {
    const pkValue = req.params[pk];
    try {
      await prisma[modelName].delete({ where: { [pk]: pkValue } });
      res.status(204).end();
    } catch (err) {
      console.error(`Error deleting ${modelName} ${pkValue}:`, err);
      if (err.code === 'P2025') {
        return res.status(404).json({ error: `${modelName} not found` });
      }
      res.status(500).json({ error: 'Unable to delete record', details: err.message });
    }
  });

  return r;
}

// Register routers under /api/<modelName>
Object.entries(MODEL_PK_MAP).forEach(([model, pk]) => {
  router.use(`/${model}`, createModelRouter(model, pk));
});

module.exports = router;