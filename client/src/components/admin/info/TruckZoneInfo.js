import React, { useEffect, useState } from "react";
import {
    getAllTrucks,
    getAllZones,
    getAllTruckZone,
    addTruckZone,
    updateTruckZone,
    deleteTruckZone,
    addZone,
    updateZone,
    deleteZone
} from "../../../services/informationService";

// Zone Management Component (CRUD in dropdown, no ZoneID display)
function ZoneManager({ zones, onAddZone, onEditZone, onDeleteZone }) {
    const [showZoneManager, setShowZoneManager] = useState(false);
    const [editingZone, setEditingZone] = useState(null);
    const [newZoneName, setNewZoneName] = useState("");

    const handleAddZone = () => {
        if (newZoneName.trim()) {
            onAddZone(newZoneName.trim());
            setNewZoneName("");
        }
    };

    const handleEditZone = (zone) => {
        onEditZone(zone.ZoneID, zone.ZoneName);
        setEditingZone(null);
    };

    return (
        <div className="bg-gray-50 p-2 rounded-lg ">
            <div className="flex justify-end">
                <button
                    onClick={() => setShowZoneManager(!showZoneManager)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                    {showZoneManager ? 'Hide Zones' : 'Manage Zones'}
                </button>
            </div>
            {showZoneManager && (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter new zone name"
                            value={newZoneName}
                            onChange={(e) => setNewZoneName(e.target.value)}
                            className="flex-1 border rounded px-3 py-2 text-sm"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddZone()}
                        />
                        <button
                            onClick={handleAddZone}
                            className="bg-green-500 text-white px-4 py-2 rounded text-sm"
                        >
                            Add Zone
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {zones.map(zone => (
                            <div key={zone.ZoneID} className="bg-white p-3 rounded border">
                                {editingZone?.ZoneID === zone.ZoneID ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={editingZone.ZoneName}
                                            onChange={(e) => setEditingZone({ ...editingZone, ZoneName: e.target.value })}
                                            className="flex-1 border rounded px-2 py-1 text-sm"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => handleEditZone(editingZone)}
                                            className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                                        >
                                            ✓
                                        </button>
                                        <button
                                            onClick={() => setEditingZone(null)}
                                            className="bg-gray-400 text-white px-2 py-1 rounded text-xs"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-medium text-sm">{zone.ZoneName}</div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setEditingZone(zone)}
                                                className="text-blue-500 text-sm p-1"
                                                title="Edit Zone"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`Delete zone "${zone.ZoneName}"?`)) {
                                                        onDeleteZone(zone.ZoneID);
                                                    }
                                                }}
                                                className="text-red-500 text-sm p-1"
                                                title="Delete Zone"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Truck Zone Assignment Component
function TruckZoneCard({ truck, zones, truckZones, onAssignZone, onRemoveZone, onSetPrimary }) {
    const [selectedZone, setSelectedZone] = useState("");
    const assignedZones = truckZones.filter(tz => tz.TruckID === truck.TruckID);
    const availableZones = zones.filter(zone =>
        !assignedZones.some(tz => tz.ZoneID === zone.ZoneID)
    );

    const handleAssignZone = () => {
        if (selectedZone) {
            onAssignZone(truck.TruckID, selectedZone, assignedZones.length === 0);
            setSelectedZone("");
        }
    };

    return (
        <div className="bg-white border rounded-lg p-4 shadow-sm">
            {/* Truck Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-semibold text-lg">{truck.CarPlate || truck.TruckName || truck.TruckID}</h4>
                    <div className="text-sm text-gray-600">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                            {truck.Tone ? `${truck.Tone}T` : (truck.Volume ? `${truck.Volume}m³` : "")}
                        </span>
                        {truck.Volume && <span>Volume: {truck.Volume}m³</span>}
                    </div>
                </div>
            </div>

            {/* Assigned Zones */}
            <div className="mb-4">
                <div className="text-sm font-medium mb-2">Assigned Zones ({assignedZones.length})</div>
                {assignedZones.length === 0 ? (
                    <div className="text-gray-500 text-sm italic">No zones assigned</div>
                ) : (
                    <div className="space-y-2">
                        {assignedZones.map(tz => {
                            const zone = zones.find(z => z.ZoneID === tz.ZoneID);
                            if (!zone) return null;

                            return (
                                <div
                                    key={tz.ZoneID}
                                    className={`flex justify-between items-center p-2 rounded text-sm ${tz.IsPrimaryZone
                                        ? 'bg-yellow-100 border-l-4 border-yellow-500'
                                        : 'bg-gray-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{zone.ZoneName}</span>
                                        {tz.IsPrimaryZone && (
                                            <span className="bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs">
                                                Primary
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        {!tz.IsPrimaryZone && (
                                            <button
                                                onClick={() => onSetPrimary(truck.TruckID, tz.ZoneID, !tz.IsPrimaryZone)}
                                                className={`text-xs px-2 py-1 rounded ${tz.IsPrimaryZone
                                                        ? "text-yellow-800 hover:bg-yellow-300"
                                                        : "text-yellow-600 hover:bg-yellow-200"
                                                    }`}
                                                title={tz.IsPrimaryZone ? "Unset as Primary" : "Set as Primary"}
                                            >
                                                {tz.IsPrimaryZone ? "★" : "☆"}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onRemoveZone(truck.TruckID, tz.ZoneID)}
                                            className="text-red-500 text-xs px-2 py-1 hover:bg-red-100 rounded"
                                            title="Remove Zone"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Zone */}
            {availableZones.length > 0 && (
                <div className="border-t pt-4">
                    <div className="text-sm font-medium mb-2">Assign New Zone</div>
                    <div className="flex gap-2">
                        <select
                            value={selectedZone}
                            onChange={(e) => setSelectedZone(e.target.value)}
                            className="flex-1 border rounded px-3 py-2 text-sm"
                        >
                            <option value="">Select a zone...</option>
                            {availableZones.map(zone => (
                                <option key={zone.ZoneID} value={zone.ZoneID}>
                                    {zone.ZoneName}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleAssignZone}
                            disabled={!selectedZone}
                            className="bg-green-500 text-white px-4 py-2 rounded text-sm disabled:bg-gray-300"
                        >
                            Assign
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Main Component
export default function TruckZoneInfo() {
    const [trucks, setTrucks] = useState([]);
    const [zones, setZones] = useState([]);
    const [truckZones, setTruckZones] = useState([]);
    const [filter, setFilter] = useState("all"); // all, assigned, unassigned
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [error, setError] = useState(null);

    // Initial load from Firebase
    useEffect(() => {
        refreshAll();
        // eslint-disable-next-line
    }, []);

    async function refreshAll() {
        setLoading(true);
        try {
            setTrucks(await getAllTrucks());
            setZones(await getAllZones());
            setTruckZones(await getAllTruckZone());
        } catch (e) {
            setError("Failed to fetch data: " + e.message);
        }
        setLoading(false);
    }

    // Zone CRUD operations (all update firebase and state)
    async function handleAddZone(zoneName) {
        setSaving(true);
        try {
            // Generate next ZoneID
            const ids = zones.map(z => z.ZoneID);
            let max = 0;
            ids.forEach(id => {
                const n = parseInt(id.replace("ZON_", ""), 10);
                if (!isNaN(n) && n > max) max = n;
            });
            const nextId = "ZON_" + String(max + 1).padStart(5, "0");
            const newZone = await addZone({ ZoneID: nextId, ZoneName: zoneName });
            setZones(prev => [...prev, newZone]);
            setSuccessMsg("Zone added!");
        } catch (e) {
            setError("Failed to add zone: " + e.message);
        }
        setSaving(false);
    }
    async function handleEditZone(zoneId, zoneName) {
        setSaving(true);
        try {
            await updateZone(zoneId, { ZoneID: zoneId, ZoneName: zoneName });
            setZones(prev => prev.map(z => z.ZoneID === zoneId ? { ...z, ZoneName: zoneName } : z));
            setSuccessMsg("Zone updated!");
        } catch (e) {
            setError("Failed to update zone: " + e.message);
        }
        setSaving(false);
    }
    async function handleDeleteZone(zoneId) {
        setSaving(true);
        try {
            await deleteZone(zoneId);
            setZones(prev => prev.filter(z => z.ZoneID !== zoneId));
            setTruckZones(prev => prev.filter(tz => tz.ZoneID !== zoneId));
            setSuccessMsg("Zone deleted!");
        } catch (e) {
            setError("Failed to delete zone: " + e.message);
        }
        setSaving(false);
    }

    // Truck Zone operations (all update firebase and state)
    async function handleAssignZone(truckId, zoneId, isPrimary) {
        setSaving(true);
        try {
            const newAssignment = await addTruckZone({
                TruckID: truckId,
                ZoneID: zoneId,
                IsPrimaryZone: isPrimary
            });
            setTruckZones(prev => [...prev, newAssignment]);
            setSuccessMsg("Zone assigned to truck!");
        } catch (e) {
            setError("Failed to assign zone: " + e.message);
        }
        setSaving(false);
    }

    async function handleRemoveZone(truckId, zoneId) {
        setSaving(true);
        try {
            const [tz] = truckZones.filter(tz => tz.TruckID === truckId && tz.ZoneID === zoneId);
            if (tz) {
                await deleteTruckZone(tz.id || tz.TruckZoneID);
                setTruckZones(prev => prev.filter(tz2 =>
                    !(tz2.TruckID === truckId && tz2.ZoneID === zoneId)
                ));
            }
            setSuccessMsg("Zone removed from truck!");
        } catch (e) {
            setError("Failed to remove zone: " + e.message);
        }
        setSaving(false);
    }

    async function handleSetPrimary(truckId, zoneId, isPrimary) {
        setSaving(true);
        try {
            const tz = truckZones.find(tz => tz.TruckID === truckId && tz.ZoneID === zoneId);
            if (tz) {
                await updateTruckZone(tz.id || tz.TruckZoneID, { ...tz, IsPrimaryZone: isPrimary });
                setTruckZones(prev =>
                    prev.map(tz2 =>
                        tz2.TruckID === truckId && tz2.ZoneID === zoneId
                            ? { ...tz2, IsPrimaryZone: isPrimary }
                            : tz2
                    )
                );
                setSuccessMsg("Primary zone updated!");
            }
        } catch (e) {
            setError("Failed to set primary zone: " + e.message);
        }
        setSaving(false);
    }

    // Filter trucks based on filter and search
    const filteredTrucks = trucks.filter(truck => {
        const truckName = (truck.CarPlate || truck.TruckName || truck.TruckID || "").toLowerCase();
        const matchesSearch = truckName.includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;
        const hasAssignments = truckZones.some(tz => tz.TruckID === truck.TruckID);
        if (filter === "assigned") return hasAssignments;
        if (filter === "unassigned") return !hasAssignments;
        return true;
    });

    return (
        <div className="max-w-7xl mx-auto bg-gray-50 min-h-screen">

            <ZoneManager
                zones={zones}
                onAddZone={handleAddZone}
                onEditZone={handleEditZone}
                onDeleteZone={handleDeleteZone}
            />

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-3 py-1 rounded text-sm ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200"
                                }`}
                        >
                            All Trucks ({trucks.length})
                        </button>
                        <button
                            onClick={() => setFilter("assigned")}
                            className={`px-3 py-1 rounded text-sm ${filter === "assigned" ? "bg-blue-600 text-white" : "bg-gray-200"
                                }`}
                        >
                            Assigned ({trucks.filter(t => truckZones.some(tz => tz.TruckID === t.TruckID)).length})
                        </button>
                        <button
                            onClick={() => setFilter("unassigned")}
                            className={`px-3 py-1 rounded text-sm ${filter === "unassigned" ? "bg-blue-600 text-white" : "bg-gray-200"
                                }`}
                        >
                            Unassigned ({trucks.filter(t => !truckZones.some(tz => tz.TruckID === t.TruckID)).length})
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="Search trucks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border rounded px-3 py-1 text-sm flex-1 max-w-xs"
                    />
                </div>
            </div>

            {/* Truck Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTrucks.map(truck => (
                    <TruckZoneCard
                        key={truck.TruckID}
                        truck={truck}
                        zones={zones}
                        truckZones={truckZones}
                        onAssignZone={handleAssignZone}
                        onRemoveZone={handleRemoveZone}
                        onSetPrimary={handleSetPrimary}
                    />
                ))}
            </div>
            {filteredTrucks.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <div className="text-xl mb-2">No trucks found</div>
                    <div className="text-sm">Try adjusting your filters or search terms</div>
                </div>
            )}
        </div>
    );
}