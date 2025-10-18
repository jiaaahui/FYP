/**
 * server/normalize_jsonb_to_relational.js
 *
 * Idempotent normalization script: reads raw JSONB tables created by
 * migrate_firestore_to_postgres.js and populates normalized relational tables.
 *
 * - Creates normalized tables IF NOT EXISTS (safe to run on a fresh DB).
 * - Batch processes source JSONB tables to avoid memory pressure.
 * - Uses INSERT ... ON CONFLICT DO UPDATE for idempotence.
 * - By default, reads raw JSONB tables that the migration created (e.g., 'building', 'customer', 'orders', 'orderproduct', ...).
 * - Writes normalized rows into tables with conventional names (customer, building, product, orders_rel, order_product, ...).
 *
 * IMPORTANT:
 * - Your migration script may have stored Firestore "Order" collection into a raw table named 'orders'.
 *   To avoid clobbering that raw data, this script writes normalized orders into 'orders_rel' by default.
 *   If you prefer to write normalized rows into 'orders' (overwriting the raw JSONB table), set the env var:
 *     NORMALIZED_ORDER_TABLE=orders
 *
 * Usage:
 *  - npm install pg dotenv
 *  - Set env vars in the same shell:
 *      $env:DATABASE_URL = "postgres://user:pass@host:5432/db"
 *      (Optional) $env:RAW_ORDER_TABLE = "orders"   # default; raw source table for Order docs
 *      (Optional) $env:NORMALIZED_ORDER_TABLE = "orders_rel" # default target normalized table name for orders
 *  - Run:
 *      node server/normalize_jsonb_to_relational.js
 *
 * Run first on staging and verify results before using in production.
 */

const { Pool } = require('pg');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set. Example: postgres://user:pass@localhost:5432/dbname');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '500', 10);

// Source raw JSONB table names (as created by migrate_firestore_to_postgres.js)
const RAW_TABLES = {
  building: process.env.RAW_BUILDING_TABLE || 'building',
  customer: process.env.RAW_CUSTOMER_TABLE || 'customer',
  employee: process.env.RAW_EMPLOYEE_TABLE || 'employee',
  employee_team_assignment: process.env.RAW_EMPLOYEE_TEAM_ASSIGNMENT_TABLE || 'employeeteamassignment',
  team: process.env.RAW_TEAM_TABLE || 'team',
  truck: process.env.RAW_TRUCK_TABLE || 'truck',
  zone: process.env.RAW_ZONE_TABLE || 'zone',
  truck_zone: process.env.RAW_TRUCK_ZONE_TABLE || 'truckzone',
  lorry_trip: process.env.RAW_LORRYTRIP_TABLE || 'lorrytrip',
  timeslot: process.env.RAW_TIMESLOT_TABLE || 'timeslot',
  order: process.env.RAW_ORDER_TABLE || (process.env.RAW_ORDER_TABLE ? process.env.RAW_ORDER_TABLE : 'orders'),
  orderproduct: process.env.RAW_ORDERPRODUCT_TABLE || 'orderproduct',
  product: process.env.RAW_PRODUCT_TABLE || 'product',
  chats: process.env.RAW_CHATS_TABLE || 'chats',
  users: process.env.RAW_USERS_TABLE || 'users',
  routingcache: process.env.RAW_ROUTINGCACHE_TABLE || 'routingcache'
};

// Normalized target table names (change if you prefer)
const TARGET_TABLES = {
  customer: process.env.TARGET_CUSTOMER_TABLE || 'customer',
  building: process.env.TARGET_BUILDING_TABLE || 'building',
  employee: process.env.TARGET_EMPLOYEE_TABLE || 'employee',
  employee_team_assignment: process.env.TARGET_EMPLOYEE_TEAM_ASSIGNMENT_TABLE || 'employee_team_assignment',
  team: process.env.TARGET_TEAM_TABLE || 'team',
  truck: process.env.TARGET_TRUCK_TABLE || 'truck',
  zone: process.env.TARGET_ZONE_TABLE || 'zone',
  truck_zone: process.env.TARGET_TRUCK_ZONE_TABLE || 'truck_zone',
  lorry_trip: process.env.TARGET_LORRY_TRIP_TABLE || 'lorry_trip',
  timeslot: process.env.TARGET_TIMESLOT_TABLE || 'timeslot',
  timeslot_order: process.env.TARGET_TIMESLOT_ORDER_TABLE || 'timeslot_order',
  orders: process.env.NORMALIZED_ORDER_TABLE || 'orders_rel', // default to orders_rel to avoid clobbering raw 'orders' JSONB table
  order_product: process.env.TARGET_ORDER_PRODUCT_TABLE || 'order_product',
  product: process.env.TARGET_PRODUCT_TABLE || 'product',
  chats: process.env.TARGET_CHATS_TABLE || 'chats',
  app_user: process.env.TARGET_APP_USER_TABLE || 'app_user',
  routing_cache: process.env.TARGET_ROUTING_CACHE_TABLE || 'routing_cache'
};

// Helper: parse timestamps that may be ISO strings, Firestore timestamps (converted to strings), or numbers
function parseTimestamp(val) {
  if (!val) return null;
  // If already a JS Date
  if (val instanceof Date) return val;
  // If looks like an ISO string
  if (typeof val === 'string') {
    const d = new Date(val);
    if (!isNaN(d)) return d.toISOString(); // store as ISO string for PG to parse
  }
  // If a number (seconds or ms)
  if (typeof val === 'number') {
    if (val > 1e12) return new Date(val).toISOString(); // ms
    return new Date(val * 1000).toISOString(); // seconds
  }
  return null;
}

// Utility: iterate over a raw JSONB table in batches (ordered by id)
async function fetchBatches(client, tableName, processRow) {
  let offset = 0;
  while (true) {
    const q = `SELECT id, data FROM ${tableName} ORDER BY id LIMIT $1 OFFSET $2`;
    const res = await client.query(q, [BATCH_SIZE, offset]);
    if (res.rowCount === 0) break;
    for (const row of res.rows) {
      try {
        await processRow(row.id, row.data);
      } catch (err) {
        console.error(`Error processing row id=${row.id} from ${tableName}:`, err.message || err);
      }
    }
    offset += res.rows.length;
    if (res.rows.length < BATCH_SIZE) break;
  }
}

