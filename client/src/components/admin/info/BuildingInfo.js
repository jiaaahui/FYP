import React, { useEffect, useState } from "react";
import {
    getAllBuildings,
    addBuilding,
    updateBuilding,
    deleteBuilding,
    getAllZones
} from "../../../services/informationService";

const FIELD_GUIDANCE = {
    building_name: "E.g. KL Trillion",
    housing_type: "E.g. Condominium, Apartment, etc.",
    postal_code: "E.g. 51481",
    zone_id: "Select the zone this building belongs to",
    access_time_window_start: "E.g. 09:00",
    access_time_window_end: "E.g. 17:00",
    lift_available: "Is lift available?",
    lift_dimensions: "E.g. 200cm x 150cm x 220cm",
    loading_bay_available: "Is loading bay available?",
    vehicle_size_limit: "E.g. 3T, 1T",
    vehicle_length_limit: "E.g. 5m",
    vehicle_width_limit: "E.g. 2.5m",
    pre_registration_required: "Pre-registration needed for access?",
    special_equipment_needed: "Comma-separated list if any. E.g. Trolley, Ladder",
    parking_distance: "E.g. 50m from loading bay",
    narrow_doorways: "Does it have narrow doorways?",
    notes: "Additional notes (optional)"
};

const FIELD_LABELS = {
    building_name: "Building Name",
    zone_id: "Zone",
    housing_type: "Housing Type",
    postal_code: "Postal Code",
    access_time_window_start: "Access Start",
    access_time_window_end: "Access End",
    lift_available: "Lift",
    lift_dimensions: "Lift Dimensions",
    loading_bay_available: "Loading Bay",
    vehicle_size_limit: "Vehicle Size Limit",
    vehicle_length_limit: "Vehicle Length Limit",
    vehicle_width_limit: "Vehicle Width Limit",
    pre_registration_required: "Pre-Registration Required",
    special_equipment_needed: "Special Equipment",
    parking_distance: "Parking Distance",
    narrow_doorways: "Narrow Doorways",
    notes: "Notes"
};

// Required fields
const REQUIRED_FIELDS = ["building_name", "zone_id", "housing_type", "postal_code"];

// Table columns
const TABLE_KEYS = Object.keys(FIELD_LABELS);

function BoolBadge({ value }) {
    return value ? (
        <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium gap-1 text-xs">
            Yes
        </span>
    ) : (
        <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium gap-1 text-xs">
            No
        </span>
    );
}

function Modal({ show, onClose, children }) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto" tabIndex={-1}>
                <button
                    onClick={onClose}
                    className="absolute top-2 right-3 text-gray-400 hover:text-black text-lg"
                    aria-label="Close"
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
}

