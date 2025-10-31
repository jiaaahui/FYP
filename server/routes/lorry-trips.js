// server/routes/lorry-trips.js
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

router.get('/', async (req, res) => {
  try {
    const lorryTrips = await prisma.lorryTrip.findMany({
      include: { truck: true }
    });
    res.json(lorryTrips);
  } catch (err) {
    console.error('GET /api/lorry-trips error', err);
    res.status(500).json({ error: 'Failed to fetch lorry trips' });
  }
});

router.post('/', async (req, res) => {
  try {
    const lorryTrip = await prisma.lorryTrip.create({ data: req.body });
    res.status(201).json(lorryTrip);
  } catch (err) {
    console.error('POST /api/lorry-trips error', err);
    res.status(500).json({ error: 'Failed to create lorry trip' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const lorryTrip = await prisma.lorryTrip.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(lorryTrip);
  } catch (err) {
    console.error('PUT /api/lorry-trips/:id error', err);
    res.status(500).json({ error: 'Failed to update lorry trip' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.lorryTrip.delete({ where: { id: req.params.id } });
    res.json({ message: 'Lorry trip deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/lorry-trips/:id error', err);
    res.status(500).json({ error: 'Failed to delete lorry trip' });
  }
});

module.exports = router;
