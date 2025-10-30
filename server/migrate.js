// Migration script: Firestore -> Postgres (Prisma) using UUID primary keys
// - Preserves original Firestore IDs in legacyId fields.
// - Creates new records with Prisma-generated UUIDs and stores mapping FirestoreId -> new UUID.
// - Uses that mapping to populate relations (team assignments, order -> employee/building/customer linking, etc.)
//
// Prereqs:
//  - Set GOOGLE_APPLICATION_CREDENTIALS to Firebase Admin service account JSON.
//  - Set DATABASE_URL (Prisma) in .env
//  - npm i firebase-admin @prisma/client dotenv
//  - npx prisma generate
//  - npx prisma db push
//
// Run: node scripts/migrate-firestore-to-postgres-uuids.js
//

const admin = require('firebase-admin');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Initialize Firebase Admin
if (!admin.apps.length) admin.initializeApp();
const fsdb = admin.firestore();

function toDateOrNull(v) {
  if (!v) return null;
  if (typeof v?.toDate === 'function') return v.toDate();
  if (typeof v === 'number') return new Date(v);
  if (typeof v === 'string') {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  if (v instanceof Date) return v;
  return null;
}

// mapping objects: Firestore legacyId -> new UUID (Prisma id)
const maps = {
  roles: new Map(),
  teams: new Map(),
  zones: new Map(),
  buildings: new Map(),
  products: new Map(),
  customers: new Map(),
  employees: new Map(),
  teamsAssignments: new Map(),
  trucks: new Map(),
  truckZones: new Map(),
  timeslots: new Map(),
  orders: new Map(),
  orderProducts: new Map(),
  reports: new Map(),
  chats: new Map(),
  accessLogs: new Map(),
  users: new Map()
};

async function upsertRole(docId, data) {
  const res = await prisma.role.upsert({
    where: { legacyId: docId },
    update: {
      name: data.name || docId,
      permissions: Array.isArray(data.permissions) ? data.permissions : []
    },
    create: {
      legacyId: docId,
      name: data.name || docId,
      permissions: Array.isArray(data.permissions) ? data.permissions : []
    }
  });
  maps.roles.set(docId, res.id);
}

async function migrateRoles() {
  console.log('Migrate Roles...');
  const snap = await fsdb.collection('Roles').get();
  for (const doc of snap.docs) {
    await upsertRole(doc.id, doc.data() || {});
  }
  console.log(`Roles migrated: ${maps.roles.size}`);
}

async function migrateTeams() {
  console.log('Migrate Team...');
  const snap = await fsdb.collection('Team').get();
  for (const doc of snap.docs) {
    const d = doc.data() || {};
    const legacyId = d.TeamID || doc.id;
    const res = await prisma.team.upsert({
      where: { legacyId },
      update: { teamType: d.TeamType || null, teamIdStr: d.TeamID || null },
      create: { legacyId, teamType: d.TeamType || null, teamIdStr: d.TeamID || null }
    });
    maps.teams.set(legacyId, res.id);
  }
  console.log(`Teams migrated: ${maps.teams.size}`);
}

async function migrateZones() {
  console.log('Migrate Zones...');
  const snap = await fsdb.collection('Zone').get();
  for (const doc of snap.docs) {
    const d = doc.data() || {};
    const legacyId = d.ZoneID || doc.id;
    const res = await prisma.zone.upsert({
      where: { legacyId },
      update: { zoneName: d.ZoneName || null, zoneIdStr: d.ZoneID || null },
      create: { legacyId, zoneName: d.ZoneName || null, zoneIdStr: d.ZoneID || null }
    });
    maps.zones.set(legacyId, res.id);
  }
  console.log(`Zones migrated: ${maps.zones.size}`);
}

async function migrateBuildings() {
  console.log('Migrate Buildings...');
  const snap = await fsdb.collection('Building').get();
  for (const doc of snap.docs) {
    const d = doc.data() || {};
    const legacyId = d.BuildingID || doc.id;
    // map zone legacyId -> new UUID if present
    const zoneLegacy = d.ZoneID || null;
    const zoneUuid = zoneLegacy ? maps.zones.get(zoneLegacy) : null;
    const specialEquip = Array.isArray(d.SpecialEquipmentNeeded) ? JSON.stringify(d.SpecialEquipmentNeeded) : (d.SpecialEquipmentNeeded || null);

    const res = await prisma.building.upsert({
      where: { legacyId },
      update: {
        buildingName: d.BuildingName || null,
        housingType: d.HousingType || null,
        specialEquipmentNeeded: specialEquip,
        vehicleSizeLimit: d.VehicleSizeLimit || null,
        vehicleLengthLimit: d.VehicleLengthLimit || null,
        vehicleWidthLimit: d.VehicleWidthLimit || null,
        postalCode: d.PostalCode || null,
        loadingBayAvailable: typeof d.LoadingBayAvailable === 'boolean' ? d.LoadingBayAvailable : null,
        accessTimeWindowStart: d.AccessTimeWindowStart || null,
        accessTimeWindowEnd: d.AccessTimeWindowEnd || null,
        preRegistrationRequired: typeof d.PreRegistrationRequired === 'boolean' ? d.PreRegistrationRequired : null,
        zoneId: zoneUuid || null,
        liftAvailable: typeof d.LiftAvailable === 'boolean' ? d.LiftAvailable : null,
        liftDimensions: d.LiftDimensions || null,
        notes: d.Notes || null,
        parkingDistance: d.ParkingDistance || null,
        narrowDoorways: typeof d.NarrowDoorways === 'boolean' ? d.NarrowDoorways : null,
        updatedAt: toDateOrNull(d.UpdatedAt)
      },
      create: {
        legacyId,
        buildingIdStr: d.BuildingID || null,
        buildingName: d.BuildingName || null,
        housingType: d.HousingType || null,
        specialEquipmentNeeded: specialEquip,
        vehicleSizeLimit: d.VehicleSizeLimit || null,
        vehicleLengthLimit: d.VehicleLengthLimit || null,
        vehicleWidthLimit: d.VehicleWidthLimit || null,
        postalCode: d.PostalCode || null,
        loadingBayAvailable: typeof d.LoadingBayAvailable === 'boolean' ? d.LoadingBayAvailable : null,
        accessTimeWindowStart: d.AccessTimeWindowStart || null,
        accessTimeWindowEnd: d.AccessTimeWindowEnd || null,
        preRegistrationRequired: typeof d.PreRegistrationRequired === 'boolean' ? d.PreRegistrationRequired : null,
        zoneId: zoneUuid || null,
        liftAvailable: typeof d.LiftAvailable === 'boolean' ? d.LiftAvailable : null,
        liftDimensions: d.LiftDimensions || null,
        notes: d.Notes || null,
        parkingDistance: d.ParkingDistance || null,
        narrowDoorways: typeof d.NarrowDoorways === 'boolean' ? d.NarrowDoorways : null,
        updatedAt: toDateOrNull(d.UpdatedAt)
      }
    });
    maps.buildings.set(legacyId, res.id);
  }
  console.log(`Buildings migrated: ${maps.buildings.size}`);
}

async function migrateProducts() {
  console.log('Migrate Products...');
  const snap = await fsdb.collection('Product').get();
  for (const doc of snap.docs) {
    const d = doc.data() || {};
    const legacyId = d.ProductID || doc.id;
    const res = await prisma.product.upsert({
      where: { legacyId },
      update: {
        productName: d.ProductName || null,
        packageLengthCM: d.PackageLengthCM || null,
        packageHeightCM: d.PackageHeightCM || null,
        packageWidthCM: d.PackageWidthCM || null,
        fragileFlag: typeof d.FragileFlag === 'boolean' ? d.FragileFlag : null,
        installerTeamRequiredFlag: typeof d.InstallerTeamRequiredFlag === 'boolean' ? d.InstallerTeamRequiredFlag : null,
        dismantleTimeMin: d.DismantleTimeMin || null,
        dismantleTimeMax: d.DismantleTimeMax || null
      },
      create: {
        legacyId,
        productIdStr: d.ProductID || null,
        productName: d.ProductName || null,
        packageLengthCM: d.PackageLengthCM || null,
        packageHeightCM: d.PackageHeightCM || null,
        packageWidthCM: d.PackageWidthCM || null,
        fragileFlag: typeof d.FragileFlag === 'boolean' ? d.FragileFlag : null,
        installerTeamRequiredFlag: typeof d.InstallerTeamRequiredFlag === 'boolean' ? d.InstallerTeamRequiredFlag : null,
        dismantleTimeMin: d.DismantleTimeMin || null,
        dismantleTimeMax: d.DismantleTimeMax || null
      }
    });
    maps.products.set(legacyId, res.id);
  }
  console.log(`Products migrated: ${maps.products.size}`);
}

async function migrateCustomers() {
  console.log('Migrate Customers...');
  const snap = await fsdb.collection('Customer').get();
  for (const doc of snap.docs) {
    const d = doc.data() || {};
    const legacyId = d.CustomerID || doc.id;
    const res = await prisma.customer.upsert({
      where: { legacyId },
      update: {
        fullName: d.FullName || d.name || null,
        email: d.Email || d.email || null,
        phone: d.PhoneNumber || d.phone || null,
        address: d.Address || d.address || null
      },
      create: {
        legacyId,
        customerIdStr: d.CustomerID || null,
        fullName: d.FullName || d.name || null,
        email: d.Email || d.email || null,
        phone: d.PhoneNumber || d.phone || null,
        address: d.Address || d.address || null
      }
    });
    maps.customers.set(legacyId, res.id);
  }
  console.log(`Customers migrated: ${maps.customers.size}`);
}

async function migrateRolesLookup() {
  // already migrated roles earlier; create a name->UUID map for role name matching
  const roleDocs = await fsdb.collection('Roles').get();
  const nameToUuid = new Map();
  for (const doc of roleDocs.docs) {
    const roleLegacy = doc.id;
    const uuid = maps.roles.get(roleLegacy);
    const name = (doc.data() && doc.data().name) ? doc.data().name.toString().toLowerCase().trim() : null;
    if (name) nameToUuid.set(name, uuid);
  }
  return nameToUuid;
}

async function migrateEmployees() {
  console.log('Migrate Employees...');
  const nameToRoleUuid = await migrateRolesLookup();

  const snap = await fsdb.collection('Employee').get();
  for (const doc of snap.docs) {
    const d = doc.data() || {};
    const legacyId = d.EmployeeID || doc.id;
    const employeeIdStr = d.EmployeeID || null;

    // find role uuid by legacy id or by name
    let roleUuid = null;
    if (d.role) {
      const raw = String(d.role).trim();
      if (maps.roles.has(raw)) roleUuid = maps.roles.get(raw);
      else {
        const low = raw.toLowerCase();
        if (nameToRoleUuid.has(low)) roleUuid = nameToRoleUuid.get(low);
      }
    }

    const res = await prisma.employee.upsert({
      where: { legacyId },
      update: {
        employeeIdStr,
        name: d.name || d.displayName || null,
        displayName: d.displayName || null,
        email: (d.email || '').toString().trim() || null,
        contactNumber: d.contact_number || d.contactNumber || null,
        roleId: roleUuid || null,
        activeFlag: typeof d.active_flag === 'boolean' ? d.active_flag : (d.active !== undefined ? d.active : true),
        password: d.password || null,
        bio: d.bio || null
      },
      create: {
        legacyId,
        employeeIdStr,
        name: d.name || d.displayName || null,
        displayName: d.displayName || null,
        email: (d.email || '').toString().trim() || null,
        contactNumber: d.contact_number || d.contactNumber || null,
        roleId: roleUuid || null,
        activeFlag: typeof d.active_flag === 'boolean' ? d.active_flag : (d.active !== undefined ? d.active : true),
        password: d.password || null,
        bio: d.bio || null
      }
    });

    maps.employees.set(legacyId, res.id);
  }
  console.log(`Employees migrated: ${maps.employees.size}`);
}

async function migrateEmployeeTeamAssignments() {
  console.log('Migrate EmployeeTeamAssignment...');
  const snap = await fsdb.collection('EmployeeTeamAssignment').get();
  for (const doc of snap.docs) {
    const d = doc.data() || {};
    const legacyId = doc.id;
    const empLegacy = d.EmployeeID;
    const teamLegacy = d.TeamID || null;
    if (!empLegacy) continue;
    const employeeUuid = maps.employees.get(empLegacy);
    const teamUuid = teamLegacy ? maps.teams.get(teamLegacy) : null;
    if (!employeeUuid) {
      console.warn('Skipping assignment because employee not migrated yet:', empLegacy);
      continue;
    }
    // skip if team is empty
    if (!teamUuid) {
      // skip or insert with null teamId if you prefer
      continue;
    }
    const res = await prisma.employeeTeamAssignment.create({
      data: {
        legacyId,
        employeeId: employeeUuid,
        teamId: teamUuid,
        assignedAt: toDateOrNull(d.assignedAt)
      }
    });
    // no mapping stored for assignments (unless you need it)
  }
  console.log('EmployeeTeamAssignment migrated.');
}

async function migrateTrucksAndZones() {
  console.log('Migrate Trucks...');
  const truckSnap = await fsdb.collection('Truck').get();
  for (const doc of truckSnap.docs) {
    const d = doc.data() || {};
    const legacyId = d.TruckID || doc.id;
    const res = await prisma.truck.upsert({
      where: { legacyId },
      update: {
        truckIdStr: d.TruckID || null,
        plateNo: d.CarPlate || null,
        lengthCM: d.LengthCM || null,
        widthCM: d.WidthCM || null,
        heightCM: d.HeightCM || null,
        tone: d.Tone || null
      },
      create: {
        legacyId,
        truckIdStr: d.TruckID || null,
        plateNo: d.CarPlate || null,
        lengthCM: d.LengthCM || null,
        widthCM: d.WidthCM || null,
        heightCM: d.HeightCM || null,
        tone: d.Tone || null
      }
    });
    maps.trucks.set(legacyId, res.id);
  }
  console.log(`Trucks migrated: ${maps.trucks.size}`);

  console.log('Migrate TruckZone...');
  const tzSnap = await fsdb.collection('TruckZone').get();
  for (const doc of tzSnap.docs) {
    const d = doc.data() || {};
    const legacyId = doc.id;
    const zoneLegacy = d.ZoneID || null;
    const truckLegacy = d.TruckID || null;
    const zoneUuid = zoneLegacy ? maps.zones.get(zoneLegacy) : null;
    const truckUuid = truckLegacy ? maps.trucks.get(truckLegacy) : null;
    const res = await prisma.truckZone.upsert({
      where: { legacyId },
      update: {
        zoneId: zoneUuid || null,
        isPrimary: !!d.IsPrimaryZone,
        truckId: truckUuid || null
      },
      create: {
        legacyId,
        zoneId: zoneUuid || null,
        isPrimary: !!d.IsPrimaryZone,
        truckId: truckUuid || null
      }
    });
    maps.truckZones.set(legacyId, res.id);
  }
  console.log(`TruckZones migrated: ${maps.truckZones.size}`);
}

async function migrateTimeSlots() {
  console.log('Migrate TimeSlots...');
  const snap = await fsdb.collection('TimeSlot').get();
  for (const doc of snap.docs) {
    const d = doc.data() || {};
    const legacyId = d.id || doc.id;
    const res = await prisma.timeSlot.upsert({
      where: { legacyId },
      update: {
        date: d.Date || null,
        timeWindowStart: d.TimeWindowStart || null,
        timeWindowEnd: d.TimeWindowEnd || null,
        availableFlag: !!d.AvailableFlag
      },
      create: {
        legacyId,
        date: d.Date || null,
        timeWindowStart: d.TimeWindowStart || null,
        timeWindowEnd: d.TimeWindowEnd || null,
        availableFlag: !!d.AvailableFlag
      }
    });
    maps.timeslots.set(legacyId, res.id);
  }
  console.log(`TimeSlots migrated: ${maps.timeslots.size}`);
}

async function migrateOrders() {
  console.log('Migrate Orders...');
  const snap = await fsdb.collection('Order').get();
  for (const doc of snap.docs) {
    const d = doc.data() || {};
    const legacyId = d.OrderID || doc.id;
    const customerUuid = d.CustomerID ? maps.customers.get(d.CustomerID) : null;
    const buildingUuid = d.BuildingID ? maps.buildings.get(d.BuildingID) : null;
    const employeeUuid = d.EmployeeID ? maps.employees.get(d.EmployeeID) : null;
    const timeslotUuid = d.TimeSlotID ? maps.timeslots.get(d.TimeSlotID) : null;

    const res = await prisma.order.upsert({
      where: { legacyId },
      update: {
        orderIdStr: d.OrderID || null,
        customerId: customerUuid || null,
        buildingId: buildingUuid || null,
        employeeId: employeeUuid || null,
        orderStatus: d.OrderStatus || d.status || null,
        numberOfAttempts: d.NumberOfAttempts ? Number(d.NumberOfAttempts) : null,
        customerRating: d.CustomerRating ? Number(d.CustomerRating) : null,
        proofOfDeliveryUrl: d.ProofOfDeliveryURL || null,
        customerFeedback: d.CustomerFeedback || null,
        timeSlotId: timeslotUuid || null,
        scheduledStartDateTime: toDateOrNull(d.ScheduledStartDateTime),
        scheduledEndDateTime: toDateOrNull(d.ScheduledEndDateTime),
        actualStartDateTime: toDateOrNull(d.ActualStartDateTime),
        actualEndDateTime: toDateOrNull(d.ActualEndDateTime),
        actualArrivalDateTime: toDateOrNull(d.ActualArrivalDateTime),
        createdAt: toDateOrNull(d.CreatedAt),
        updatedAt: toDateOrNull(d.UpdatedAt)
      },
      create: {
        legacyId,
        orderIdStr: d.OrderID || null,
        customerId: customerUuid || null,
        buildingId: buildingUuid || null,
        employeeId: employeeUuid || null,
        orderStatus: d.OrderStatus || d.status || null,
        numberOfAttempts: d.NumberOfAttempts ? Number(d.NumberOfAttempts) : null,
        customerRating: d.CustomerRating ? Number(d.CustomerRating) : null,
        proofOfDeliveryUrl: d.ProofOfDeliveryURL || null,
        customerFeedback: d.CustomerFeedback || null,
        timeSlotId: timeslotUuid || null,
        scheduledStartDateTime: toDateOrNull(d.ScheduledStartDateTime),
        scheduledEndDateTime: toDateOrNull(d.ScheduledEndDateTime),
        actualStartDateTime: toDateOrNull(d.ActualStartDateTime),
        actualEndDateTime: toDateOrNull(d.ActualEndDateTime),
        actualArrivalDateTime: toDateOrNull(d.ActualArrivalDateTime),
        createdAt: toDateOrNull(d.CreatedAt),
        updatedAt: toDateOrNull(d.UpdatedAt)
      }
    });
    maps.orders.set(legacyId, res.id);
  }
  console.log(`Orders migrated: ${maps.orders.size}`);
}

async function migrateOrderProducts() {
  console.log('Migrate OrderProducts...');
  const snap = await fsdb.collection('OrderProduct').get();
  for (const doc of snap.docs) {
    const d = doc.data() || {};
    const legacyId = doc.id;
    const orderLegacy = d.OrderID;
    const productLegacy = d.ProductID;
    const orderUuid = orderLegacy ? maps.orders.get(orderLegacy) : null;
    const productUuid = productLegacy ? maps.products.get(productLegacy) : null;
    if (!orderUuid || !productUuid) {
      console.warn('Skipping OrderProduct due to missing FK mapping:', legacyId, orderLegacy, productLegacy);
      continue;
    }
    const qty = d.Quantity ? Number(d.Quantity) : (d.Quantity === '1' ? 1 : 1);
    await prisma.orderProduct.create({
      data: {
        legacyId,
        orderId: orderUuid,
        productId: productUuid,
        quantity: qty,
        dismantleRequired: !!d.DismantleRequired,
        dismantleTimeMin: d.DismantleTimeMin || null,
        dismantleTimeMax: d.DismantleTimeMax || null
      }
    });
  }
  console.log('OrderProducts migrated.');
}

async function migrateReports() {
  console.log('Migrate Reports...');
  const snap = await fsdb.collection('Report').get();
  for (const doc of snap.docs) {
    const d = doc.data() || {};
    const legacyId = doc.id;
    const res = await prisma.report.upsert({
      where: { legacyId },
      update: {
        content: d.Content || d.content || null,
        status: d.Status || d.status || null,
        createdAt: toDateOrNull(d.CreatedAt) || toDateOrNull(d.createdAt)
      },
      create: {
        legacyId,
        content: d.Content || d.content || null,
        status: d.Status || d.status || null,
        createdAt: toDateOrNull(d.CreatedAt) || toDateOrNull(d.createdAt)
      }
    });
    maps.reports.set(legacyId, res.id);
  }
  console.log(`Reports migrated: ${maps.reports.size}`);
}

async function migrateChats() {
  console.log('Migrate Chats...');
  const snap = await fsdb.collection('chats').get();
  for (const doc of snap.docs) {
    const d = doc.data() || {};
    const legacyId = doc.id;
    const res = await prisma.chat.upsert({
      where: { legacyId },
      update: {
        orderNumber: d.orderNumber || null,
        members: d.members ? d.members : null,
        names: d.names ? d.names : null,
        createdAt: toDateOrNull(d.createdAt),
        lastMessageAt: toDateOrNull(d.lastMessageAt)
      },
      create: {
        legacyId,
        orderNumber: d.orderNumber || null,
        members: d.members ? d.members : null,
        names: d.names ? d.names : null,
        createdAt: toDateOrNull(d.createdAt),
        lastMessageAt: toDateOrNull(d.lastMessageAt)
      }
    });
    maps.chats.set(legacyId, res.id);
  }
  console.log(`Chats migrated: ${maps.chats.size}`);
}

async function migrateAccessLogs() {
  console.log('Migrate Access Logs...');
  const snap = await fsdb.collection('access_logs').get();
  for (const doc of snap.docs) {
    const d = doc.data() || {};
    const legacyId = doc.id;
    const res = await prisma.accessLog.upsert({
      where: { legacyId },
      update: {
        changedAt: toDateOrNull(d.timestamp),
        changes: d.changes || null
      },
      create: {
        legacyId,
        changedAt: toDateOrNull(d.timestamp),
        changes: d.changes || null
      }
    });
    maps.accessLogs.set(legacyId, res.id);
  }
  console.log(`Access logs migrated: ${maps.accessLogs.size}`);
}

async function migrateUsersCollection() {
  console.log('Migrate users collection (to Customer model as fallback)...');
  const snap = await fsdb.collection('users').get();
  for (const doc of snap.docs) {
    const d = doc.data() || {};
    const legacyId = doc.id;
    const email = d.email || null;
    // if there's a Customer with same email, skip; else create pseudo-customer
    let skip = false;
    if (email) {
      // check if we already created a customer with that email (maps.customers)
      // Hard way: search in Prisma for existing by email
      const existing = await prisma.customer.findFirst({ where: { email } });
      if (existing) skip = true;
    }
    if (skip) continue;
    const pseudoLegacy = `USR_${legacyId}`;
    const res = await prisma.customer.upsert({
      where: { legacyId: pseudoLegacy },
      update: { fullName: d.displayName || d.name || null, email: d.email || null },
      create: { legacyId: pseudoLegacy, fullName: d.displayName || d.name || null, email: d.email || null }
    });
    maps.users.set(legacyId, res.id);
  }
  console.log(`Users (as customers) migrated: ${maps.users.size}`);
}

async function main() {
  try {
    console.log('Starting Firestore -> Postgres (UUID) migration');
    // order matters
    await migrateRoles();
    await migrateTeams();
    await migrateZones();
    await migrateBuildings();
    await migrateProducts();
    await migrateCustomers();
    await migrateEmployees();
    await migrateEmployeeTeamAssignments();
    await migrateTrucksAndZones();
    await migrateTimeSlots();
    await migrateOrders();
    await migrateOrderProducts();
    await migrateReports();
    await migrateChats();
    await migrateAccessLogs();
    await migrateUsersCollection();

    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();