export default function BuildingInfo() {
    const [buildings, setBuildings] = useState([]);
    const [zones, setZones] = useState([]);
    const [zoneMap, setZoneMap] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [modalData, setModalData] = useState({});
    const [editIdx, setEditIdx] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadZones() {
            try {
                const z = await getAllZones();
                const map = {};
                z.forEach(zn => (map[zn.id] = zn.zone_name || zn.name || zn.id));
                setZones(z);
                setZoneMap(map);
            } catch (e) {
                console.error("Load zones error:", e);
                setError("Failed to fetch zones: " + e.message);
            }
        }
        loadZones();
    }, []);

    useEffect(() => { refreshBuildings(); }, []);

    async function refreshBuildings() {
        setLoading(true);
        try {
            const data = await getAllBuildings();
            setBuildings(data);
        } catch (e) {
            console.error("Load buildings error:", e);
            setError("Failed to fetch buildings: " + e.message);
        }
        setLoading(false);
    }

    function openAddModal() {
        setModalMode("add");
        setModalData({
            building_name: "",
            zone_id: "",
            housing_type: "",
            postal_code: "",
            access_time_window_start: "",
            access_time_window_end: "",
            lift_available: false,
            loading_bay_available: false,
            vehicle_size_limit: "",
            vehicle_length_limit: "",
            vehicle_width_limit: "",
            pre_registration_required: false,
            special_equipment_needed: "",
            parking_distance: "",
            narrow_doorways: false,
            lift_dimensions: "",
            notes: ""
            // created_at and updated_at will be handled by database
        });
        setModalOpen(true);
        setSuccessMsg("");
        setError(null);
        setEditIdx(null);
    }

    function openEditModal(idx) {
        setModalMode("edit");
        setEditIdx(idx);
        setModalData({ ...buildings[idx] });
        setModalOpen(true);
        setSuccessMsg("");
        setError(null);
    }

    function handleModalChange(e) {
        const { name, value, type, checked } = e.target;
        setModalData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }

    async function handleModalSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccessMsg("");
        try {
            if (modalMode === "add") {
                // For new buildings, database will set created_at and updated_at
                await addBuilding(modalData);
                setSuccessMsg("Building added!");
            } else {
                // For updates, set updated_at to current time
                const updateData = {
                    ...modalData,
                    updated_at: new Date().toISOString()
                };
                await updateBuilding(updateData.id, updateData);
                setSuccessMsg("Building updated!");
            }
            await refreshBuildings();
            setModalOpen(false);
        } catch (e) {
            console.error("Save error:", e);
            setError(modalMode === "add"
                ? "Failed to add building: " + e.message
                : "Failed to update: " + e.message
            );
        }
        setSaving(false);
    }

    async function handleDelete(id) {
        if (!window.confirm("Delete this building?")) return;
        setSaving(true);
        try {
            await deleteBuilding(id);
            setBuildings(prev => prev.filter(b => b.id !== id));
            setSuccessMsg("Building deleted!");
        } catch (e) {
            console.error("Delete error:", e);
            setError("Failed to delete: " + e.message);
        }
        setSaving(false);
    }

    function renderInputField(k, val, onChange, isEdit) {
        const isRequired = REQUIRED_FIELDS.includes(k);

        if (k === "zone_id") {
            return (
                <select
                    name="zone_id"
                    value={val ?? ""}
                    onChange={onChange}
                    className="border border-gray-300 p-2 rounded-md w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={isRequired}
                >
                    <option value="">Select a zone</option>
                    {zones.map(z => (
                        <option key={z.id} value={z.id}>
                            {z.zone_name || z.name || z.id}
                        </option>
                    ))}
                </select>
            );
        }
        if (typeof val === "boolean") {
            return (
                <input type="checkbox" name={k} checked={!!val} onChange={onChange} className="h-5 w-5 text-green-600" />
            );
        }
        if (k === "notes" || k === "special_equipment_needed" || k === "lift_dimensions") {
            return (
                <textarea
                    name={k}
                    value={val ?? ""}
                    onChange={onChange}
                    className="border border-gray-300 p-2 rounded-md w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    required={isRequired}
                />
            );
        }
        return (
            <input
                name={k}
                value={val ?? ""}
                onChange={onChange}
                className="border border-gray-300 p-2 rounded-md w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required={isRequired}
            />
        );
    }

    function renderTableCell(k, val) {
        if (k === "zone_id") {
            // Display zone name from zoneMap, fallback to ID if name not found
            const zoneName = zoneMap[val];
            return <span className="text-xs">{zoneName || val || "-"}</span>;
        }
        if (typeof val === "boolean") return <BoolBadge value={val} />;
        if (k === "notes" && !val) return <span className="text-xs">-</span>;
        return <span className="text-xs">{val ?? "-"}</span>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Building Management</h2>
                <button
                    onClick={openAddModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                >
                    + Add Building
                </button>
            </div>

            {successMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">{successMsg}</div>}
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                            {TABLE_KEYS.map(k => (
                                <th key={k} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {FIELD_LABELS[k]}
                                </th>
                            ))}
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={TABLE_KEYS.length + 2} className="text-center py-8">
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        <span className="ml-2 text-gray-500">Loading buildings...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : buildings.length === 0 ? (
                            <tr>
                                <td colSpan={TABLE_KEYS.length + 2} className="text-center py-8 text-gray-500">
                                    No buildings found.
                                </td>
                            </tr>
                        ) : (
                            buildings.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{idx + 1}</td>
                                    {TABLE_KEYS.map(k => (
                                        <td className="px-4 py-3 text-sm text-gray-900" key={k}>
                                            {renderTableCell(k, item[k])}
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(idx)}
                                                className="px-3 py-1 rounded-md text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                                                title="Edit Building"
                                                disabled={saving}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="px-3 py-1 rounded-md text-red-600 hover:bg-red-50 transition-colors duration-200"
                                                title="Delete Building"
                                                disabled={saving}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
                <h3 className="text-xl font-semibold mb-4">
                    {modalMode === "add" ? "Add New Building" : "Edit Building"}
                </h3>
                <form onSubmit={handleModalSubmit} className="space-y-3">
                    {TABLE_KEYS.map(k => (
                        <div key={k}>
                            <label className="block font-medium mb-1 text-sm">
                                {FIELD_LABELS[k]}
                                {REQUIRED_FIELDS.includes(k) && (
                                    <span className="text-red-500 ml-1" title="Required field">★</span>
                                )}
                            </label>
                            {renderInputField(k, modalData[k], handleModalChange, modalMode === "edit")}
                            {FIELD_GUIDANCE[k] && (
                                <div className="text-xs text-gray-400 mt-1">{FIELD_GUIDANCE[k]}</div>
                            )}
                        </div>
                    ))}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
                            disabled={saving}
                        >
                            {saving
                                ? modalMode === "add" ? "Adding..." : "Saving..."
                                : modalMode === "add" ? "Add Building" : "Save Changes"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}