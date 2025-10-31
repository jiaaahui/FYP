// server/routes/orders.js
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

router.get('/', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        employee: true,
        building: true,
        orderProducts: { include: { product: true } }
      }
    });
    res.json(orders);
  } catch (err) {
    console.error('GET /api/orders error', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.post('/', async (req, res) => {
  try {
    const order = await prisma.order.create({ data: req.body });
    res.status(201).json(order);
  } catch (err) {
    console.error('POST /api/orders error', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(order);
  } catch (err) {
    console.error('PUT /api/orders/:id error', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.order.delete({ where: { id: req.params.id } });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/orders/:id error', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;
