// server/routes/truck-zones.js
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET /api/truck-zones
router.get('/', async (req, res) => {
  try {
    const truckZones = await prisma.truck_zones.findMany({
      include: {
        trucks: true,
        zones: true
      }
    });
    res.json(truckZones);
  } catch (err) {
    console.error('GET /api/truck-zones error', err);
    res.status(500).json({ error: 'Failed to fetch truck zones', details: err.message });
  }
});

// POST /api/truck-zones
router.post('/', async (req, res) => {
  try {
    const { truck, zone, ...data } = req.body;
    const createData = { ...data };
    if (truck) createData.truck_id = truck;
    if (zone) createData.zone_id = zone;

    const truckZone = await prisma.truck_zones.create({
      data: createData,
      include: {
        trucks: true,
        zones: true
      }
    });
    res.status(201).json(truckZone);
  } catch (err) {
    console.error('POST /api/truck-zones error', err);
    res.status(500).json({ error: 'Failed to create truck zone', details: err.message });
  }
});

// PUT /api/truck-zones/:id
router.put('/:id', async (req, res) => {
  try {
    const { truck, zone, ...data } = req.body;
    const updateData = { ...data };
    if (truck) updateData.truck_id = truck;
    if (zone) updateData.zone_id = zone;

    const truckZone = await prisma.truck_zones.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        trucks: true,
        zones: true
      }
    });
    res.json(truckZone);
  } catch (err) {
    console.error('PUT /api/truck-zones/:id error', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Truck zone not found' });
    }
    res.status(500).json({ error: 'Failed to update truck zone', details: err.message });
  }
});

// DELETE /api/truck-zones/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.truck_zones.delete({ where: { id: req.params.id } });
    res.json({ message: 'Truck zone deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/truck-zones/:id error', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Truck zone not found' });
    }
    res.status(500).json({ error: 'Failed to delete truck zone', details: err.message });
  }
});

module.exports = router;
