# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a delivery management system (TBMDelivery) with role-based access control for managing employees, schedules, orders, trucks, zones, and buildings. The application is currently in migration from Firebase to a PostgreSQL-backed architecture using Prisma ORM.

**Tech Stack:**
- Frontend: React 18 with React Router v6, TailwindCSS
- Backend: Express.js (Node.js)
- Database: PostgreSQL via Prisma ORM
- Authentication: Session-based (transitioning from Firebase Auth)
- Legacy: Some components still reference Firebase (being phased out)

## Development Commands

### Client (React App)
```bash
cd client
npm start              # Start development server (port 3000)
npm run build          # Build for production
npm test               # Run tests
```

### Server (Express API)
```bash
cd server
npm run dev            # Start with nodemon (hot reload)
npm start              # Start production server (port 4000)
```

### Database (Prisma)
```bash
cd server
npx prisma migrate dev              # Create and apply migration
npx prisma generate                 # Generate Prisma Client
npx prisma studio                   # Open Prisma Studio GUI
npx prisma db push                  # Push schema changes without migration
npx prisma migrate reset            # Reset database and re-run all migrations
```

## Architecture

### Monorepo Structure
- `client/` - React frontend application (separate package.json with dependencies)
- `server/` - Express backend API (separate package.json with dependencies)
- Root `package.json` exists but is minimal; **always install dependencies in client/ or server/ directories**
- Each subdirectory runs independently; no workspace setup

### Backend Architecture

**Entry Point:** `server/index.js`
- Sets up Express with CORS, Helmet for security headers
- Mounts route modules under `/api/*`
- Health check endpoint: `GET /api/health` (tests DB connection with raw query)
- Graceful shutdown on SIGINT (disconnects Prisma)

**Database Layer:**
- Prisma schema: `server/prisma/schema.prisma`
- Connection: PostgreSQL (URL from `DATABASE_URL` env var)
- Prisma Client: Import via `server/prismaClient.js` singleton: `const prisma = require('../prismaClient');`
- **Important:** Always use the shared prismaClient.js to avoid multiple instance issues
- Model naming: Uses snake_case table names (e.g., `employees`, `roles`) with camelCase in JS via `@map()` attributes

**API Routes:** All mounted under `/api/`:
- `/api/auth` - Authentication (login, password reset, session verification)
- `/api/employees` - Employee CRUD
- `/api/roles` - Role management
- `/api/trucks` - Truck information
- `/api/zones` - Delivery zones
- `/api/buildings` - Building details with access constraints
- `/api/products` - Product catalog
- `/api/teams` - Team assignments
- `/api/customers` - Customer data
- `/api/orders` - Order management and tracking
- `/api/time-slots` - Delivery time slots
- `/api/lorry-trips` - Lorry/truck trip scheduling
- `/api/assignments` - Employee-team assignments
- `/api/reports` - Reporting

**Authentication:**
- Uses bcrypt for password hashing
- Session-based authentication via `sessionStorage` on client
- `server/middleware/auth.js` provides JWT middleware (partially implemented)
- Login endpoint: `POST /api/auth/login` validates credentials and returns employee data
- Session verification: `POST /api/auth/verify-session`
- Password reset flow: `/api/auth/reset-request` → `/api/auth/reset-confirm`

### Frontend Architecture

**Entry Point:** `client/src/index.js` → `App.js`

**Route Structure:**
- `/login` - Public login page
- `/*` - Protected routes wrapped in `<Layout />` component

**Authentication Context:** `client/src/contexts/AuthContext.js`
- Provides: `currentUser`, `employeeData`, `permissions`, `signIn()`, `logout()`, `hasPermission()`, `hasRole()`, etc.
- Stores session in `sessionStorage` (keys: `employeeData`, `isAuthenticated`, `employeePermissions`, `employeeRole`)
- **Important:** Still fetches permissions from Firebase Firestore (`Roles` collection) - needs migration
- Session restore on mount checks sessionStorage; permissions fetched via `fetchPermissionsForRole()`
- `loadingPermissions` and `loading` states track auth initialization

