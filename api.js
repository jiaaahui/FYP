/**
 * server/all_crud_api.js
 *
 * Single-file Express API implementing CRUD for all entities in your normalized schema,
 * plus an updated BuildingInfo GET that returns building + zone + recent orders (with products & customer & timeslot).
 *
 * Usage:
 * 1. Place this file in server/ alongside prismaClient.js (which should export Prisma client).
 * 2. Install deps: npm install express dotenv
 * 3. Ensure prismaClient.js exists and Prisma client generated (npx prisma generate).
 * 4. Run: node server/all_crud_api.js
 *
 * Notes:
 * - Endpoints are mounted at /api/<entity>.
 * - Composite-key deletes/reads use the Prisma composite key helpers (e.g., orderID_productID).
 * - This file intentionally keeps all entities in one place per your request.
 */

require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

const prisma = require('./prismaClient'); // expects server/prismaClient.js exporting PrismaClient instance

// Helper: safe model accessor (Prisma client properties are lowercase model names)
const M = (modelName) => {
  // Convert first char to lowercase to match prisma client name (e.g., Building -> building)
  const key = modelName[0].toLowerCase() + modelName.slice(1);
  return prisma[key];
};

/* ---- Buildings---- */
app.get('/api/buildings', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 1000);
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const skip = (page - 1) * limit;
    const items = await M('Building').findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    res.json(items);
  } catch (err) {
    console.error('GET /api/buildings', err);
    res.status(500).json({ error: 'server error' });
  }
});
app.get('/api/buildings/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const row = await M('Building').findUnique({ where: { buildingID: id }});
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json(row);
  } catch (err) {
    console.error('GET /api/buildings/:id', err);
    res.status(500).json({ error: 'server error' });
  }
});
app.post('/api/buildings', async (req, res) => {
  try {
    const b = req.body;
    const created = await M('Building').create({
      data: {
        buildingID: b.buildingID,
        buildingName: b.buildingName ?? null,
        housingType: b.housingType ?? null,
        postalCode: b.postalCode ?? null,
        zoneID: b.zoneID ?? null,
        vehicleSizeLimit: b.vehicleSizeLimit ?? null,
        vehicleLengthLimit: b.vehicleLengthLimit ?? null,
        vehicleWidthLimit: b.vehicleWidthLimit ?? null,
        loadingBayAvailable: b.loadingBayAvailable ?? null,
        liftAvailable: b.liftAvailable ?? null,
        stairsAvailable: b.stairsAvailable ?? null,
        narrowDoorways: b.narrowDoorways ?? null,
        parkingDistance: b.parkingDistance ?? null,
        preRegistrationRequired: b.preRegistrationRequired ?? null,
        accessTimeWindowStart: b.accessTimeWindowStart ?? null,
        accessTimeWindowEnd: b.accessTimeWindowEnd ?? null,
        notes: b.notes ?? null,
        specialEquipmentNeeded: b.specialEquipmentNeeded ?? null,
        liftDimensions: b.liftDimensions ?? null,
        customerID: b.customerID ?? null,
        createdAt: b.createdAt ? new Date(b.createdAt) : undefined,
        updatedAt: b.updatedAt ? new Date(b.updatedAt) : undefined
      }
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/buildings', err);
    res.status(500).json({ error: 'server error' });
  }
});
app.put('/api/buildings/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const updated = await M('Building').update({
      where: { buildingID: id },
      data: {
        buildingName: body.buildingName,
        housingType: body.housingType,
        postalCode: body.postalCode,
        zoneID: body.zoneID,
        vehicleSizeLimit: body.vehicleSizeLimit,
        vehicleLengthLimit: body.vehicleLengthLimit ?? null,
        vehicleWidthLimit: body.vehicleWidthLimit ?? null,
        loadingBayAvailable: body.loadingBayAvailable,
        liftAvailable: body.liftAvailable,
        stairsAvailable: body.stairsAvailable,
        narrowDoorways: body.narrowDoorways,
        parkingDistance: body.parkingDistance ?? null,
        preRegistrationRequired: body.preRegistrationRequired,
        accessTimeWindowStart: body.accessTimeWindowStart,
        accessTimeWindowEnd: body.accessTimeWindowEnd,
        notes: body.notes,
        specialEquipmentNeeded: body.specialEquipmentNeeded,
        liftDimensions: body.liftDimensions,
        customerID: body.customerID,
        updatedAt: new Date()
      }
    });
    res.json(updated);
  } catch (err) {
    console.error('PUT /api/buildings/:id', err);
    if (err && err.code === 'P2025') return res.status(404).json({ error: 'not found' });
    res.status(500).json({ error: 'server error' });
  }
});
app.delete('/api/buildings/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await M('Building').delete({ where: { buildingID: id }});
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/buildings/:id', err);
    res.status(500).json({ error: 'server error' });
  }
});

