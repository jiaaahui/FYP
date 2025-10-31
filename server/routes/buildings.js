// server/routes/buildings.js
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

router.get('/', async (req, res) => {
  try {
    const buildings = await prisma.buildings.findMany({
      include: { zone: true }
    });
    res.json(buildings);
  } catch (err) {
    console.error('GET /api/buildings error', err);
    res.status(500).json({ error: 'Failed to fetch buildings', details: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { zone, ...data } = req.body;
    const createData = { ...data };
    if (zone) createData.zoneId = zone;

    const building = await prisma.buildings.create({
      data: createData,
      include: { zone: true }
    });
    res.status(201).json(building);
  } catch (err) {
    console.error('POST /api/buildings error', err);
    res.status(500).json({ error: 'Failed to create building', details: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { zone, ...data } = req.body;
    const updateData = { ...data };
    if (zone) updateData.zoneId = zone;

    const building = await prisma.buildings.update({
      where: { id: req.params.id },
      data: updateData,
      include: { zone: true }
    });
    res.json(building);
  } catch (err) {
    console.error('PUT /api/buildings/:id error', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Building not found' });
    }
    res.status(500).json({ error: 'Failed to update building', details: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.buildings.delete({ where: { id: req.params.id } });
    res.json({ message: 'Building deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/buildings/:id error', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Building not found' });
    }
    res.status(500).json({ error: 'Failed to delete building', details: err.message });
  }
});

module.exports = router;
