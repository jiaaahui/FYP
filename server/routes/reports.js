// server/routes/reports.js
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

router.get('/', async (req, res) => {
  try {
    const reports = await prisma.report.findMany();
    res.json(reports);
  } catch (err) {
    console.error('GET /api/reports error', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

router.post('/', async (req, res) => {
  try {
    const report = await prisma.report.create({ data: req.body });
    res.status(201).json(report);
  } catch (err) {
    console.error('POST /api/reports error', err);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(report);
  } catch (err) {
    console.error('PUT /api/reports/:id error', err);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.report.delete({ where: { id: req.params.id } });
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/reports/:id error', err);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

module.exports = router;