/* ---- Customer ---- */
app.get('/api/customers', async (req, res) => {
  const items = await M('Customer').findMany({ take: 500, orderBy: { createdAt: 'desc' }});
  res.json(items);
});
app.get('/api/customers/:id', async (req, res) => {
  const r = await M('Customer').findUnique({ where: { customerID: req.params.id }});
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json(r);
});
app.post('/api/customers', async (req, res) => {
  const b = req.body;
  const created = await M('Customer').create({ data: {
    customerID: b.customerID,
    name: b.name,
    displayName: b.displayName,
    email: b.email,
    phone: b.phone,
    address: b.address,
    city: b.city,
    state: b.state,
    postcode: b.postcode,
    bio: b.bio,
    notificationsEnabled: b.notificationsEnabled,
    createdAt: b.createdAt ? new Date(b.createdAt) : undefined
  }});
  res.status(201).json(created);
});
app.put('/api/customers/:id', async (req, res) => {
  try {
    const updated = await M('Customer').update({ where: { customerID: req.params.id }, data: req.body });
    res.json(updated);
  } catch (err) {
    if (err && err.code === 'P2025') return res.status(404).json({ error: 'not found' });
    res.status(500).json({ error: 'server error' });
  }
});
app.delete('/api/customers/:id', async (req, res) => {
  await M('Customer').delete({ where: { customerID: req.params.id }});
  res.json({ success: true });
});

/* ---- Employee ---- */
app.get('/api/employees', async (req, res) => {
  try {
    const { email } = req.query;
    if (email) {
      // case-insensitive search by email
      const emp = await prisma.employee.findFirst({
        where: {
          email: { equals: email, mode: 'insensitive' }
        },
        // exclude password from response
        select: {
          employeeID: true,
          name: true,
          email: true,
          contact_number: true,
          role: true,
          active_flag: true,
          displayName: true,
          createdAt: true,
          bio: true
        }
      });
      return res.json(emp ? [emp] : []);
    }

    const items = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        employeeID: true,
        name: true,
        email: true,
        contact_number: true,
        role: true,
        active_flag: true,
        displayName: true,
        createdAt: true,
        bio: true
      }
    });
    res.json(items);
  } catch (err) {
    console.error('GET /api/employees', err);
    res.status(500).json({ error: 'server error' });
  }
});

// Get single employee (do not return password)
app.get('/api/employees/:id', async (req, res) => {
  try {
    const r = await prisma.employee.findUnique({
      where: { employeeID: req.params.id },
      select: {
        employeeID: true,
        name: true,
        email: true,
        contact_number: true,
        role: true,
        active_flag: true,
        displayName: true,
        createdAt: true,
        bio: true
      }
    });
    if (!r) return res.status(404).json({ error: 'not found' });
    res.json(r);
  } catch (err) {
    console.error('GET /api/employees/:id', err);
    res.status(500).json({ error: 'server error' });
  }
});

// Create employee with password
app.post('/api/employees', async (req, res) => {
  try {
    const b = req.body;
    if (!b.email) return res.status(400).json({ error: 'email is required' });
    if (!b.password) return res.status(400).json({ error: 'password is required' });

    // check duplicate email (case-insensitive)
    const existing = await prisma.employee.findFirst({
      where: { email: { equals: b.email, mode: 'insensitive' } }
    });
    if (existing) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(b.password, salt);

    const created = await prisma.employee.create({
      data: {
        employeeID: b.employeeID, // optional: allow server/db to generate if missing
        name: b.name ?? null,
        email: b.email ?? null,
        contact_number: b.contact_number ?? null,
        role: b.role ?? null,
        active_flag: b.active_flag ?? true,
        displayName: b.displayName ?? null,
        createdAt: b.createdAt ? new Date(b.createdAt) : undefined,
        bio: b.bio ?? null,
        password: hash
      },
      select: {
        employeeID: true,
        name: true,
        email: true,
        contact_number: true,
        role: true,
        active_flag: true,
        displayName: true,
        createdAt: true,
        bio: true
      }
    });

    res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/employees', err);
    res.status(500).json({ error: 'server error' });
  }
});

