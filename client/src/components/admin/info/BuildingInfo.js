import React, { useEffect, useState } from "react";
import {
    getAllBuildings,
    addBuilding,
    updateBuilding,
    deleteBuilding,
    getAllZones
} from "../../../services/informationService";

const FIELD_GUIDANCE = {
    BuildingName: "E.g. KL Trillion",
    HousingType: "E.g. Condominium, Apartment, etc.",
    PostalCode: "E.g. 51481",
    ZoneID: "Select the zone this building belongs to",
    AccessTimeWindowStart: "E.g. 09:00",
    AccessTimeWindowEnd: "E.g. 17:00",
    LiftAvailable: "Is lift available?",
    LoadingBayAvailable: "Is loading bay available?",
    VehicleSizeLimit: "E.g. 3T, 1T",
    PreRegistrationRequired: "Pre-registration needed for access?",
    SpecialEquipmentNeeded: "Comma-separated list if any. E.g. Trolley, Ladder",
    Notes: "Additional notes (optional)"
};

const TABLE_KEYS = [
    "BuildingName",
    "ZoneID",
    "HousingType",
    "PostalCode",
    "AccessTimeWindowStart",
    "AccessTimeWindowEnd",
    "LiftAvailable",
    "LoadingBayAvailable",
    "VehicleSizeLimit",
    "PreRegistrationRequired",
    "SpecialEquipmentNeeded",
    "Notes"
];

const FIELD_LABELS = {
    BuildingName: "Building Name",
    ZoneID: "Zone",
    HousingType: "Housing Type",
    PostalCode: "Postal Code",
    AccessTimeWindowStart: "Access Start",
    AccessTimeWindowEnd: "Access End",
    LiftAvailable: "Lift",
    LoadingBayAvailable: "Loading Bay",
    VehicleSizeLimit: "Vehicle Size Limit",
    PreRegistrationRequired: "Pre-Reg",
    SpecialEquipmentNeeded: "Special Equipment",
    Notes: "Notes"
};

function BoolBadge({ value }) {
    return value
        ? (<span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium gap-1 text-xs">Yes</span>)
        : (<span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium gap-1 text-xs">No</span>);
}

function Modal({ show, onClose, children }) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto" tabIndex={-1}>
                <button onClick={onClose} className="absolute top-2 right-3 text-gray-400 hover:text-black text-lg" aria-label="Close">&times;</button>
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
    const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
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
                setZones(z);
                const map = {};
                z.forEach(zn => map[zn.ZoneID] = zn.ZoneName || zn.zone_name || zn.name || zn.id);
                setZoneMap(map);
            } catch (e) {
                setError("Failed to fetch zones: " + e.message);
            }
        }
        loadZones();
    }, []);

    useEffect(() => { refreshBuildings(); }, []);
    async function refreshBuildings() {
        setLoading(true);
        try { setBuildings(await getAllBuildings()); } catch (e) { setError("Failed to fetch buildings: " + e.message); }
        setLoading(false);
    }

    function openAddModal() {
        setModalMode("add");
        setModalData({
            BuildingName: "",
            ZoneID: "",
            HousingType: "",
            PostalCode: "",
            AccessTimeWindowStart: "",
            AccessTimeWindowEnd: "",
            LiftAvailable: false,
            LoadingBayAvailable: false,
            VehicleSizeLimit: "",
            PreRegistrationRequired: false,
            SpecialEquipmentNeeded: "",
            Notes: ""
        });
        setModalOpen(true);
        setSuccessMsg(""); setError(null); setEditIdx(null);
    }

    function openEditModal(idx) {
        setModalMode("edit");
        setEditIdx(idx);
        setModalData({ ...buildings[idx] });
        setModalOpen(true);
        setSuccessMsg(""); setError(null);
    }

    function handleModalChange(e) {
        const { name, value, type } = e.target;
        let val = value;
        if (type === "checkbox") {
            val = e.target.checked;
        }
        setModalData(prev => ({ ...prev, [name]: val }));
    }

    async function handleModalSubmit(e) {
        e.preventDefault();
        setSaving(true); setError(null); setSuccessMsg("");
        try {
            if (modalMode === "add") {
                const newBuilding = await addBuilding(modalData);
                setBuildings(prev => [...prev, newBuilding]);
                setSuccessMsg("Building added!");
            } else {
                await updateBuilding(modalData.BuildingID || modalData.building_id || modalData.id, modalData);
                setBuildings(prev =>
                    prev.map((b, idx) => (idx === editIdx ? { ...modalData } : b))
                );
                setSuccessMsg("Building updated!");
            }
            setModalOpen(false);
        } catch (e) {
            setError(modalMode === "add"
                ? "Failed to add building: " + e.message
                : "Failed to update: " + e.message
            );
        }
        setSaving(false);
    }

    async function handleDelete(id) {
        if (!window.confirm("Delete this building?")) return;
        setSaving(true); setError(null); setSuccessMsg("");
        try {
            await deleteBuilding(id);
            setBuildings(prev => prev.filter(t => (t.BuildingID || t.building_id || t.id) !== id));
            setSuccessMsg("Building deleted!");
        } catch (e) {
            setError("Failed to delete: " + e.message);
        }
        setSaving(false);
    }

    function renderInputField(k, val, onChange, isEdit) {
        if (k === "ZoneID") {
            return (
                <select name="ZoneID" value={val ?? ""} onChange={onChange} className="border border-gray-300 p-2 rounded-md w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                    <option value="">Select a zone</option>
                    {zones.map(z => (
                        <option key={z.ZoneID} value={z.ZoneID}>
                            {z.ZoneName || z.zone_name || z.name || z.id}
                        </option>
                    ))}
                </select>
            );
        }
        if (typeof val === "boolean") {
            return (
                <input
                    type="checkbox"
                    name={k}
                    checked={!!val}
                    onChange={onChange}
                    className="h-5 w-5 text-green-600"
                />
            );
        }
        if (k === "Notes" || k === "SpecialEquipmentNeeded") {
            return (
                <textarea
                    name={k}
                    value={val ?? ""}
                    onChange={onChange}
                    className="border border-gray-300 p-2 rounded-md w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                />
            );
        }
        return (
            <input
                name={k}
                value={val ?? ""}
                onChange={onChange}
                className="border border-gray-300 p-2 rounded-md w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required={isEdit}
            />
        );
    }
    function renderTableCell(k, val, row) {
        if (k === "ZoneID") return <span className="text-xs">{zoneMap[val] || val || "-"}</span>;
        if (typeof val === "boolean") return <BoolBadge value={val} />;
        if (k === "Notes" && !val) return <span className="text-xs">-</span>;
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
                                    {FIELD_LABELS[k] || k}
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
                                <tr key={item.BuildingID || item.building_id || item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{idx + 1}</td>
                                    {TABLE_KEYS.map(k => (
                                        <td className="px-4 py-3 text-sm text-gray-900" key={k}>
                                            {renderTableCell(k, item[k], item)}
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
                                                onClick={() => handleDelete(item.BuildingID || item.building_id || item.id)}
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
                            <label className="block font-medium mb-1 text-sm">{FIELD_LABELS[k] || k}</label>
                            {renderInputField(k, modalData[k], handleModalChange, modalMode === "edit")}
                            {FIELD_GUIDANCE[k] && (<div className="text-xs text-gray-400 mt-1">{FIELD_GUIDANCE[k]}</div>)}
                        </div>
                    ))}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
                            disabled={saving}
                        >
                            {saving
                                ? (modalMode === "add" ? "Adding..." : "Saving...")
                                : (modalMode === "add" ? "Add Building" : "Save Changes")}
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