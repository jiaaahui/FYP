-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS citext;

-- =====================================================
--  TABLE: Building
-- =====================================================
CREATE TABLE IF NOT EXISTS building (
  building_id TEXT PRIMARY KEY,
  building_name TEXT NOT NULL,
  zone_id TEXT,
  housing_type TEXT,
  postal_code TEXT,
  access_time_window_start TIME,
  access_time_window_end TIME,
  loading_bay_available BOOLEAN,
  pre_registration_required BOOLEAN,
  lift_available BOOLEAN,
  special_equipment_needed TEXT[],
  vehicle_size_limit TEXT,
  vehicle_length_limit TEXT,
  vehicle_width_limit TEXT,
  parking_distance TEXT,
  stairs_available BOOLEAN,
  narrow_doorways BOOLEAN,
  notes TEXT,
  lift_dimensions TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_building_zone_id ON building (zone_id);

-- =====================================================
--  TABLE: Customer
-- =====================================================
CREATE TABLE IF NOT EXISTS customer (
  customer_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT,
  email CITEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postcode TEXT,
  notifications_enabled BOOLEAN,
  created_at TIMESTAMP,
  bio TEXT
);

CREATE INDEX IF NOT EXISTS idx_customer_email ON customer (email);

-- =====================================================
--  TABLE: Employee
-- =====================================================
CREATE TABLE IF NOT EXISTS employee (
  employee_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_number TEXT,
  active_flag BOOLEAN DEFAULT TRUE,
  role TEXT,
  email CITEXT,
  display_name TEXT,
  created_at TIMESTAMP,
  bio TEXT
);

CREATE INDEX IF NOT EXISTS idx_employee_email ON employee (email);

-- =====================================================
--  TABLE: Team
-- =====================================================
CREATE TABLE IF NOT EXISTS team (
  team_id TEXT PRIMARY KEY,
  team_type TEXT
);

-- =====================================================
--  TABLE: EmployeeTeamAssignment
-- =====================================================
CREATE TABLE IF NOT EXISTS employee_team_assignment (
  id SERIAL PRIMARY KEY,
  team_id TEXT REFERENCES team(team_id) ON DELETE SET NULL,
  employee_id TEXT REFERENCES employee(employee_id) ON DELETE CASCADE
);

-- =====================================================
--  TABLE: Truck
-- =====================================================
CREATE TABLE IF NOT EXISTS truck (
  truck_id TEXT PRIMARY KEY,
  car_plate TEXT,
  tone NUMERIC,
  length_cm NUMERIC,
  width_cm NUMERIC,
  height_cm NUMERIC
);

-- =====================================================
--  TABLE: TruckZone
-- =====================================================
CREATE TABLE IF NOT EXISTS truck_zone (
  id SERIAL PRIMARY KEY,
  truck_id TEXT REFERENCES truck(truck_id) ON DELETE CASCADE,
  zone_id TEXT,
  is_primary_zone BOOLEAN
);

CREATE INDEX IF NOT EXISTS idx_truck_zone_zone_id ON truck_zone (zone_id);

-- =====================================================
--  TABLE: Zone
-- =====================================================
CREATE TABLE IF NOT EXISTS zone (
  zone_id TEXT PRIMARY KEY,
  zone_name TEXT
);

-- =====================================================
--  TABLE: LorryTrip
-- =====================================================
CREATE TABLE IF NOT EXISTS lorry_trip (
  lorry_trip_id TEXT PRIMARY KEY,
  truck_id TEXT REFERENCES truck(truck_id) ON DELETE SET NULL,
  warehouse_team_id TEXT REFERENCES team(team_id) ON DELETE SET NULL,
  delivery_team_id TEXT REFERENCES team(team_id) ON DELETE SET NULL
);

-- =====================================================
--  TABLE: TimeSlot
-- =====================================================
CREATE TABLE IF NOT EXISTS timeslot (
  timeslot_id TEXT PRIMARY KEY,
  lorry_trip_id TEXT REFERENCES lorry_trip(lorry_trip_id) ON DELETE SET NULL,
  date DATE,
  time_window_start TIME,
  time_window_end TIME,
  available_flag BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_timeslot_date ON timeslot (date);

-- =====================================================
--  TABLE: Product
-- =====================================================
CREATE TABLE IF NOT EXISTS product (
  product_id TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,
  fragile_flag BOOLEAN,
  dismantle_required_flag BOOLEAN,
  dismantle_extra_time INT,
  installer_team_required_flag BOOLEAN,
  no_lie_down_flag BOOLEAN,
  estimated_installation_time_min INT,
  estimated_installation_time_max INT,
  package_height_cm INT,
  package_length_cm INT,
  package_width_cm INT
);

-- =====================================================
--  TABLE: Order
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  order_id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customer(customer_id) ON DELETE SET NULL,
  building_id TEXT REFERENCES building(building_id) ON DELETE SET NULL,
  employee_id TEXT REFERENCES employee(employee_id) ON DELETE SET NULL,
  timeslot_id TEXT REFERENCES timeslot(timeslot_id) ON DELETE SET NULL,
  delivery_team_id TEXT REFERENCES team(team_id) ON DELETE SET NULL,
  order_status TEXT,
  number_of_attempts INT,
  delay_reason TEXT,
  proof_of_delivery_url TEXT,
  customer_feedback TEXT,
  customer_rating NUMERIC(3,1),
  scheduled_start TIMESTAMP,
  scheduled_end TIMESTAMP,
  actual_start TIMESTAMP,
  actual_arrival TIMESTAMP,
  actual_end TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Efficient filter by scheduled date
ALTER TABLE orders ADD COLUMN scheduled_date DATE GENERATED ALWAYS AS (scheduled_start::date) STORED;
CREATE INDEX IF NOT EXISTS idx_orders_scheduled_date ON orders (scheduled_date);

-- =====================================================
--  TABLE: OrderProduct
-- =====================================================
CREATE TABLE IF NOT EXISTS order_product (
  id SERIAL PRIMARY KEY,
  order_id TEXT REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id TEXT REFERENCES product(product_id) ON DELETE CASCADE,
  quantity INT
);

-- =====================================================
--  TABLE: Chat
-- =====================================================
CREATE TABLE IF NOT EXISTS chat (
  chat_id TEXT PRIMARY KEY,
  order_number TEXT,
  created_at TIMESTAMP,
  last_message_at TIMESTAMP,
  members TEXT[],
  names JSONB
);

CREATE INDEX IF NOT EXISTS idx_chat_order_number ON chat (order_number);

-- =====================================================
--  TABLE: Users (app users)
-- =====================================================
CREATE TABLE IF NOT EXISTS app_user (
  uid TEXT PRIMARY KEY,
  name TEXT,
  display_name TEXT,
  email CITEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postcode TEXT,
  notifications_enabled BOOLEAN,
  created_at TIMESTAMP,
  bio TEXT
);

CREATE INDEX IF NOT EXISTS idx_app_user_email ON app_user (email);
