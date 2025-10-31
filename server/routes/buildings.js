// server/routes/buildings.js
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

router.get('/', async (req, res) => {
  try {
    const buildings = await prisma.building.findMany({
      include: { zone: true }
    });
    res.json(buildings);
  } catch (err) {
    console.error('GET /api/buildings error', err);
    res.status(500).json({ error: 'Failed to fetch buildings' });
  }
});

router.post('/', async (req, res) => {
  try {
    const building = await prisma.building.create({ data: req.body });
    res.status(201).json(building);
  } catch (err) {
    console.error('POST /api/buildings error', err);
    res.status(500).json({ error: 'Failed to create building' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const building = await prisma.building.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(building);
  } catch (err) {
    console.error('PUT /api/buildings/:id error', err);
    res.status(500).json({ error: 'Failed to update building' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.building.delete({ where: { id: req.params.id } });
    res.json({ message: 'Building deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/buildings/:id error', err);
    res.status(500).json({ error: 'Failed to delete building' });
  }
});

module.exports = router;
