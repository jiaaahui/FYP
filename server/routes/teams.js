// server/routes/teams.js
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

router.get('/', async (req, res) => {
  try {
    const teams = await prisma.teams.findMany({
      include: { assignments: { include: { employee: true } } }
    });
    res.json(teams);
  } catch (err) {
    console.error('GET /api/teams error', err);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

router.post('/', async (req, res) => {
  try {
    const team = await prisma.teams.create({ data: req.body });
    res.status(201).json(team);
  } catch (err) {
    console.error('POST /api/teams error', err);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const team = await prisma.teams.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(team);
  } catch (err) {
    console.error('PUT /api/teams/:id error', err);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.teams.delete({ where: { id: req.params.id } });
    res.json({ message: 'Team deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/teams/:id error', err);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

module.exports = router;
