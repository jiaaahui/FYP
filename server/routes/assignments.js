// server/routes/assignments.js
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

router.get('/', async (req, res) => {
  try {
    const assignments = await prisma.employeeTeamAssignment.findMany({
      include: { employee: true, team: true }
    });
    res.json(assignments);
  } catch (err) {
    console.error('GET /api/assignments error', err);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

router.post('/', async (req, res) => {
  try {
    const assignment = await prisma.employeeTeamAssignment.create({ data: req.body });
    res.status(201).json(assignment);
  } catch (err) {
    console.error('POST /api/assignments error', err);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.employeeTeamAssignment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/assignments/:id error', err);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

module.exports = router;
