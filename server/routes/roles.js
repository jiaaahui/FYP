// server/routes/roles.js
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

router.get('/', async (req, res) => {
  try {
    const roles = await prisma.roles.findMany();
    res.json(roles);
  } catch (err) {
    console.error('GET /api/roles error', err);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

router.post('/', async (req, res) => {
  try {
    const role = await prisma.roles.create({ data: req.body });
    res.status(201).json(role);
  } catch (err) {
    console.error('POST /api/roles error', err);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const role = await prisma.roles.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(role);
  } catch (err) {
    console.error('PUT /api/roles/:id error', err);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.roles.delete({ where: { id: req.params.id } });
    res.json({ message: 'Role deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/roles/:id error', err);
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

module.exports = router;