**Layout Component:** `client/src/components/Layout.js`
- Renders sidebar navigation based on user permissions
- Navigation sections: dashboard, schedule, info, cases, access, delivery, installation, warehouse
- Permission-based filtering: Only shows nav items that match user's role permissions
- **Admin role** gets full access to all sections

**Navigation Keys** (must match between Layout.js and Role.permissions in DB):
- `dashboard` - Overview, Employee Performance, Orders
- `schedule` - Schedule, Auto Scheduler
- `info` - Employee, Team, Building, Product, Truck, TruckZone
- `cases` - Cases management
- `access` - Role and permission management
- `delivery` - Delivery schedule view
- `installation` - Installation schedule view
- `warehouse` - Warehouse loading schedule

**Component Organization:**
- `client/src/components/admin/` - Admin pages (dashboard, info, schedule, cases, access)
- `client/src/components/delivery/` - Delivery team views
- `client/src/components/installer/` - Installation team views
- `client/src/components/warehouse/` - Warehouse team views
- `client/src/components/auth/` - Login and authentication UI

**Access Control:** `client/src/components/admin/access/accessControl.js`
- **Legacy:** Still uses Firebase Firestore (`db` from `firebase.js`)
- Manages role permissions stored in Firestore collection `Roles`
- Will need migration to Prisma-backed API (`/api/roles` endpoints exist)

### Database Schema (Key Models)

**roles** (`roles` table)
- `id`: UUID primary key
- `name`: Role name (e.g., "admin", "delivery")
- `permissions`: String array - navigation keys (e.g., `['dashboard', 'warehouse']`)
- Timestamps: `createdAt`, `updatedAt`

**employees** (`employees` table)
- `id`: UUID primary key
- `roleId`: Foreign key to `roles`
- `activeFlag`: Boolean for account status
- `password`: bcrypt hashed password
- Fields: `name`, `displayName`, `email` (unique), `contactNumber`, `bio`
- Relation: `role` (belongs to Role), `teamAssignments` (many EmployeeTeamAssignment), `orders`
- Timestamps: `createdAt`, `updatedAt`

**orders** (`orders` table)
- `id`: UUID primary key
- Foreign keys: `customer_id`, `building_id`, `employee_id`, `time_slot_id`
- Status: `order_status`, `number_of_attempts`
- Timestamps: `scheduled_start_date_time`, `scheduled_end_date_time`, `actual_start_date_time`, `actual_end_date_time`, `actual_arrival_date_time`
- Feedback: `customer_rating`, `customer_feedback`, `proof_of_delivery_url`
- Relations: `order_products`, `buildings`, `customers`, `employees`

**buildings** (`buildings` table)
- `id`: UUID primary key
- `zoneId`: Foreign key to `zones`
- Access constraints: `vehicleSizeLimit`, `vehicleLengthLimit`, `vehicleWidthLimit`, `accessTimeWindowStart`, `accessTimeWindowEnd`
- Facilities: `loadingBayAvailable`, `liftAvailable`, `liftDimensions`, `preRegistrationRequired`
- Additional: `parkingDistance`, `narrowDoorways`, `specialEquipmentNeeded`, `notes`
- Fields: `buildingName`, `housingType`, `postalCode`

**teams** (`teams` table)
- `id`: UUID primary key
- `teamType`: String (e.g., "delivery", "installation", "warehouse")
- Relation: `assignments` (many EmployeeTeamAssignment)

**employee_team_assignments** (junction table)
- `id`: Auto-increment integer primary key
- `employeeId`, `teamId`: Foreign keys
- `assignedAt`: Timestamp
- Unique constraint: `[employeeId, teamId]`

**trucks** (`trucks` table)
- `id`: UUID primary key
- Dimensions in CM: `length_cm`, `width_cm`, `height_cm`
- Fields: `plate_no`, `tone`
- Relations: `lorry_trips`, `truck_zones`

**truck_zones** (junction table)
- `id`: UUID primary key
- `truck_id`, `zone_id`: Foreign keys
- `is_primary_zone`: Boolean flag

