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

// Helper: normalize truck from API (snake_case) to component format (PascalCase)
function normalizeTruck(truck) {
    return {
        id: truck.id,
        CarPlate: truck.plate_no,
        Tone: truck.tone ?? truck.Tone,
        LengthCM: truck.length_cm ?? truck.LengthCM,
        WidthCM: truck.width_cm ?? truck.WidthCM,
        HeightCM: truck.height_cm ?? truck.HeightCM
    };
}

// // Helper: convert component format (PascalCase) to API format (snake_case)
function toApiFormat(truck) {
    return {
        plate_no: truck.CarPlate,
        tone: truck.Tone,
        length_cm: truck.LengthCM,
        width_cm: truck.WidthCM,
        height_cm: truck.HeightCM
    };
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
        try {
            const data = await getAllTrucks();
            console.log('[TruckInfo] Trucks fetched:', { count: data?.length, sample: data?.[0] });
            setTrucks(data.map(normalizeTruck));
        } catch (e) {
            console.error('[TruckInfo] Load error:', e);
            setError("Failed to fetch trucks: " + e.message);
        }
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
        const { name, value } = e.target;
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
            const apiData = toApiFormat(modalData);
            if (modalMode === "add") {
                await addTruck(apiData);
                await refreshTrucks();
                setSuccessMsg("Truck added!");
            } else {
                await updateTruck(modalData.id, apiData);
                await refreshTrucks();
                setSuccessMsg("Truck updated!");
            }
            setModalOpen(false);
        } catch (e) {
            console.error('[TruckInfo] Save error:', e);
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
            setTrucks(prev => prev.filter(t => t.id !== id));
            setSuccessMsg("Truck deleted!");
        } catch (e) {
            console.error('[TruckInfo] Delete error:', e);
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
                    className="border border-gray-300 p-2 rounded-md w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="border border-gray-300 p-2 rounded-md w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                type={["LengthCM", "WidthCM", "HeightCM"].includes(k) ? "number" : "text"}
                required={isEdit}
            />
        );
    }
    function renderTableCell(k, val, row) {
        return <span className="text-xs">{val ?? "-"}</span>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Truck Management</h2>
                <button
                    onClick={openAddModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                >
                    + Add Truck
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
                                        <span className="ml-2 text-gray-500">Loading trucks...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : trucks.length === 0 ? (
                            <tr>
                                <td colSpan={TABLE_KEYS.length + 2} className="text-center py-8 text-gray-500">
                                    No trucks found.
                                </td>
                            </tr>
                        ) : (
                            trucks.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-gray-50">
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
                                                title="Edit Truck"
                                                disabled={saving}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="px-3 py-1 rounded-md text-red-600 hover:bg-red-50 transition-colors duration-200"
                                                title="Delete Truck"
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
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
                            disabled={saving}
                        >
                            {saving
                                ? (modalMode === "add" ? "Adding..." : "Saving...")
                                : (modalMode === "add" ? "Add Truck" : "Save Changes")}
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