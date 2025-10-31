# Remaining Updates Summary

## Completed
✅ ProductInfo (route + frontend)
✅ TruckInfo (route + frontend)
✅ ZoneInfo (route) - Need to update frontend

## In Progress - ZoneInfo Frontend
File: `client/src/components/admin/info/ZoneInfo.js`

Add before export default function ZoneInfo():
```javascript
// Helper: normalize zone from API
function normalizeZone(zone) {
    return {
        id: zone.id,
        ZoneName: zone.zone_name || zone.zoneName || zone.ZoneName
    };
}

// Helper: convert to API format
function toApiFormat(zone) {
    return {
        zone_name: zone.ZoneName
    };
}
```

Update refreshZones():
```javascript
async function refreshZones() {
    setLoading(true);
    try {
        const data = await getAllZones();
        console.log('[ZoneInfo] Zones fetched:', { count: data?.length, sample: data?.[0] });
        setZones(data.map(normalizeZone));
    } catch (e) {
        console.error('[ZoneInfo] Load error:', e);
        setError("Failed to fetch zones: " + e.message);
    }
    setLoading(false);
}
```

Update handleModalSubmit():
```javascript
async function handleModalSubmit(e) {
    e.preventDefault();
    setSaving(true); setError(null); setSuccessMsg("");
    try {
        const apiData = toApiFormat(modalData);
        if (modalMode === "add") {
            await addZone(apiData);
            await refreshZones();
            setSuccessMsg("Zone added!");
        } else {
            await updateZone(modalData.id, apiData);
            await refreshZones();
            setSuccessMsg("Zone updated!");
        }
        setModalOpen(false);
    } catch (e) {
        console.error('[ZoneInfo] Save error:', e);
        setError(modalMode === "add"
            ? "Failed to add zone: " + e.message
            : "Failed to update: " + e.message
        );
    }
    setSaving(false);
}
```

Update handleDelete():
```javascript
async function handleDelete(id) {
    if (!window.confirm("Delete this zone?")) return;
    setSaving(true); setError(null); setSuccessMsg("");
    try {
        await deleteZone(id);
        setZones(prev => prev.filter(z => z.id !== id));
        setSuccessMsg("Zone deleted!");
    } catch (e) {
        console.error('[ZoneInfo] Delete error:', e);
        setError("Failed to delete: " + e.message);
    }
    setSaving(false);
}
```

Update table rendering - change all references from:
- `item.ZoneID || item.zone_id || item.id` → `item.id`

## Remaining Pages

### 4. BuildingInfo
Route: `server/routes/buildings.js`
- Update `prisma.building` → `prisma.buildings`
- Update include: `{ zone: true }` → `{ zones: true }`
- Add relation handling for `zone` field (convert to `zoneId`)

Frontend: `client/src/components/admin/info/BuildingInfo.js`
- Many fields to normalize (all building constraint fields)
- Handle zone relation

### 5. TruckZoneInfo
Route: Already updated in `server/routes/truck-zones.js` (check if correct)
Frontend: `client/src/components/admin/info/TruckZoneInfo.js`
- Handle truck and zone relations

### 6. Remaining Routes (No Frontend Components)
These routes just need model name updates:

**customers.js**: `prisma.customer` → `prisma.customers`
**orders.js**: `prisma.order` → `prisma.orders`
   - Update includes for relations
   - Add relation handling for `customer`, `building`, `employee`
**time-slots.js**: `prisma.timeSlot` → `prisma.time_slots`
**lorry-trips.js**: `prisma.lorryTrip` → `prisma.lorry_trips`
   - Add relation handling for `truck`
**reports.js**: `prisma.report` → `prisma.reports`

## Pattern to Follow

For all route files:
1. Change model name to snake_case
2. Add error handling: `if (err.code === 'P2025') return res.status(404)`
3. Add `details: err.message` to error responses

For all frontend files:
1. Add `normalize` and `toApiFormat` helper functions
2. Update `refresh` function with console.log and normalize
3. Update CRUD operations to use `toApiFormat` and `item.id`
4. Add console.error on errors