// Update employee (optionally update password if provided)
app.put('/api/employees/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const b = req.body;

    // if email is being updated, ensure uniqueness
    if (b.email) {
      const existing = await prisma.employee.findFirst({
        where: {
          email: { equals: b.email, mode: 'insensitive' },
          NOT: { employeeID: id }
        }
      });
      if (existing) return res.status(409).json({ error: 'Email already exists' });
    }

    const updateData = { ...b };

    // handle password separately: if provided, hash it; if not, don't include it
    if (b.password) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(b.password, salt);
      updateData.password = hash;
    } else {
      delete updateData.password;
    }

    // Avoid sending undefined createdAt etc.
    if (updateData.createdAt) updateData.createdAt = new Date(updateData.createdAt);

    const updated = await prisma.employee.update({
      where: { employeeID: id },
      data: updateData,
      select: {
        employeeID: true,
        name: true,
        email: true,
        contact_number: true,
        role: true,
        active_flag: true,
        displayName: true,
        createdAt: true,
        bio: true
      }
    });

    res.json(updated);
  } catch (err) {
    console.error('PUT /api/employees/:id', err);
    if (err && err.code === 'P2025') return res.status(404).json({ error: 'not found' });
    res.status(500).json({ error: 'server error' });
  }
});

// Delete employee
app.delete('/api/employees/:id', async (req, res) => {
  try {
    await prisma.employee.delete({ where: { employeeID: req.params.id }});
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/employees/:id', err);
    res.status(500).json({ error: 'server error' });
  }
});

/* ---- Team ---- */
app.get('/api/teams', async (req, res) => res.json(await M('Team').findMany()));
app.get('/api/teams/:id', async (req, res) => {
  const r = await M('Team').findUnique({ where: { teamID: req.params.id }});
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json(r);
});
app.post('/api/teams', async (req, res) => res.status(201).json(await M('Team').create({ data: req.body })));
app.put('/api/teams/:id', async (req, res) => {
  try { res.json(await M('Team').update({ where: { teamID: req.params.id }, data: req.body })); }
  catch(e){ if(e.code==='P2025') return res.status(404).json({ error: 'not found' }); res.status(500).json({ error:'server error' }); }
});
app.delete('/api/teams/:id', async (req, res) => { await M('Team').delete({ where: { teamID: req.params.id }}); res.json({ success:true }); });

/* ---- EmployeeTeamAssignment (composite PK) ---- */
app.post('/api/employee-team-assignments', async (req, res) => {
  const { employeeID, teamID } = req.body;
  const created = await prisma.employeeTeamAssignment.create({ data: { employeeID, teamID }});
  res.status(201).json(created);
});
app.get('/api/employee-team-assignments', async (req, res) => res.json(await prisma.employeeTeamAssignment.findMany()));
app.delete('/api/employee-team-assignments/:employeeID/:teamID', async (req, res) => {
  await prisma.employeeTeamAssignment.delete({ where: { employeeID_teamID: { employeeID: req.params.employeeID, teamID: req.params.teamID } }});
  res.json({ success: true });
});

/* ---- Truck ---- */
app.get('/api/trucks', async (req, res) => res.json(await M('Truck').findMany()));
app.get('/api/trucks/:id', async (req, res) => {
  const r = await M('Truck').findUnique({ where: { truckID: req.params.id }});
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json(r);
});
app.post('/api/trucks', async (req, res) => res.status(201).json(await M('Truck').create({ data: req.body })));
app.put('/api/trucks/:id', async (req, res) => {
  try { res.json(await M('Truck').update({ where: { truckID: req.params.id }, data: req.body })); }
  catch(e){ if(e.code==='P2025') return res.status(404).json({ error:'not found' }); res.status(500).json({ error:'server error' }); }
});
app.delete('/api/trucks/:id', async (req, res) => { await M('Truck').delete({ where: { truckID: req.params.id }}); res.json({ success:true }); });