**lorry_trips** (`lorry_trips` table)
- `id`: UUID primary key
- `truck_id`, `delivery_team_id`, `warehouse_team_id`: Foreign keys (strings)
- Timestamps: `created_at`, `updated_at`

**time_slots** (`time_slots` table)
- `id`: UUID primary key
- `date`, `time_window_start`, `time_window_end`: Strings
- `available_flag`: Boolean
- `created_at`: Timestamp

**order_products** (junction table)
- `id`: Auto-increment integer primary key
- `order_id`, `product_id`: Foreign keys (cascade delete)
- `quantity`: Integer
- `dismantle_required`: Boolean
- `dismantle_time_min`, `dismantle_time_max`: Integer (minutes)

**products** (`products` table)
- `id`: UUID primary key
- `product_name`: String
- Package dimensions in CM: `package_length_cm`, `package_height_cm`, `package_width_cm`
- Flags: `fragile_flag`, `installer_team_required_flag`
- Time estimates: `estimated_installation_time_min`, `estimated_installation_time_max`, `dismantle_time_min`, `dismantle_time_max`

**customers** (`customers` table)
- `id`: UUID primary key
- Fields: `full_name`, `email`, `phone`, `address`, `city`, `postcode`, `state`
- `created_at`: Timestamp

**zones** (`zones` table)
- `id`: UUID primary key
- `zoneName`: String
- Relations: `buildings`, `truck_zones`

**reports** (`reports` table)
- `id`: UUID primary key
- `content`: String
- `status`: String
- `created_at`: Timestamp

**chats** (`chats` table)
- `id`: UUID primary key
- `order_number`: String
- `members`, `names`: JSON fields
- Timestamps: `created_at`, `last_message_at`

**access_logs** (`access_logs` table)
- `id`: UUID primary key
- `changed_at`: Timestamp
- `changes`: JSON field for audit trail

## Data Flow

**Authentication Flow:**
1. User submits credentials via `/login` (Login.js)
2. POST to `/api/auth/login` validates against Prisma Employee table
3. Backend returns employee object with role and permissions
4. AuthContext stores in sessionStorage and sets currentEmployee state
5. ProtectedRoute checks authentication before rendering Layout
6. Layout filters navigation based on role permissions

**Permission Checking:**
1. Employee.role.permissions contains array of permission keys (e.g., `['dashboard', 'warehouse']`)
2. Layout.js filters navigationData entries where key matches a permission
3. Special case: `'admin'` permission or role name = 'admin' grants access to all sections
4. Each navigation section maps to a permission key that must match exactly

**API Call Pattern:**
1. Component calls `fetch()` to backend endpoint (e.g., `/api/employees`)
2. Backend route handler uses `prisma` client to query PostgreSQL
3. Response formatted as JSON with `{ success: true, data }` or `{ error: 'message' }`
4. Component updates state with response data and handles loading/error states

## Important Notes for Development

### Migration Status
- **Active Migration:** Moving from Firebase to PostgreSQL/Prisma
- **Critical:** `AuthContext.js` still fetches permissions from Firebase Firestore `Roles` collection
- `accessControl.js` still uses Firebase Firestore for role management
- Authentication login/verification has been migrated to backend API
- When modifying access control or permission features, prioritize migrating to Prisma-backed `/api/roles` endpoints

### Permission System
- Permissions are stored as string arrays in `Role.permissions`
- Permission keys must match navigation section keys in `Layout.js`
- The string `"admin"` grants full access to all sections
- When creating/modifying roles, ensure permission keys align with available navigation sections

### Database Changes
- Always create Prisma migrations: `npx prisma migrate dev --name description`
- After schema changes, run `npx prisma generate` to update client
- Primary keys: Use UUID (`@default(uuid())`) for most tables; auto-increment integers for junction tables
- Naming: Use snake_case for table/column names, map to camelCase in Prisma with `@map()` attribute
- Foreign key actions: Use `onDelete: Cascade` for dependent data, `onUpdate: NoAction` to prevent accidental cascades

