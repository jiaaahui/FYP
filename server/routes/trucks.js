// server/routes/trucks.js
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET /api/trucks
router.get('/', async (req, res) => {
  try {
    const trucks = await prisma.truck.findMany({
      include: { truckZones: { include: { zone: true } } }
    });
    res.json(trucks);
  } catch (err) {
    console.error('GET /api/trucks error', err);
    res.status(500).json({ error: 'Failed to fetch trucks' });
  }
});

// POST /api/trucks
router.post('/', async (req, res) => {
  try {
    const truck = await prisma.truck.create({ data: req.body });
    res.status(201).json(truck);
  } catch (err) {
    console.error('POST /api/trucks error', err);
    res.status(500).json({ error: 'Failed to create truck' });
  }
});

// PUT /api/trucks/:id
router.put('/:id', async (req, res) => {
  try {
    const truck = await prisma.truck.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(truck);
  } catch (err) {
    console.error('PUT /api/trucks/:id error', err);
    res.status(500).json({ error: 'Failed to update truck' });
  }
});

// DELETE /api/trucks/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.truck.delete({ where: { id: req.params.id } });
    res.json({ message: 'Truck deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/trucks/:id error', err);
    res.status(500).json({ error: 'Failed to delete truck' });
  }
});

module.exports = router;
