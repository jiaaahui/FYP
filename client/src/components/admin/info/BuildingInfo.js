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
        ? (<span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-800 font-medium gap-1 text-xs">Yes</span>)
        : (<span className="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-700 font-medium gap-1 text-xs">No</span>);
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
                <select name="ZoneID" value={val ?? ""} onChange={onChange} className="border p-2 rounded w-full text-sm" required>
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
                    className="border p-2 rounded w-full text-sm"
                    rows={2}
                />
            );
        }
        return (
            <input
                name={k}
                value={val ?? ""}
                onChange={onChange}
                className="border p-2 rounded w-full text-sm"
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
        <div className="bg-white p-3 rounded shadow">
            <div className="flex justify-end mb-4">
                <button onClick={openAddModal} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-xs">+ Add Building</button>
            </div>
            {successMsg && <div className="mb-4 text-green-600 text-xs">{successMsg}</div>}
            {error && <div className="mb-4 text-red-600 text-xs">{error}</div>}
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border text-xs">#</th>
                            {TABLE_KEYS.map(k => <th key={k} className="p-2 border text-xs">{FIELD_LABELS[k] || k}</th>)}
                            <th className="p-2 border text-xs">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={TABLE_KEYS.length + 2} className="text-center p-6 text-xs">Loading...</td></tr>
                        ) : buildings.length === 0 ? (
                            <tr><td colSpan={TABLE_KEYS.length + 2} className="text-center py-6 text-xs">No buildings found.</td></tr>
                        ) : (
                            buildings.map((item, idx) => (
                                <tr key={item.BuildingID || item.building_id || item.id}>
                                    <td className="p-2 border text-center font-mono text-xs">{idx + 1}</td>
                                    {TABLE_KEYS.map(k => (
                                        <td className="p-2 border text-xs" key={k}>
                                            {renderTableCell(k, item[k], item)}
                                        </td>
                                    ))}
                                    <td className="p-2 border text-xs">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(idx)}
                                                className="px-2 py-1 rounded hover:bg-blue-100 text-blue-600 text-lg"
                                                title="Edit"
                                                disabled={saving}
                                                aria-label="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.BuildingID || item.building_id || item.id)}
                                                className="px-2 py-1 rounded hover:bg-red-100 text-red-600 text-lg"
                                                title="Delete"
                                                disabled={saving}
                                                aria-label="Delete"
                                            >
                                                🗑️
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
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-xs"
                            disabled={saving}
                        >
                            {saving
                                ? (modalMode === "add" ? "Adding..." : "Saving...")
                                : (modalMode === "add" ? "Add Building" : "Save")}
                        </button>
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 text-xs"
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