// server/routes/orders.js
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

router.get('/', async (req, res) => {
  try {
    const orders = await prisma.orders.findMany({
      include: {
        customers: true,
        employees: true,
        buildings: true,
        order_products: { include: { products: true } }
      }
    });
    res.json(orders);
  } catch (err) {
    console.error('GET /api/orders error', err);
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { customer, building, employee, ...data } = req.body;
    const createData = { ...data };
    if (customer) createData.customer_id = customer;
    if (building) createData.building_id = building;
    if (employee) createData.employee_id = employee;

    const order = await prisma.orders.create({
      data: createData,
      include: {
        customers: true,
        employees: true,
        buildings: true,
        order_products: { include: { products: true } }
      }
    });
    res.status(201).json(order);
  } catch (err) {
    console.error('POST /api/orders error', err);
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { customer, building, employee, ...data } = req.body;
    const updateData = { ...data };
    if (customer) updateData.customer_id = customer;
    if (building) updateData.building_id = building;
    if (employee) updateData.employee_id = employee;

    const order = await prisma.orders.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        customers: true,
        employees: true,
        buildings: true,
        order_products: { include: { products: true } }
      }
    });
    res.json(order);
  } catch (err) {
    console.error('PUT /api/orders/:id error', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(500).json({ error: 'Failed to update order', details: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.orders.delete({ where: { id: req.params.id } });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/orders/:id error', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(500).json({ error: 'Failed to delete order', details: err.message });
  }
});

module.exports = router;
