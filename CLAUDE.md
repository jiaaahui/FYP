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
- Sets up Express with CORS (configured for http://localhost:3000)
- Mounts route modules under `/api/*`
- Includes health check endpoint at `/health`

**Database Layer:**
- Prisma schema: `server/prisma/schema.prisma`
- Connection: PostgreSQL (URL from `DATABASE_URL` env var)
- Prisma Client: Import via `server/prismaClient.js` singleton: `const prisma = require('../prismaClient');`
- **Important:** Always use the shared prismaClient.js to avoid multiple instance issues

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
- Provides: `currentEmployee`, `signIn()`, `signOut()`, `hasPermission()`, etc.
- Stores session in `sessionStorage` (keys: `employeeData`, `isAuthenticated`, `employeePermissions`, `employeeRole`)
- Session verification on mount via `/api/auth/verify-session`

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

**Role** - Defines access permissions
- `permissions: String[]` - Array of navigation keys (e.g., `['dashboard', 'warehouse']`)

**Employee** - User accounts
- Links to `Role` via `roleId`
- `activeFlag` - Account status
- `password` - bcrypt hashed

**Order** - Delivery orders
- Links to `Customer`, `Building`, `Employee`
- Status tracking, timestamps, proof of delivery

**Building** - Delivery locations
- Access constraints (vehicle limits, time windows, loading bay availability)
- Links to `Zone`

**Team** - Work teams
- `EmployeeTeamAssignment` junction table for many-to-many relationship

**Truck** - Delivery vehicles
- Dimensions tracked in CM
- `TruckZone` junction table links trucks to zones

**LorryTrip** - Scheduled truck trips
- References delivery team, warehouse team, and truck

**TimeSlot** - Available delivery time slots
- Tracks availability with `availableFlag`
- Used for scheduling orders

**OrderProduct** - Junction table for Order-Product relationship
- Tracks quantity and dismantle requirements per product in order

**Report** - User-submitted reports/complaints
- Simple model with content and status fields

**Chat** - Order-related messaging (stored as JSON)
- Links to order numbers, stores members and message metadata

**AccessLog** - Audit trail for permission changes
- Stores JSON snapshots of changes

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
- Some components (notably `accessControl.js`) still import and use Firebase
- Authentication has been migrated to backend API
- When modifying access control features, prioritize migrating to Prisma-backed APIs

### Permission System
- Permissions are stored as string arrays in `Role.permissions`
- Permission keys must match navigation section keys in `Layout.js`
- The string `"admin"` grants full access to all sections
- When creating/modifying roles, ensure permission keys align with available navigation sections

### Database Changes
- Always create Prisma migrations: `npx prisma migrate dev --name description`
- After schema changes, run `npx prisma generate` to update client
- Use UUID for all primary keys (`@default(uuid())`)
- Follow snake_case for database column names with `@map()` attribute

### API Development
- Import Prisma client: `const prisma = require('../prismaClient');` (uses singleton pattern)
- Route pattern: Export Express router with `module.exports = router;`
- Always include error handling and proper HTTP status codes
- For employee data, exclude password field from responses (use helper like `safeEmployee()`)
- Use `await bcrypt.compare()` for password verification, `await bcrypt.hash()` with salt for hashing

### Frontend API Calls
- Base URL: `REACT_APP_API_BASE_URL` env variable (defaults to `http://localhost:4000`)
- Most components use direct `fetch()` calls
- Service layer: `client/src/services/` contains reusable API functions (api.js, informationService.js, scheduler.js, profile.js)
- Always handle loading and error states
- API responses typically follow format: `{ success: true, data: {...} }` or `{ error: 'message' }`

### Route Organization
- Route files should export Express router: `const router = express.Router(); ... module.exports = router;`
- Keep route handlers focused; extract complex logic to service functions if needed
- Follow REST conventions for endpoint naming

### Testing After Changes
1. Start server: `cd server && npm run dev`
2. Start client: `cd client && npm start`
3. Verify database connection and migrations are applied
4. Test authentication flow: login → session persistence → permission-based navigation
5. Check console for errors in both server and browser

### Known Issues
- Access Control UI still uses Firestore (needs migration to `/api/roles` endpoints)
- Password reset emails not implemented (tokens logged to console for testing)
- JWT middleware defined but not actively used (app uses session-based auth)
- PasswordReset model referenced in auth.js but missing from Prisma schema (needs migration)

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
