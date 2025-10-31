# Migration Status - Snake_case API

## Completed
- ✅ server/prismaClient.js - Created
- ✅ server/index.js - Simplified to use route modules
- ✅ server/routes/employees.js - Updated to use `prisma.employees` + relation handling
- ✅ server/routes/roles.js - Updated to use `prisma.roles`
- ✅ server/routes/teams.js - Updated to use `prisma.teams`
- ✅ server/routes/assignments.js - Updated to use `prisma.employee_team_assignments` + relation handling
- ✅ client/src/components/admin/info/EmployeeInfo.js - Updated for snake_case fields
- ✅ client/src/components/admin/info/TeamInfo.js - Updated for snake_case fields

## In Progress - Route Files Need Model Name Updates

These routes need Prisma model names changed from PascalCase to snake_case:

### server/routes/trucks.js
- `prisma.truck` → `prisma.trucks`

### server/routes/zones.js
- `prisma.zone` → `prisma.zones`

### server/routes/buildings.js
- `prisma.building` → `prisma.buildings`
- May need relation handling for `zone` field

### server/routes/products.js
- `prisma.product` → `prisma.products`

### server/routes/customers.js
- `prisma.customer` → `prisma.customers`

### server/routes/orders.js
- `prisma.order` → `prisma.orders`
- Needs relation handling for `customer`, `building`, `employee` fields

### server/routes/time-slots.js
- `prisma.timeSlot` → `prisma.time_slots`

### server/routes/lorry-trips.js
- `prisma.lorryTrip` → `prisma.lorry_trips`
- May need relation handling for `truck` field

### server/routes/reports.js
- `prisma.report` → `prisma.reports`

## Pending - Frontend Info Components

These components need field name updates to handle snake_case from API:

### client/src/components/admin/info/ProductInfo.js
- Update field references to handle both formats
- Add console logging for debugging

### client/src/components/admin/info/TruckInfo.js
- Update field references to handle both formats
- Handle truck dimension fields (likely in CM)
- Add console logging

### client/src/components/admin/info/ZoneInfo.js
- Update field references to handle both formats
- Add console logging

### client/src/components/admin/info/BuildingInfo.js
- Update field references to handle both formats
- Handle all building constraint fields
- Handle zone relation
- Add console logging

### client/src/components/admin/info/TruckZoneInfo.js
- Update field references to handle both formats
- Handle truck and zone relations
- Add console logging

## Next Steps

1. **Stop server** (Ctrl+C)
2. **Run `npx prisma generate`** to regenerate Prisma client with snake_case models
3. **Start server** (`npm run dev`)
4. Update remaining route files (trucks, zones, buildings, products, customers, orders, time-slots, lorry-trips, reports)
5. Update remaining frontend info components
6. Test each info page to ensure CRUD operations work

## Pattern to Follow

### Route Files
```javascript
// Before
const items = await prisma.truck.findMany();

// After
const items = await prisma.trucks.findMany();
```

### Frontend Components
```javascript
// Handle both naming conventions
const itemId = item.ItemID || item.id;
const itemName = item.ItemName || item.itemName || item.item_name;
```

### Relation Handling in Routes
```javascript
// POST/PUT endpoints - convert relation fields to FKs
const { zone, ...data } = req.body;
const createData = { ...data };
if (zone) createData.zoneId = zone;
```