/* ---- TruckZone (composite PK) ---- */
app.post('/api/truckzones', async (req, res) => {
  const { truckID, zoneID, isPrimaryZone } = req.body;
  const created = await prisma.truckZone.create({ data: { truckID, zoneID, isPrimaryZone }});
  res.status(201).json(created);
});
app.get('/api/truckzones', async (req, res) => res.json(await prisma.truckZone.findMany()));
app.delete('/api/truckzones/:truckID/:zoneID', async (req, res) => {
  await prisma.truckZone.delete({ where: { truckID_zoneID: { truckID: req.params.truckID, zoneID: req.params.zoneID } }});
  res.json({ success: true });
});

/* ---- LorryTrip ---- */
app.get('/api/lorrytrips', async (req, res) => res.json(await M('LorryTrip').findMany()));
app.get('/api/lorrytrips/:id', async (req, res) => {
  const r = await M('LorryTrip').findUnique({ where: { lorryTripID: req.params.id }});
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json(r);
});
app.post('/api/lorrytrips', async (req, res) => res.status(201).json(await M('LorryTrip').create({ data: req.body })));
app.put('/api/lorrytrips/:id', async (req, res) => {
  try { res.json(await M('LorryTrip').update({ where: { lorryTripID: req.params.id }, data: req.body })); }
  catch(e){ if(e.code==='P2025') return res.status(404).json({ error:'not found' }); res.status(500).json({ error:'server error' }); }
});
app.delete('/api/lorrytrips/:id', async (req, res) => { await M('LorryTrip').delete({ where: { lorryTripID: req.params.id }}); res.json({ success:true }); });

/* ---- TimeSlot ---- */
app.get('/api/timeslots', async (req, res) => res.json(await M('TimeSlot').findMany()));
app.get('/api/timeslots/:id', async (req, res) => {
  const r = await M('TimeSlot').findUnique({ where: { timeSlotID: req.params.id }});
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json(r);
});
app.post('/api/timeslots', async (req, res) => {
  const b = req.body;
  const created = await M('TimeSlot').create({ data: {
    timeSlotID: b.timeSlotID,
    lorryTripID: b.lorryTripID,
    date: b.date ? new Date(b.date) : null,
    timeWindowStart: b.timeWindowStart,
    timeWindowEnd: b.timeWindowEnd,
    availableFlag: b.availableFlag
  }});
  res.status(201).json(created);
});
app.put('/api/timeslots/:id', async (req, res) => {
  try { res.json(await M('TimeSlot').update({ where: { timeSlotID: req.params.id }, data: req.body })); }
  catch(e){ if(e.code==='P2025') return res.status(404).json({ error:'not found' }); res.status(500).json({ error:'server error' }); }
});
app.delete('/api/timeslots/:id', async (req, res) => { await M('TimeSlot').delete({ where: { timeSlotID: req.params.id }}); res.json({ success:true }); });

/* ---- Product ---- */
app.get('/api/products', async (req, res) => res.json(await M('Product').findMany()));
app.get('/api/products/:id', async (req, res) => {
  const r = await M('Product').findUnique({ where: { productID: req.params.id }});
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json(r);
});
app.post('/api/products', async (req, res) => res.status(201).json(await M('Product').create({ data: req.body })));
app.put('/api/products/:id', async (req, res) => {
  try { res.json(await M('Product').update({ where: { productID: req.params.id }, data: req.body })); }
  catch(e){ if(e.code==='P2025') return res.status(404).json({ error:'not found' }); res.status(500).json({ error:'server error' }); }
});
app.delete('/api/products/:id', async (req, res) => { await M('Product').delete({ where: { productID: req.params.id }}); res.json({ success:true }); });

