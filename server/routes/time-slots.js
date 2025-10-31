// server/routes/time-slots.js
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

router.get('/', async (req, res) => {
  try {
    const timeSlots = await prisma.timeSlot.findMany();
    res.json(timeSlots);
  } catch (err) {
    console.error('GET /api/time-slots error', err);
    res.status(500).json({ error: 'Failed to fetch time slots' });
  }
});

router.post('/', async (req, res) => {
  try {
    const timeSlot = await prisma.timeSlot.create({ data: req.body });
    res.status(201).json(timeSlot);
  } catch (err) {
    console.error('POST /api/time-slots error', err);
    res.status(500).json({ error: 'Failed to create time slot' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const timeSlot = await prisma.timeSlot.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(timeSlot);
  } catch (err) {
    console.error('PUT /api/time-slots/:id error', err);
    res.status(500).json({ error: 'Failed to update time slot' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.timeSlot.delete({ where: { id: req.params.id } });
    res.json({ message: 'Time slot deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/time-slots/:id error', err);
    res.status(500).json({ error: 'Failed to delete time slot' });
  }
});

module.exports = router;
