// server/routes/zones.js
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

router.get('/', async (req, res) => {
  try {
    const zones = await prisma.zone.findMany();
    res.json(zones);
  } catch (err) {
    console.error('GET /api/zones error', err);
    res.status(500).json({ error: 'Failed to fetch zones' });
  }
});

router.post('/', async (req, res) => {
  try {
    const zone = await prisma.zone.create({ data: req.body });
    res.status(201).json(zone);
  } catch (err) {
    console.error('POST /api/zones error', err);
    res.status(500).json({ error: 'Failed to create zone' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const zone = await prisma.zone.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(zone);
  } catch (err) {
    console.error('PUT /api/zones/:id error', err);
    res.status(500).json({ error: 'Failed to update zone' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.zone.delete({ where: { id: req.params.id } });
    res.json({ message: 'Zone deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/zones/:id error', err);
    res.status(500).json({ error: 'Failed to delete zone' });
  }
});

module.exports = router;