/* ---- Orders (with products) ---- */
app.get('/api/orders', async (req, res) => res.json(await M('Orders').findMany({ take: 500, orderBy: { createdAt: 'desc' } })));
app.get('/api/orders/:id', async (req, res) => {
  const id = req.params.id;
  const order = await M('Orders').findUnique({
    where: { orderID: id },
    include: { orderProducts: { include: { Product: true } }, Customer: true, TimeSlot: true }
  });
  if (!order) return res.status(404).json({ error: 'not found' });
  res.json(order);
});
app.post('/api/orders', async (req, res) => {
  const b = req.body;
  const created = await M('Orders').create({ data: {
    orderID: b.orderID,
    customerID: b.customerID,
    employeeID: b.employeeID,
    deliveryTeamID: b.deliveryTeamID,
    buildingID: b.buildingID,
    timeSlotID: b.timeSlotID,
    numberOfAttempts: b.numberOfAttempts ?? 0,
    scheduledStartDateTime: b.scheduledStartDateTime ? new Date(b.scheduledStartDateTime) : null,
    scheduledEndDateTime: b.scheduledEndDateTime ? new Date(b.scheduledEndDateTime) : null,
    actualStartDateTime: b.actualStartDateTime ? new Date(b.actualStartDateTime) : null,
    actualEndDateTime: b.actualEndDateTime ? new Date(b.actualEndDateTime) : null,
    actualArrivalDateTime: b.actualArrivalDateTime ? new Date(b.actualArrivalDateTime) : null,
    customerRating: b.customerRating ?? null,
    delayReason: b.delayReason,
    customerFeedback: b.customerFeedback,
    proofOfDeliveryURL: b.proofOfDeliveryURL,
    orderStatus: b.orderStatus,
    createdAt: b.createdAt ? new Date(b.createdAt) : undefined,
    updatedAt: b.updatedAt ? new Date(b.updatedAt) : undefined
  }});
  if (Array.isArray(b.products) && b.products.length) {
    for (const p of b.products) {
      await M('OrderProduct').create({ data: { orderID: created.orderID, productID: p.productID, quantity: p.quantity ?? 1 }});
    }
  }
  res.status(201).json(created);
});
app.put('/api/orders/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await M('Orders').update({ where: { orderID: id }, data: req.body });
    if (Array.isArray(req.body.products)) {
      await M('OrderProduct').deleteMany({ where: { orderID: id }});
      for (const p of req.body.products) {
        await M('OrderProduct').create({ data: { orderID: id, productID: p.productID, quantity: p.quantity ?? 1 }});
      }
    }
    res.json(updated);
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'not found' });
    console.error('PUT /api/orders/:id', e);
    res.status(500).json({ error: 'server error' });
  }
});
app.delete('/api/orders/:id', async (req, res) => {
  const id = req.params.id;
  await M('OrderProduct').deleteMany({ where: { orderID: id }});
  await M('Orders').delete({ where: { orderID: id }});
  res.json({ success: true });
});

/* ---- OrderProduct composite PK endpoints ---- */
app.get('/api/orderproducts', async (req, res) => res.json(await M('OrderProduct').findMany()));
app.post('/api/orderproducts', async (req, res) => {
  const b = req.body;
  const created = await M('OrderProduct').create({ data: { orderID: b.orderID, productID: b.productID, quantity: b.quantity ?? 1 }});
  res.status(201).json(created);
});
app.delete('/api/orderproducts/:orderID/:productID', async (req, res) => {
  await prisma.orderProduct.delete({ where: { orderID_productID: { orderID: req.params.orderID, productID: req.params.productID } }});
  res.json({ success: true });
});

/* ---- Zone ---- */
app.get('/api/zones', async (req, res) => res.json(await M('Zone').findMany()));
app.post('/api/zones', async (req, res) => res.status(201).json(await M('Zone').create({ data: req.body })));
app.get('/api/zones/:id', async (req, res) => {
  const r = await M('Zone').findUnique({ where: { zoneID: req.params.id }});
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json(r);
});
app.put('/api/zones/:id', async (req, res) => {
  try { res.json(await M('Zone').update({ where: { zoneID: req.params.id }, data: req.body })); }
  catch(e){ if(e.code==='P2025') return res.status(404).json({ error:'not found' }); res.status(500).json({ error:'server error' }); }
});
app.delete('/api/zones/:id', async (req, res) => { await M('Zone').delete({ where: { zoneID: req.params.id }}); res.json({ success:true }); });

/* ---- users ---- */
app.get('/api/users', async (req, res) => res.json(await M('users').findMany()));
app.get('/api/users/:id', async (req, res) => {
  const r = await M('users').findUnique({ where: { uid: req.params.id }});
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json(r);
});
app.post('/api/users', async (req, res) => res.status(201).json(await M('users').create({ data: req.body })));
app.put('/api/users/:id', async (req, res) => {
  try { res.json(await M('users').update({ where: { uid: req.params.id }, data: req.body })); }
  catch(e){ if(e.code==='P2025') return res.status(404).json({ error:'not found' }); res.status(500).json({ error:'server error' }); }
});
app.delete('/api/users/:id', async (req, res) => { await M('users').delete({ where: { uid: req.params.id }}); res.json({ success:true }); });

/* ===========================================================================
   Start server
   =========================================================================== */

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`All-CRUD API listening on port ${port}`);
});