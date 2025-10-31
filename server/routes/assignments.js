// server/routes/assignments.js
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

router.get('/', async (req, res) => {
  try {
    const assignments = await prisma.employee_team_assignments.findMany({
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
    const { employee, team, ...data } = req.body;
    console.log('Assignment body:', req.body);

    // Convert relation fields to foreign keys
    const createData = { ...data };
    if (employee) createData.employeeId = employee;
    if (team) createData.teamId = team;

    const assignment = await prisma.employee_team_assignments.create({
      data: createData,
      include: { employee: true, team: true }
    });
    res.status(201).json(assignment);
  } catch (err) {
    console.error('POST /api/assignments error', err);
    res.status(500).json({ error: 'Failed to create assignment', details: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { employee, team, ...data } = req.body;

    // Convert relation fields to foreign keys
    const updateData = { ...data };
    if (employee !== undefined) updateData.employeeId = employee || null;
    if (team !== undefined) updateData.teamId = team || null;

    const assignment = await prisma.employee_team_assignments.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
      include: { employee: true, team: true }
    });
    res.json(assignment);
  } catch (err) {
    console.error('PUT /api/assignments/:id error', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.status(500).json({ error: 'Failed to update assignment', details: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.employee_team_assignments.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/assignments/:id error', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

module.exports = router;
