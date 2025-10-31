// server/routes/reports.js
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

router.get('/', async (req, res) => {
  try {
    const reports = await prisma.reports.findMany();
    res.json(reports);
  } catch (err) {
    console.error('GET /api/reports error', err);
    res.status(500).json({ error: 'Failed to fetch reports', details: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const report = await prisma.reports.create({ data: req.body });
    res.status(201).json(report);
  } catch (err) {
    console.error('POST /api/reports error', err);
    res.status(500).json({ error: 'Failed to create report', details: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const report = await prisma.reports.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(report);
  } catch (err) {
    console.error('PUT /api/reports/:id error', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.status(500).json({ error: 'Failed to update report', details: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.reports.delete({ where: { id: req.params.id } });
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/reports/:id error', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.status(500).json({ error: 'Failed to delete report', details: err.message });
  }
});

module.exports = router;