// Create normalized tables if they do not exist (simple schema - adjust as needed)
async function ensureNormalizedSchema(client) {
  // Customers
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${TARGET_TABLES.customer} (
      customer_id TEXT PRIMARY KEY,
      name TEXT,
      display_name TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      postcode TEXT,
      state TEXT,
      notifications_enabled BOOLEAN,
      created_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ,
      data JSONB
    );
  `);

  // Building
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${TARGET_TABLES.building} (
      building_id TEXT PRIMARY KEY,
      building_name TEXT,
      housing_type TEXT,
      zone_id TEXT,
      postal_code TEXT,
      vehicle_size_limit TEXT,
      vehicle_length_limit NUMERIC,
      vehicle_width_limit NUMERIC,
      loading_bay_available BOOLEAN,
      lift_available BOOLEAN,
      lift_dimensions JSONB,
      stairs_available BOOLEAN,
      narrow_doorways BOOLEAN,
      parking_distance TEXT,
      pre_registration_required BOOLEAN,
      access_time_window_start TIME,
      access_time_window_end TIME,
      special_equipment_needed JSONB,
      notes TEXT,
      customer_id TEXT,
      updated_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ,
      data JSONB
    );
  `);

  // Employee
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${TARGET_TABLES.employee} (
      employee_id TEXT PRIMARY KEY,
      name TEXT,
      display_name TEXT,
      email TEXT,
      contact_number TEXT,
      role TEXT,
      active_flag BOOLEAN,
      created_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ,
      data JSONB
    );
  `);

  // Team
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${TARGET_TABLES.team} (
      team_id TEXT PRIMARY KEY,
      team_type TEXT,
      data JSONB,
      created_at TIMESTAMPTZ
    );
  `);

  // EmployeeTeamAssignment
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${TARGET_TABLES.employee_team_assignment} (
      id TEXT PRIMARY KEY,
      team_id TEXT,
      employee_id TEXT,
      assigned_at TIMESTAMPTZ,
      data JSONB
    );
  `);

  // Truck
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${TARGET_TABLES.truck} (
      truck_id TEXT PRIMARY KEY,
      car_plate TEXT,
      tone NUMERIC,
      length_cm NUMERIC,
      width_cm NUMERIC,
      height_cm NUMERIC,
      data JSONB,
      created_at TIMESTAMPTZ
    );
  `);

  // Zone
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${TARGET_TABLES.zone} (
      zone_id TEXT PRIMARY KEY,
      zone_name TEXT,
      data JSONB,
      created_at TIMESTAMPTZ
    );
  `);

  // TruckZone
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${TARGET_TABLES.truck_zone} (
      id TEXT PRIMARY KEY,
      truck_id TEXT,
      zone_id TEXT,
      is_primary_zone BOOLEAN,
      data JSONB
    );
  `);

  // Product
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${TARGET_TABLES.product} (
      product_id TEXT PRIMARY KEY,
      product_name TEXT,
      package_length_cm INT,
      package_width_cm INT,
      package_height_cm INT,
      installer_team_required_flag BOOLEAN,
      dismantle_extra_time INT,
      estimated_installation_time_min INT,
      estimated_installation_time_max INT,
      fragile_flag BOOLEAN,
      data JSONB,
      created_at TIMESTAMPTZ
    );
  `);

  // Orders (normalized target) - default name 'orders_rel' to avoid clobbering raw JSONB 'orders'
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${TARGET_TABLES.orders} (
      order_id TEXT PRIMARY KEY,
      customer_id TEXT,
      building_id TEXT,
      employee_id TEXT,
      delivery_team_id TEXT,
      time_slot_id TEXT,
      customer_rating NUMERIC,
      number_of_attempts INT,
      order_status TEXT,
      delay_reason TEXT,
      proof_of_delivery_url TEXT,
      customer_feedback TEXT,
      created_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ,
      scheduled_start TIMESTAMPTZ,
      scheduled_end TIMESTAMPTZ,
      actual_start TIMESTAMPTZ,
      actual_end TIMESTAMPTZ,
      actual_arrival TIMESTAMPTZ,
      data JSONB
    );
  `);

  // OrderProduct
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${TARGET_TABLES.order_product} (
      id TEXT PRIMARY KEY,
      order_id TEXT,
      product_id TEXT,
      quantity INT,
      data JSONB
    );
  `);

  // LorryTrip
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${TARGET_TABLES.lorry_trip} (
      lorry_trip_id TEXT PRIMARY KEY,
      truck_id TEXT,
      delivery_team_id TEXT,
      warehouse_team_id TEXT,
      date DATE,
      created_at TIMESTAMPTZ,
      data JSONB
    );
  `);

  // TimeSlot
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${TARGET_TABLES.timeslot} (
      timeslot_id TEXT PRIMARY KEY,
      lorry_trip_id TEXT,
      date DATE,
      time_window_start TIME,
      time_window_end TIME,
      available_flag BOOLEAN,
      status TEXT,
      created_at TIMESTAMPTZ,
      data JSONB
    );
  `);

  // TimeSlotOrder (assign an order to a timeslot)
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${TARGET_TABLES.timeslot_order} (
      id TEXT PRIMARY KEY,
      timeslot_id TEXT,
      order_id TEXT,
      scheduled_start TIMESTAMPTZ,
      scheduled_end TIMESTAMPTZ,
      sequence_no INT,
      data JSONB
    );
  `);

  // Chats
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${TARGET_TABLES.chats} (
      chat_id TEXT PRIMARY KEY,
      order_number TEXT,
      names JSONB,
      members TEXT[],
      created_at TIMESTAMPTZ,
      last_message_at TIMESTAMPTZ,
      data JSONB
    );
  `);

  // App user
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${TARGET_TABLES.app_user} (
      user_id TEXT PRIMARY KEY,
      name TEXT,
      display_name TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      postcode TEXT,
      state TEXT,
      notifications_enabled BOOLEAN,
      created_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ,
      data JSONB
    );
  `);

  // Routing cache
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${TARGET_TABLES.routing_cache} (
      id TEXT PRIMARY KEY,
      origin_id TEXT,
      dest_id TEXT,
      mode TEXT,
      duration_seconds INT,
      distance_meters INT,
      fetched_at TIMESTAMPTZ,
      data JSONB
    );
  `);
}

// Migration functions for each entity (idempotent)
async function migrateCustomers(client) {
  console.log('Migrating customers...');
  let count = 0;
  const source = RAW_TABLES.customer;
  await fetchBatches(client, source, async (id, data) => {
    const customerId = id || data.CustomerID || data.uid || data.customer_id || null;
    const name = data.name || data.displayName || null;
    const displayName = data.displayName || data.display_name || null;
    const email = data.email || null;
    const phone = data.phone || null;
    const address = data.address || null;
    const city = data.city || null;
    const postcode = data.postcode || data.PostalCode || null;
    const state = data.state || null;
    const notifications = data.notificationsEnabled !== undefined ? data.notificationsEnabled : null;
    const createdAt = parseTimestamp(data.createdAt) || null;
    const updatedAt = parseTimestamp(data.UpdatedAt || data.updatedAt) || null;

    const sql = `
      INSERT INTO ${TARGET_TABLES.customer} (customer_id, name, display_name, email, phone, address, city, postcode, state, notifications_enabled, created_at, updated_at, data)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      ON CONFLICT (customer_id) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, ${TARGET_TABLES.customer}.name),
        display_name = COALESCE(EXCLUDED.display_name, ${TARGET_TABLES.customer}.display_name),
        email = COALESCE(EXCLUDED.email, ${TARGET_TABLES.customer}.email),
        phone = COALESCE(EXCLUDED.phone, ${TARGET_TABLES.customer}.phone),
        address = COALESCE(EXCLUDED.address, ${TARGET_TABLES.customer}.address),
        city = COALESCE(EXCLUDED.city, ${TARGET_TABLES.customer}.city),
        postcode = COALESCE(EXCLUDED.postcode, ${TARGET_TABLES.customer}.postcode),
        state = COALESCE(EXCLUDED.state, ${TARGET_TABLES.customer}.state),
        notifications_enabled = COALESCE(EXCLUDED.notifications_enabled, ${TARGET_TABLES.customer}.notifications_enabled),
        updated_at = COALESCE(EXCLUDED.updated_at, ${TARGET_TABLES.customer}.updated_at),
        data = EXCLUDED.data
    `;
    await client.query(sql, [customerId, name, displayName, email, phone, address, city, postcode, state, notifications, createdAt, updatedAt, data]);
    count++;
  });
  console.log(`Customers migrated: ${count}`);
}

async function migrateBuildings(client) {
  console.log('Migrating buildings...');
  let count = 0;
  const source = RAW_TABLES.building;
  await fetchBatches(client, source, async (id, data) => {
    const buildingId = id || data.BuildingID || data.building_id || null;
    const buildingName = data.BuildingName || data.building_name || null;
    const housingType = data.HousingType || null;
    const zoneId = data.ZoneID || null;
    const postalCode = data.PostalCode || null;
    const vehicleSizeLimit = data.VehicleSizeLimit || null;
    const vehicleLengthLimit = data.VehicleLengthLimit ? parseFloat(data.VehicleLengthLimit) : null;
    const vehicleWidthLimit = data.VehicleWidthLimit ? parseFloat(data.VehicleWidthLimit) : null;
    const loadingBayAvailable = data.LoadingBayAvailable !== undefined ? !!data.LoadingBayAvailable : null;
    const liftAvailable = data.LiftAvailable !== undefined ? !!data.LiftAvailable : null;
    const liftDimensions = data.LiftDimensions || null;
    const stairsAvailable = data.StairsAvailable !== undefined ? !!data.StairsAvailable : null;
    const narrowDoorways = data.NarrowDoorways !== undefined ? !!data.NarrowDoorways : null;
    const parkingDistance = data.ParkingDistance || null;
    const preRegistrationRequired = data.PreRegistrationRequired !== undefined ? !!data.PreRegistrationRequired : null;
    const accessStart = data.AccessTimeWindowStart || null;
    const accessEnd = data.AccessTimeWindowEnd || null;
    const specialEquipment = data.SpecialEquipmentNeeded || null;
    const notes = data.Notes || null;
    const customerId = data.CustomerID || null;
    const updatedAt = parseTimestamp(data.UpdatedAt || data.updatedAt) || null;
    const createdAt = parseTimestamp(data.CreatedAt || data.created_at) || null;

    const sql = `
      INSERT INTO ${TARGET_TABLES.building} (building_id, building_name, housing_type, zone_id, postal_code,
        vehicle_size_limit, vehicle_length_limit, vehicle_width_limit, loading_bay_available, lift_available,
        lift_dimensions, stairs_available, narrow_doorways, parking_distance, pre_registration_required,
        access_time_window_start, access_time_window_end, special_equipment_needed, notes, customer_id, updated_at, created_at, data)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
      ON CONFLICT (building_id) DO UPDATE SET
        building_name = COALESCE(EXCLUDED.building_name, ${TARGET_TABLES.building}.building_name),
        housing_type = COALESCE(EXCLUDED.housing_type, ${TARGET_TABLES.building}.housing_type),
        zone_id = COALESCE(EXCLUDED.zone_id, ${TARGET_TABLES.building}.zone_id),
        postal_code = COALESCE(EXCLUDED.postal_code, ${TARGET_TABLES.building}.postal_code),
        vehicle_size_limit = COALESCE(EXCLUDED.vehicle_size_limit, ${TARGET_TABLES.building}.vehicle_size_limit),
        vehicle_length_limit = COALESCE(EXCLUDED.vehicle_length_limit, ${TARGET_TABLES.building}.vehicle_length_limit),
        vehicle_width_limit = COALESCE(EXCLUDED.vehicle_width_limit, ${TARGET_TABLES.building}.vehicle_width_limit),
        loading_bay_available = COALESCE(EXCLUDED.loading_bay_available, ${TARGET_TABLES.building}.loading_bay_available),
        lift_available = COALESCE(EXCLUDED.lift_available, ${TARGET_TABLES.building}.lift_available),
        lift_dimensions = COALESCE(EXCLUDED.lift_dimensions, ${TARGET_TABLES.building}.lift_dimensions),
        stairs_available = COALESCE(EXCLUDED.stairs_available, ${TARGET_TABLES.building}.stairs_available),
        narrow_doorways = COALESCE(EXCLUDED.narrow_doorways, ${TARGET_TABLES.building}.narrow_doorways),
        parking_distance = COALESCE(EXCLUDED.parking_distance, ${TARGET_TABLES.building}.parking_distance),
        pre_registration_required = COALESCE(EXCLUDED.pre_registration_required, ${TARGET_TABLES.building}.pre_registration_required),
        access_time_window_start = COALESCE(EXCLUDED.access_time_window_start, ${TARGET_TABLES.building}.access_time_window_start),
        access_time_window_end = COALESCE(EXCLUDED.access_time_window_end, ${TARGET_TABLES.building}.access_time_window_end),
        special_equipment_needed = COALESCE(EXCLUDED.special_equipment_needed, ${TARGET_TABLES.building}.special_equipment_needed),
        notes = COALESCE(EXCLUDED.notes, ${TARGET_TABLES.building}.notes),
        customer_id = COALESCE(EXCLUDED.customer_id, ${TARGET_TABLES.building}.customer_id),
        updated_at = COALESCE(EXCLUDED.updated_at, ${TARGET_TABLES.building}.updated_at),
        created_at = COALESCE(EXCLUDED.created_at, ${TARGET_TABLES.building}.created_at),
        data = EXCLUDED.data
    `;
    await client.query(sql, [
      buildingId, buildingName, housingType, zoneId, postalCode,
      vehicleSizeLimit, vehicleLengthLimit, vehicleWidthLimit, loadingBayAvailable, liftAvailable,
      liftDimensions ? JSON.stringify(liftDimensions) : null, stairsAvailable, narrowDoorways, parkingDistance, preRegistrationRequired,
      accessStart, accessEnd, specialEquipment ? JSON.stringify(specialEquipment) : null, notes, customerId, updatedAt, createdAt, data
    ]);
    count++;
  });
  console.log(`Buildings migrated: ${count}`);
}

async function migrateProducts(client) {
  console.log('Migrating products...');
  let count = 0;
  const source = RAW_TABLES.product;
  await fetchBatches(client, source, async (id, data) => {
    const productId = id || data.ProductID || null;
    const name = data.ProductName || null;
    const length = data.PackageLengthCM ? parseInt(data.PackageLengthCM, 10) : null;
    const width = data.PackageWidthCM ? parseInt(data.PackageWidthCM, 10) : null;
    const height = data.PackageHeightCM ? parseInt(data.PackageHeightCM, 10) : null;
    const installerRequired = data.InstallerTeamRequiredFlag !== undefined ? !!data.InstallerTeamRequiredFlag : null;
    const dismantleExtraTime = data.DismantleExtraTime ? parseInt(data.DismantleExtraTime, 10) : null;
    const estMin = data.EstimatedInstallationTimeMin ? parseInt(data.EstimatedInstallationTimeMin, 10) : null;
    const estMax = data.EstimatedInstallationTimeMax ? parseInt(data.EstimatedInstallationTimeMax, 10) : null;
    const fragile = data.FragileFlag !== undefined ? !!data.FragileFlag : null;

    const sql = `
      INSERT INTO ${TARGET_TABLES.product} (product_id, product_name, package_length_cm, package_width_cm, package_height_cm,
        installer_team_required_flag, dismantle_extra_time, estimated_installation_time_min, estimated_installation_time_max, fragile_flag, data, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      ON CONFLICT (product_id) DO UPDATE SET
        product_name = COALESCE(EXCLUDED.product_name, ${TARGET_TABLES.product}.product_name),
        package_length_cm = COALESCE(EXCLUDED.package_length_cm, ${TARGET_TABLES.product}.package_length_cm),
        package_width_cm = COALESCE(EXCLUDED.package_width_cm, ${TARGET_TABLES.product}.package_width_cm),
        package_height_cm = COALESCE(EXCLUDED.package_height_cm, ${TARGET_TABLES.product}.package_height_cm),
        installer_team_required_flag = COALESCE(EXCLUDED.installer_team_required_flag, ${TARGET_TABLES.product}.installer_team_required_flag),
        dismantle_extra_time = COALESCE(EXCLUDED.dismantle_extra_time, ${TARGET_TABLES.product}.dismantle_extra_time),
        estimated_installation_time_min = COALESCE(EXCLUDED.estimated_installation_time_min, ${TARGET_TABLES.product}.estimated_installation_time_min),
        estimated_installation_time_max = COALESCE(EXCLUDED.estimated_installation_time_max, ${TARGET_TABLES.product}.estimated_installation_time_max),
        fragile_flag = COALESCE(EXCLUDED.fragile_flag, ${TARGET_TABLES.product}.fragile_flag),
        data = EXCLUDED.data
    `;
    await client.query(sql, [productId, name, length, width, height, installerRequired, dismantleExtraTime, estMin, estMax, fragile, data, parseTimestamp(data.CreatedAt) || null]);
    count++;
  });
  console.log(`Products migrated: ${count}`);
}

async function migrateEmployees(client) {
  console.log('Migrating employees...');
  let count = 0;
  const source = RAW_TABLES.employee;
  await fetchBatches(client, source, async (id, data) => {
    const employeeId = id || data.EmployeeID || null;
    const name = data.name || data.displayName || null;
    const displayName = data.displayName || null;
    const email = (data.email || null) && String(data.email).trim();
    const phone = data.contact_number || data.phone || null;
    const role = (data.role || null) ? String(data.role).trim() : null;
    const activeFlag = data.active_flag !== undefined ? !!data.active_flag : null;
    const createdAt = parseTimestamp(data.createdAt) || null;

    const sql = `
      INSERT INTO ${TARGET_TABLES.employee} (employee_id, name, display_name, email, contact_number, role, active_flag, created_at, data)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (employee_id) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, ${TARGET_TABLES.employee}.name),
        display_name = COALESCE(EXCLUDED.display_name, ${TARGET_TABLES.employee}.display_name),
        email = COALESCE(EXCLUDED.email, ${TARGET_TABLES.employee}.email),
        contact_number = COALESCE(EXCLUDED.contact_number, ${TARGET_TABLES.employee}.contact_number),
        role = COALESCE(EXCLUDED.role, ${TARGET_TABLES.employee}.role),
        active_flag = COALESCE(EXCLUDED.active_flag, ${TARGET_TABLES.employee}.active_flag),
        data = EXCLUDED.data
    `;
    await client.query(sql, [employeeId, name, displayName, email, phone, role, activeFlag, createdAt, data]);
    count++;
  });
  console.log(`Employees migrated: ${count}`);
}

async function migrateTeams(client) {
  console.log('Migrating teams...');
  let count = 0;
  const source = RAW_TABLES.team;
  await fetchBatches(client, source, async (id, data) => {
    const teamId = id || data.TeamID || null;
    const teamType = data.TeamType || data.team_type || null;
    const sql = `INSERT INTO ${TARGET_TABLES.team} (team_id, team_type, data, created_at)
                 VALUES ($1,$2,$3,$4)
                 ON CONFLICT (team_id) DO UPDATE SET team_type = COALESCE(EXCLUDED.team_type, ${TARGET_TABLES.team}.team_type), data = EXCLUDED.data`;
    await client.query(sql, [teamId, teamType, data, parseTimestamp(data.CreatedAt) || null]);
    count++;
  });
  console.log(`Teams migrated: ${count}`);
}

async function migrateTrucksZones(client) {
  console.log('Migrating trucks, zones, truck_zone mapping...');
  let truckCount = 0, zoneCount = 0, mappingCount = 0;
  // trucks
  await fetchBatches(client, RAW_TABLES.truck, async (id, data) => {
    const truckId = id || data.TruckID || null;
    const carPlate = data.CarPlate || null;
    const tone = data.Tone !== undefined ? Number(data.Tone) : null;
    const lengthCm = data.LengthCM ? parseInt(data.LengthCM, 10) : null;
    const widthCm = data.WidthCM ? parseInt(data.WidthCM, 10) : null;
    const heightCm = data.HeightCM ? parseInt(data.HeightCM, 10) : null;
    const sql = `INSERT INTO ${TARGET_TABLES.truck} (truck_id, car_plate, tone, length_cm, width_cm, height_cm, data, created_at)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
                 ON CONFLICT (truck_id) DO UPDATE SET
                   car_plate = COALESCE(EXCLUDED.car_plate, ${TARGET_TABLES.truck}.car_plate),
                   tone = COALESCE(EXCLUDED.tone, ${TARGET_TABLES.truck}.tone),
                   length_cm = COALESCE(EXCLUDED.length_cm, ${TARGET_TABLES.truck}.length_cm),
                   width_cm = COALESCE(EXCLUDED.width_cm, ${TARGET_TABLES.truck}.width_cm),
                   height_cm = COALESCE(EXCLUDED.height_cm, ${TARGET_TABLES.truck}.height_cm),
                   data = EXCLUDED.data`;
    await client.query(sql, [truckId, carPlate, tone, lengthCm, widthCm, heightCm, data, parseTimestamp(data.CreatedAt) || null]);
    truckCount++;
  });

  // zones
  await fetchBatches(client, RAW_TABLES.zone, async (id, data) => {
    const zoneId = id || data.ZoneID || null;
    const zoneName = data.ZoneName || null;
    const sql = `INSERT INTO ${TARGET_TABLES.zone} (zone_id, zone_name, data, created_at) VALUES ($1,$2,$3,$4)
                 ON CONFLICT (zone_id) DO UPDATE SET zone_name = COALESCE(EXCLUDED.zone_name, ${TARGET_TABLES.zone}.zone_name), data = EXCLUDED.data`;
    await client.query(sql, [zoneId, zoneName, data, parseTimestamp(data.CreatedAt) || null]);
    zoneCount++;
  });

  // truck_zone mapping
  await fetchBatches(client, RAW_TABLES.truck_zone, async (id, data) => {
    const tzId = id || `${data.TruckID || data.truck_id || 'TRK'}_${data.ZoneID || data.zone_id || 'ZON'}`;
    const truckId = data.TruckID || data.truck_id || null;
    const zoneId = data.ZoneID || data.zone_id || null;
    const isPrimary = data.IsPrimaryZone !== undefined ? !!data.IsPrimaryZone : null;
    const sql = `INSERT INTO ${TARGET_TABLES.truck_zone} (id, truck_id, zone_id, is_primary_zone, data)
                 VALUES ($1,$2,$3,$4,$5)
                 ON CONFLICT (id) DO UPDATE SET truck_id = EXCLUDED.truck_id, zone_id = EXCLUDED.zone_id, is_primary_zone = EXCLUDED.is_primary_zone, data = EXCLUDED.data`;
    await client.query(sql, [tzId, truckId, zoneId, isPrimary, data]);
    mappingCount++;
  });

  console.log(`Trucks: ${truckCount}, Zones: ${zoneCount}, Truck-Zone mappings: ${mappingCount}`);
}

async function migrateEmployeeTeamAssignments(client) {
  console.log('Migrating employee_team_assignment...');
  let count = 0;
  const source = RAW_TABLES.employee_team_assignment;
  await fetchBatches(client, source, async (id, data) => {
    const rowId = id || `eta_${Math.random().toString(36).slice(2,8)}`;
    const teamId = data.TeamID || data.team_id || null;
    const employeeId = data.EmployeeID || data.employee_id || null;
    const assignedAt = parseTimestamp(data.assignedAt) || parseTimestamp(data.assigned_at) || null;
    const sql = `INSERT INTO ${TARGET_TABLES.employee_team_assignment} (id, team_id, employee_id, assigned_at, data)
                 VALUES ($1,$2,$3,$4,$5)
                 ON CONFLICT (id) DO UPDATE SET team_id = EXCLUDED.team_id, employee_id = EXCLUDED.employee_id, assigned_at = COALESCE(EXCLUDED.assigned_at, ${TARGET_TABLES.employee_team_assignment}.assigned_at), data = EXCLUDED.data`;
    await client.query(sql, [rowId, teamId, employeeId, assignedAt, data]);
    count++;
  });
  console.log(`Employee-team assignments migrated: ${count}`);
}

async function migrateLorryTrips(client) {
  console.log('Migrating lorry trips...');
  let count = 0;
  await fetchBatches(client, RAW_TABLES.lorry_trip, async (id, data) => {
    const lorryTripId = id || data.LorryTripID || data.id || null;
    const truckId = data.TruckID || null;
    const deliveryTeamId = data.DeliveryTeamID || null;
    const warehouseTeamId = data.WarehouseTeamID || null;
    const date = data.Date ? new Date(data.Date) : null;
    const createdAt = parseTimestamp(data.CreatedAt) || null;
    const sql = `INSERT INTO ${TARGET_TABLES.lorry_trip} (lorry_trip_id, truck_id, delivery_team_id, warehouse_team_id, date, data, created_at)
                 VALUES ($1,$2,$3,$4,$5,$6,$7)
                 ON CONFLICT (lorry_trip_id) DO UPDATE SET truck_id = COALESCE(EXCLUDED.truck_id, ${TARGET_TABLES.lorry_trip}.truck_id),
                   delivery_team_id = COALESCE(EXCLUDED.delivery_team_id, ${TARGET_TABLES.lorry_trip}.delivery_team_id),
                   warehouse_team_id = COALESCE(EXCLUDED.warehouse_team_id, ${TARGET_TABLES.lorry_trip}.warehouse_team_id),
                   date = COALESCE(EXCLUDED.date, ${TARGET_TABLES.lorry_trip}.date),
                   data = EXCLUDED.data`;
    await client.query(sql, [lorryTripId, truckId, deliveryTeamId, warehouseTeamId, date, data, createdAt]);
    count++;
  });
  console.log(`Lorry trips migrated: ${count}`);
}

async function migrateTimeSlotsAndTimeslotOrders(client) {
  console.log('Migrating timeslots and timeslot_order...');
  let tsCount = 0, tsoCount = 0;
  await fetchBatches(client, RAW_TABLES.timeslot, async (id, data) => {
    const timeslotId = id || data.TimeSlotID || null;
    const lorryTripId = data.LorryTripID || null;
    const date = data.Date ? new Date(data.Date) : null;
    const timeWindowStart = data.TimeWindowStart || null;
    const timeWindowEnd = data.TimeWindowEnd || null;
    const availableFlag = data.AvailableFlag !== undefined ? !!data.AvailableFlag : null;
    const status = data.Status || (availableFlag ? 'Available' : null);
    const createdAt = parseTimestamp(data.CreatedAt) || null;

    const sql = `INSERT INTO ${TARGET_TABLES.timeslot} (timeslot_id, lorry_trip_id, date, time_window_start, time_window_end, available_flag, status, created_at, data)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
                 ON CONFLICT (timeslot_id) DO UPDATE SET lorry_trip_id = COALESCE(EXCLUDED.lorry_trip_id, ${TARGET_TABLES.timeslot}.lorry_trip_id),
                   date = COALESCE(EXCLUDED.date, ${TARGET_TABLES.timeslot}.date),
                   time_window_start = COALESCE(EXCLUDED.time_window_start, ${TARGET_TABLES.timeslot}.time_window_start),
                   time_window_end = COALESCE(EXCLUDED.time_window_end, ${TARGET_TABLES.timeslot}.time_window_end),
                   available_flag = COALESCE(EXCLUDED.available_flag, ${TARGET_TABLES.timeslot}.available_flag),
                   status = COALESCE(EXCLUDED.status, ${TARGET_TABLES.timeslot}.status),
                   data = EXCLUDED.data`;
    await client.query(sql, [timeslotId, lorryTripId, date, timeWindowStart, timeWindowEnd, availableFlag, status, createdAt, data]);
    tsCount++;

    // Insert timeslot_order rows if present in data.Orders array (or data.orders)
    const ordersArray = data.Orders || data.orders || null;
    if (Array.isArray(ordersArray)) {
      for (let i = 0; i < ordersArray.length; i++) {
        const o = ordersArray[i];
        const tsoId = `${timeslotId}_${o.OrderID || o.orderId || i}`;
        const orderId = o.OrderID || o.orderId || null;
        const schedStart = parseTimestamp(o.ScheduledStartDateTime || o.scheduled_start) || null;
        const schedEnd = parseTimestamp(o.ScheduledEndDateTime || o.scheduled_end) || null;
        const seq = i + 1;
        const sql2 = `INSERT INTO ${TARGET_TABLES.timeslot_order} (id, timeslot_id, order_id, scheduled_start, scheduled_end, sequence_no, data)
                      VALUES ($1,$2,$3,$4,$5,$6,$7)
                      ON CONFLICT (id) DO UPDATE SET scheduled_start = COALESCE(EXCLUDED.scheduled_start, ${TARGET_TABLES.timeslot_order}.scheduled_start),
                        scheduled_end = COALESCE(EXCLUDED.scheduled_end, ${TARGET_TABLES.timeslot_order}.scheduled_end),
                        sequence_no = COALESCE(EXCLUDED.sequence_no, ${TARGET_TABLES.timeslot_order}.sequence_no),
                        data = EXCLUDED.data`;
        await client.query(sql2, [tsoId, timeslotId, orderId, schedStart, schedEnd, seq, o]);
        tsoCount++;
      }
    }
  });
  console.log(`Timeslots migrated: ${tsCount}, timeslot_order rows: ${tsoCount}`);
}

async function migrateOrdersAndOrderProducts(client) {
  console.log('Migrating orders (normalized) and order_product...');
  let ordersCount = 0, opCount = 0;
  const sourceOrders = RAW_TABLES.order;
  const sourceOrderProduct = RAW_TABLES.orderproduct;
  // Orders (read from raw JSONB table, write to normalized target TARGET_TABLES.orders)
  await fetchBatches(client, sourceOrders, async (id, data) => {
    const orderId = id || data.OrderID || data.order_id || null;
    if (!orderId) {
      console.warn('Skipping order row with missing id');
      return;
    }
    const customerId = data.CustomerID || data.customerId || null;
    const buildingId = data.BuildingID || data.buildingId || null;
    const employeeId = data.EmployeeID || null;
    const deliveryTeamId = data.DeliveryTeamID || null;
    const customerRating = data.CustomerRating !== undefined ? Number(data.CustomerRating) : null;
    const numberOfAttempts = data.NumberOfAttempts !== undefined ? parseInt(data.NumberOfAttempts, 10) : null;
    const orderStatus = data.OrderStatus || data.orderStatus || null;
    const delayReason = data.DelayReason || null;
    const proofUrl = data.ProofOfDeliveryURL || null;
    const customerFeedback = data.CustomerFeedback || null;
    const createdAt = parseTimestamp(data.CreatedAt) || parseTimestamp(data.createdAt) || null;
    const updatedAt = parseTimestamp(data.UpdatedAt) || parseTimestamp(data.updatedAt) || null;
    const scheduledStart = parseTimestamp(data.ScheduledStartDateTime) || null;
    const scheduledEnd = parseTimestamp(data.ScheduledEndDateTime) || null;
    const actualStart = parseTimestamp(data.ActualStartDateTime) || null;
    const actualEnd = parseTimestamp(data.ActualEndDateTime) || null;
    const actualArrival = parseTimestamp(data.ActualArrivalDateTime) || null;
    const timeSlotId = data.TimeSlotID || data.timeSlotId || null;

    const sql = `
      INSERT INTO ${TARGET_TABLES.orders} (order_id, customer_id, building_id, employee_id, delivery_team_id, time_slot_id,
        customer_rating, number_of_attempts, order_status, delay_reason, proof_of_delivery_url, customer_feedback,
        created_at, updated_at, scheduled_start, scheduled_end, actual_start, actual_end, actual_arrival, data)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
      ON CONFLICT (order_id) DO UPDATE SET
        customer_id = COALESCE(EXCLUDED.customer_id, ${TARGET_TABLES.orders}.customer_id),
        building_id = COALESCE(EXCLUDED.building_id, ${TARGET_TABLES.orders}.building_id),
        employee_id = COALESCE(EXCLUDED.employee_id, ${TARGET_TABLES.orders}.employee_id),
        delivery_team_id = COALESCE(EXCLUDED.delivery_team_id, ${TARGET_TABLES.orders}.delivery_team_id),
        time_slot_id = COALESCE(EXCLUDED.time_slot_id, ${TARGET_TABLES.orders}.time_slot_id),
        customer_rating = COALESCE(EXCLUDED.customer_rating, ${TARGET_TABLES.orders}.customer_rating),
        number_of_attempts = COALESCE(EXCLUDED.number_of_attempts, ${TARGET_TABLES.orders}.number_of_attempts),
        order_status = COALESCE(EXCLUDED.order_status, ${TARGET_TABLES.orders}.order_status),
        delay_reason = COALESCE(EXCLUDED.delay_reason, ${TARGET_TABLES.orders}.delay_reason),
        proof_of_delivery_url = COALESCE(EXCLUDED.proof_of_delivery_url, ${TARGET_TABLES.orders}.proof_of_delivery_url),
        customer_feedback = COALESCE(EXCLUDED.customer_feedback, ${TARGET_TABLES.orders}.customer_feedback),
        updated_at = COALESCE(EXCLUDED.updated_at, ${TARGET_TABLES.orders}.updated_at),
        scheduled_start = COALESCE(EXCLUDED.scheduled_start, ${TARGET_TABLES.orders}.scheduled_start),
        scheduled_end = COALESCE(EXCLUDED.scheduled_end, ${TARGET_TABLES.orders}.scheduled_end),
        actual_start = COALESCE(EXCLUDED.actual_start, ${TARGET_TABLES.orders}.actual_start),
        actual_end = COALESCE(EXCLUDED.actual_end, ${TARGET_TABLES.orders}.actual_end),
        actual_arrival = COALESCE(EXCLUDED.actual_arrival, ${TARGET_TABLES.orders}.actual_arrival),
        data = EXCLUDED.data
    `;
    await client.query(sql, [
      orderId, customerId, buildingId, employeeId, deliveryTeamId, timeSlotId,
      customerRating, numberOfAttempts, orderStatus, delayReason, proofUrl, customerFeedback,
      createdAt, updatedAt, scheduledStart, scheduledEnd, actualStart, actualEnd, actualArrival, data
    ]);
    ordersCount++;
  });

  // OrderProduct -> normalized order_product
  await fetchBatches(client, sourceOrderProduct, async (id, data) => {
    const opId = id || `${data.OrderID || data.orderId || 'op'}_${data.ProductID || data.productId || Math.random().toString(36).slice(2,6)}`;
    const orderId = data.OrderID || data.orderId || null;
    const productId = data.ProductID || data.productId || null;
    const qty = data.Quantity !== undefined ? parseInt(data.Quantity, 10) : 1;
    const sql = `
      INSERT INTO ${TARGET_TABLES.order_product} (id, order_id, product_id, quantity, data)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (id) DO UPDATE SET order_id = EXCLUDED.order_id, product_id = EXCLUDED.product_id, quantity = EXCLUDED.quantity, data = EXCLUDED.data
    `;
    await client.query(sql, [opId, orderId, productId, qty, data]);
    opCount++;
  });

  console.log(`Orders normalized: ${ordersCount}; order_product rows: ${opCount}`);
}

async function migrateChats(client) {
  console.log('Migrating chats...');
  let count = 0;
  await fetchBatches(client, RAW_TABLES.chats, async (id, data) => {
    const chatId = id || data.chat_id || null;
    const orderNumber = data.orderNumber || data.order_number || null;
    const names = data.names || null;
    const members = Array.isArray(data.members) ? data.members : null;
    const createdAt = parseTimestamp(data.createdAt) || null;
    const lastMessageAt = parseTimestamp(data.lastMessageAt) || null;
    const sql = `
      INSERT INTO ${TARGET_TABLES.chats} (chat_id, order_number, names, members, created_at, last_message_at, data)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (chat_id) DO UPDATE SET names = EXCLUDED.names, members = EXCLUDED.members, last_message_at = COALESCE(EXCLUDED.last_message_at, ${TARGET_TABLES.chats}.last_message_at), data = EXCLUDED.data
    `;
    await client.query(sql, [chatId, orderNumber, names ? JSON.stringify(names) : null, members, createdAt, lastMessageAt, data]);
    count++;
  });
  console.log(`Chats migrated: ${count}`);
}

async function migrateAppUsers(client) {
  console.log('Migrating app users...');
  let count = 0;
  await fetchBatches(client, RAW_TABLES.users, async (id, data) => {
    const userId = id || data.uid || data.user_id || null;
    const name = data.name || data.displayName || null;
    const displayName = data.displayName || data.display_name || null;
    const email = data.email || null;
    const phone = data.phone || null;
    const address = data.address || null;
    const city = data.city || null;
    const postcode = data.postcode || null;
    const state = data.state || null;
    const notifications = data.notificationsEnabled !== undefined ? !!data.notificationsEnabled : null;
    const createdAt = parseTimestamp(data.createdAt) || null;
    const updatedAt = parseTimestamp(data.updatedAt) || null;
    const sql = `
      INSERT INTO ${TARGET_TABLES.app_user} (user_id, name, display_name, email, phone, address, city, postcode, state, notifications_enabled, created_at, updated_at, data)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      ON CONFLICT (user_id) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, ${TARGET_TABLES.app_user}.name),
        display_name = COALESCE(EXCLUDED.display_name, ${TARGET_TABLES.app_user}.display_name),
        email = COALESCE(EXCLUDED.email, ${TARGET_TABLES.app_user}.email),
        phone = COALESCE(EXCLUDED.phone, ${TARGET_TABLES.app_user}.phone),
        address = COALESCE(EXCLUDED.address, ${TARGET_TABLES.app_user}.address),
        city = COALESCE(EXCLUDED.city, ${TARGET_TABLES.app_user}.city),
        postcode = COALESCE(EXCLUDED.postcode, ${TARGET_TABLES.app_user}.postcode),
        state = COALESCE(EXCLUDED.state, ${TARGET_TABLES.app_user}.state),
        notifications_enabled = COALESCE(EXCLUDED.notifications_enabled, ${TARGET_TABLES.app_user}.notifications_enabled),
        updated_at = COALESCE(EXCLUDED.updated_at, ${TARGET_TABLES.app_user}.updated_at),
        data = EXCLUDED.data
    `;
    await client.query(sql, [userId, name, displayName, email, phone, address, city, postcode, state, notifications, createdAt, updatedAt, data]);
    count++;
  });
  console.log(`App users migrated: ${count}`);
}

async function migrateRoutingCache(client) {
  console.log('Migrating routing cache...');
  let count = 0;
  await fetchBatches(client, RAW_TABLES.routingcache, async (id, data) => {
    const rcId = id || `${data.origin || data.origin_id || 'o'}_${data.dest || data.dest_id || 'd'}`;
    const origin = data.originId || data.origin || null;
    const dest = data.destId || data.dest || null;
    const mode = data.mode || null;
    const dur = data.durationSeconds || data.duration_seconds || data.duration || null;
    const dist = data.distanceMeters || data.distance_meters || data.distance || null;
    const fetchedAt = parseTimestamp(data.fetchedAt) || null;
    const sql = `
      INSERT INTO ${TARGET_TABLES.routing_cache} (id, origin_id, dest_id, mode, duration_seconds, distance_meters, fetched_at, data)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (id) DO UPDATE SET
        duration_seconds = COALESCE(EXCLUDED.duration_seconds, ${TARGET_TABLES.routing_cache}.duration_seconds),
        distance_meters = COALESCE(EXCLUDED.distance_meters, ${TARGET_TABLES.routing_cache}.distance_meters),
        fetched_at = COALESCE(EXCLUDED.fetched_at, ${TARGET_TABLES.routing_cache}.fetched_at),
        data = EXCLUDED.data
    `;
    await client.query(sql, [rcId, origin, dest, mode, dur, dist, fetchedAt, data]);
    count++;
  });
  console.log(`Routing cache migrated: ${count}`);
}

// Master runner
async function runAll() {
  const client = await pool.connect();
  try {
    console.log('Ensuring normalized schema exists...');
    await ensureNormalizedSchema(client);

    // Run entity migrations (order chosen to satisfy FKs where possible)
    await migrateCustomers(client);
    await migrateProducts(client);
    await migrateBuildings(client);
    await migrateEmployees(client);
    await migrateTeams(client);
    await migrateTrucksZones(client);
    await migrateEmployeeTeamAssignments(client);

    // Orders and order products after customers/products exist
    await migrateOrdersAndOrderProducts(client);

    // Lorry trips and timeslots (and timeslot orders)
    await migrateLorryTrips(client);
    await migrateTimeSlotsAndTimeslotOrders(client);

    // Chats, users, routing cache
    await migrateChats(client);
    await migrateAppUsers(client);
    await migrateRoutingCache(client);

    console.log('Normalization complete.');
  } catch (err) {
    console.error('Fatal error during normalization:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if executed directly
if (require.main === module) {
  runAll().catch(err => {
    console.error(err);
    process.exit(1);
  });
}