// server/routes/time-slots.js
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

router.get('/', async (req, res) => {
  try {
    const timeSlots = await prisma.time_slots.findMany();
    res.json(timeSlots);
  } catch (err) {
    console.error('GET /api/time-slots error', err);
    res.status(500).json({ error: 'Failed to fetch time slots', details: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const timeSlot = await prisma.time_slots.create({ data: req.body });
    res.status(201).json(timeSlot);
  } catch (err) {
    console.error('POST /api/time-slots error', err);
    res.status(500).json({ error: 'Failed to create time slot', details: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const timeSlot = await prisma.time_slots.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(timeSlot);
  } catch (err) {
    console.error('PUT /api/time-slots/:id error', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Time slot not found' });
    }
    res.status(500).json({ error: 'Failed to update time slot', details: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.time_slots.delete({ where: { id: req.params.id } });
    res.json({ message: 'Time slot deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/time-slots/:id error', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Time slot not found' });
    }
    res.status(500).json({ error: 'Failed to delete time slot', details: err.message });
  }
});

module.exports = router;