### API Development
- Import Prisma client: `const prisma = require('../prismaClient');` (uses singleton pattern)
- **Important:** Use lowercase model names in Prisma queries: `prisma.employees`, `prisma.roles`, etc. (matches schema table names)
- Route pattern: Export Express router with `module.exports = router;`
- Always include error handling and proper HTTP status codes
- For employee data, exclude password field from responses (use helper like `safeEmployee()`)
- Password handling: `await bcrypt.compare(password, hash)` for verification, `await bcrypt.hash(password, salt)` with `bcrypt.genSalt(10)` for hashing
- Use Prisma `include` to fetch related data (e.g., `include: { role: true }` to fetch employee's role)

### Frontend API Calls
- Base URL: `REACT_APP_API_BASE_URL` env variable (defaults to `http://localhost:4000`)
- Most components use direct `fetch()` calls
- Service layer: `client/src/services/` contains reusable API functions
  - `informationService.js`: Comprehensive service for all CRUD operations (employees, products, trucks, etc.)
  - `api.js`, `scheduler.js`, `profile.js`: Specialized services
- `informationService.js` provides generic helpers: `getAllDocs()`, `getDocById()`, `addDocGeneric()`, `updateDocGeneric()`, `deleteDocGeneric()`
- Collection endpoint mapping in `endpointMap` (e.g., "Employee" → "employees", "TruckZone" → "truck-zones")
- Always handle loading and error states
- API responses typically follow format: `{ success: true, data: {...} }` or `{ error: 'message' }`

### Route Organization
- Route files should export Express router: `const router = express.Router(); ... module.exports = router;`
- Keep route handlers focused; extract complex logic to service functions if needed
- Follow REST conventions for endpoint naming

### Common Development Workflows

**Adding a New API Endpoint:**
1. Add route handler in appropriate file under `server/routes/` (or create new route file)
2. Import and mount in `server/index.js` if new route file: `app.use('/api/resource', require('./routes/resource'));`
3. Use Prisma client for database operations: `const result = await prisma.modelName.findMany();`
4. Return consistent response format: `res.json({ success: true, data: result })` or `res.status(400).json({ error: 'message' })`
5. Test endpoint with client or API tool

**Adding a New Frontend Component:**
1. Create component in appropriate directory under `client/src/components/`
2. If it's a new navigation section, add to `navigationData` in `Layout.js`
3. Add corresponding permission key to role's `permissions` array in database
4. Use `informationService.js` functions for API calls or create new service function
5. Handle loading/error states with useState

**Modifying Prisma Schema:**
1. Edit `server/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive_name` (creates migration + applies it)
3. Run `npx prisma generate` (updates Prisma Client)
4. Update backend route handlers if model changes affect queries
5. Update frontend service functions if API response structure changes

**Debugging Permission Issues:**
1. Check role's `permissions` array in database (currently in Firebase Firestore `Roles` collection)
2. Verify permission key matches navigation section key in `Layout.js` `navigationData`
3. Check `AuthContext.js` state: `permissions`, `employeeData.role`
4. Ensure `loadingPermissions` completes before Layout renders
5. Admin role or 'admin' permission string grants access to all sections

### Testing After Changes
1. Start server: `cd server && npm run dev`
2. Start client: `cd client && npm start`
3. Verify database connection and migrations are applied
4. Test authentication flow: login → session persistence → permission-based navigation
5. Check console for errors in both server and browser

### Known Issues
- **Critical:** `AuthContext.js` fetches permissions from Firebase Firestore - must migrate to fetch from `/api/roles` or backend
- Access Control UI (`accessControl.js`) still uses Firestore (needs migration to `/api/roles` endpoints)
- Password reset emails not implemented (tokens logged to console for testing)
- JWT middleware defined (`server/middleware/auth.js`) but not actively used (app uses session-based auth)
- `PasswordReset` model referenced in `auth.js` but missing from Prisma schema - needs to be added or auth.js updated

## Environment Variables

### Server (.env in server/)
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
PORT=4000
CLIENT_URL="http://localhost:3000"
JWT_SECRET="your-secret-key-change-in-production"
```

### Client (.env in client/)
```bash
REACT_APP_API_BASE_URL="http://localhost:4000"
# Firebase config (legacy - being phased out)
REACT_APP_FIREBASE_API_KEY="..."
```
