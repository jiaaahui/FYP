import React, { useEffect, useState } from "react";
import {
    getAllTrucks,
    addTruck,
    updateTruck,
    deleteTruck,
} from "../../../services/informationService";

// Guidance for admin input fields
const FIELD_GUIDANCE = {
    CarPlate: "E.g. ABC1234 (3 uppercase letters followed by 4 numbers)",
    Tone: "1 or 3 (tonnage of the truck)",
    LengthCM: "Truck length in centimeters (e.g., 260)",
    WidthCM: "Truck width in centimeters (e.g., 170)",
    HeightCM: "Truck height in centimeters (e.g., 180)",
};

const TABLE_KEYS = [
    "CarPlate",
    "Tone",
    "LengthCM",
    "WidthCM",
    "HeightCM"
];

const FIELD_LABELS = {
    CarPlate: "Car Plate",
    Tone: "Tonnage",
    LengthCM: "Length (cm)",
    WidthCM: "Width (cm)",
    HeightCM: "Height (cm)",
};

function Modal({ show, onClose, children }) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto" tabIndex={-1}>
                <button onClick={onClose} className="absolute top-2 right-3 text-gray-400 hover:text-black text-lg" aria-label="Close">&times;</button>
                {children}
            </div>
        </div>
    );
}

export default function TruckInfo() {
    const [trucks, setTrucks] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
    const [modalData, setModalData] = useState({});
    const [editIdx, setEditIdx] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => { refreshTrucks(); }, []);
    async function refreshTrucks() {
        setLoading(true);
        try { setTrucks(await getAllTrucks()); } catch (e) { setError("Failed to fetch trucks: " + e.message); }
        setLoading(false);
    }

    function openAddModal() {
        setModalMode("add");
        setModalData({
            CarPlate: "",
            Tone: "",
            LengthCM: "",
            WidthCM: "",
            HeightCM: "",
        });
        setModalOpen(true);
        setSuccessMsg(""); setError(null); setEditIdx(null);
    }

    function openEditModal(idx) {
        setModalMode("edit");
        setEditIdx(idx);
        setModalData({ ...trucks[idx] });
        setModalOpen(true);
        setSuccessMsg(""); setError(null);
    }

    function handleModalChange(e) {
        const { name, value, type } = e.target;
        let val = value;
        if (["Tone", "LengthCM", "WidthCM", "HeightCM"].includes(name)) {
            val = value === "" ? "" : Number(value);
        }
        setModalData(prev => ({ ...prev, [name]: val }));
    }

    async function handleModalSubmit(e) {
        e.preventDefault();
        setSaving(true); setError(null); setSuccessMsg("");
        try {
            if (modalMode === "add") {
                const newTruck = await addTruck(modalData);
                setTrucks(prev => [...prev, newTruck]);
                setSuccessMsg("Truck added!");
            } else {
                await updateTruck(modalData.TruckID || modalData.truck_id || modalData.id, modalData);
                setTrucks(prev =>
                    prev.map((b, idx) => (idx === editIdx ? { ...modalData } : b))
                );
                setSuccessMsg("Truck updated!");
            }
            setModalOpen(false);
        } catch (e) {
            setError(modalMode === "add"
                ? "Failed to add truck: " + e.message
                : "Failed to update: " + e.message
            );
        }
        setSaving(false);
    }

    async function handleDelete(id) {
        if (!window.confirm("Delete this truck?")) return;
        setSaving(true); setError(null); setSuccessMsg("");
        try {
            await deleteTruck(id);
            setTrucks(prev => prev.filter(t => (t.TruckID || t.truck_id || t.id) !== id));
            setSuccessMsg("Truck deleted!");
        } catch (e) {
            setError("Failed to delete: " + e.message);
        }
        setSaving(false);
    }

    function renderInputField(k, val, onChange, isEdit) {
        // Only Tone is select, all others are text/number
        if (k === "Tone") {
            return (
                <select
                    name="Tone"
                    value={val === "" ? "" : String(val)}
                    onChange={onChange}
                    className="border p-2 rounded w-full text-sm"
                    required
                >
                    <option value="">Select tonnage</option>
                    <option value="1">1</option>
                    <option value="3">3</option>
                </select>
            );
        }
        return (
            <input
                name={k}
                value={val ?? ""}
                onChange={onChange}
                className="border p-2 rounded w-full text-sm"
                type={["LengthCM", "WidthCM", "HeightCM"].includes(k) ? "number" : "text"}
                required={isEdit}
            />
        );
    }
    function renderTableCell(k, val, row) {
        return <span className="text-xs">{val ?? "-"}</span>;
    }

    return (
        <div className="bg-white p-3 rounded shadow">
            <div className="flex justify-end mb-4">
                <button onClick={openAddModal} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-xs">+ Add Truck</button>
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
                        ) : trucks.length === 0 ? (
                            <tr><td colSpan={TABLE_KEYS.length + 2} className="text-center py-6 text-xs">No trucks found.</td></tr>
                        ) : (
                            trucks.map((item, idx) => (
                                <tr key={item.TruckID || item.truck_id || item.id}>
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
                                                onClick={() => handleDelete(item.TruckID || item.truck_id || item.id)}
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
                    {modalMode === "add" ? "Add New Truck" : "Edit Truck"}
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
                                : (modalMode === "add" ? "Add Truck" : "Save")}
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