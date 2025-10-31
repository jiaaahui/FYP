// server/routes/customers.js
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

router.get('/', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany();
    res.json(customers);
  } catch (err) {
    console.error('GET /api/customers error', err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

router.post('/', async (req, res) => {
  try {
    const customer = await prisma.customer.create({ data: req.body });
    res.status(201).json(customer);
  } catch (err) {
    console.error('POST /api/customers error', err);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(customer);
  } catch (err) {
    console.error('PUT /api/customers/:id error', err);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.customer.delete({ where: { id: req.params.id } });
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/customers/:id error', err);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

module.exports = router;
