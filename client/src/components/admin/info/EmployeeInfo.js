import React, { useEffect, useState } from "react";
import {
    getAllEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee
} from "../../../services/informationService";

const FIELD_GUIDANCE = {
    name: "First letter uppercase, e.g. Lee Tian Le",
    role: "E.g. installer, admin, etc.",
    contact_number: "Format: 01XXXXXXXX (no dashes/spaces)"
};

const TABLE_KEYS = ["name", "role", "contact_number", "active_flag"];

const FIELD_LABELS = {
    name: "Name",
    role: "Role",
    contact_number: "Contact Number",
    active_flag: "Active Flag"
};

const ROLE_OPTIONS = ["installer", "delivery team", "warehouse loader team", "admin"];

function Modal({ show, onClose, children }) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
            <div
                className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative max-h-[90] overflow-y-auto"
                tabIndex={-1}
            >
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

function ActiveFlagBadge({ value }) {
    return value
        ? (
            <span className="inline-flex items-center px-2 rounded bg-green-100 text-green-800 font-medium gap-1 text-xs">
                <span className="text-lg">🟢</span> Active
            </span>
        )
        : (
            <span className="inline-flex items-center px-2 rounded bg-red-100 text-red-700 font-medium gap-1 text-xs">
                <span className="text-lg">🔴</span> Inactive
            </span>
        );
}

export default function EmployeeInfo() {
    const [employees, setEmployees] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
    const [modalData, setModalData] = useState({});
    const [editIdx, setEditIdx] = useState(null); // For updating correct index after edit
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => { refreshEmployees(); }, []);

    async function refreshEmployees() {
        setLoading(true);
        try {
            const emps = await getAllEmployees();
            setEmployees(emps);
        } catch (e) {
            setError("Failed to fetch employees: " + e.message);
        }
        setLoading(false);
    }

    function openAddModal() {
        setModalMode("add");
        setModalData({
            name: "",
            role: "",
            contact_number: "",
            active_flag: true
        });
        setModalOpen(true);
        setSuccessMsg(""); setError(null);
    }

    function openEditModal(idx) {
        setModalMode("edit");
        setEditIdx(idx);
        setModalData({ ...employees[idx] });
        setModalOpen(true);
        setSuccessMsg(""); setError(null);
    }

    function handleModalChange(e) {
        const { name, value } = e.target;
        let val = value;
        if (name === "active_flag") {
            val = value === "true";
        }
        if (name === "name") {
            // Capitalize each word
            val = value
                .toLowerCase()
                .split(" ")
                .filter(w => w.trim() !== "")
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");
        }
        setModalData(prev => ({ ...prev, [name]: val }));
    }

    async function handleModalSubmit(e) {
        e.preventDefault();
        setSaving(true); setError(null); setSuccessMsg("");
        try {
            if (modalMode === "add") {
                const newEmp = await addEmployee(modalData);
                setEmployees(prev => [...prev, newEmp]);
                setSuccessMsg("Employee added!");
            } else {
                await updateEmployee(modalData.id, modalData);
                setEmployees(prev =>
                    prev.map((emp, idx) => (idx === editIdx ? { ...modalData } : emp))
                );
                setSuccessMsg("Employee updated!");
            }
            setModalOpen(false);
        } catch (e) {
            setError(modalMode === "add"
                ? "Failed to add employee: " + e.message
                : "Failed to update: " + e.message
            );
        }
        setSaving(false);
    }

    async function handleDelete(id) {
        if (!window.confirm("Delete this employee?")) return;
        setSaving(true);
        setError(null);
        setSuccessMsg("");
        try {
            await deleteEmployee(id);
            setEmployees(prev => prev.filter(emp => emp.id !== id));
            setSuccessMsg("Employee deleted!");
        } catch (e) {
            setError("Failed to delete: " + e.message);
        }
        setSaving(false);
    }

    // Render form field
    function renderInputField(k, val, onChange, isEdit) {
        if (k === "active_flag") {
            return (
                <select
                    name="active_flag"
                    value={val === true ? "true" : "false"}
                    onChange={onChange}
                    className="border p-2 rounded w-full text-sm"
                >
                    <option value="true">Active 🟢</option>
                    <option value="false">Inactive 🔴</option>
                </select>
            );
        }
        if (k === "contact_number") {
            return (
                <input
                    name={k}
                    value={val ?? ""}
                    onChange={onChange}
                    className="border p-2 rounded w-full text-sm"
                    placeholder="01XXXXXXXX"
                    pattern="01[0-9]{8,9}"
                    title={FIELD_GUIDANCE[k]}
                    required
                />
            );
        }
        if (k === "name") {
            return (
                <input
                    name={k}
                    value={val ?? ""}
                    onChange={onChange}
                    className="border p-2 rounded w-full text-sm"
                    placeholder="Lee Tian"
                    title={FIELD_GUIDANCE[k]}
                    required
                />
            );
        }
        if (k === "role") {
            return (
                <select
                    name={k}
                    value={val ?? ""}
                    onChange={onChange}
                    className="border p-2 rounded w-full text-sm"
                    required
                >
                    <option value="">Select a role</option>
                    {ROLE_OPTIONS.map(role => (
                        <option key={role} value={role}>
                            {role}
                        </option>
                    ))}
                </select>
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

    return (
        <div className="bg-white p-3 rounded shadow">
            <div className="flex justify-end mb-4">
                <button
                    onClick={openAddModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-xs"
                >
                    + Add Employee
                </button>
            </div>

            {successMsg && <div className="mb-4 text-green-600 text-xs">{successMsg}</div>}
            {error && <div className="mb-4 text-red-600 text-xs">{error}</div>}

            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border text-xs">#</th>
                            {TABLE_KEYS.map(k => (
                                <th key={k} className="p-2 border capitalize text-xs">
                                    {FIELD_LABELS[k] || k}
                                </th>
                            ))}
                            <th className="p-2 border text-xs">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={TABLE_KEYS.length + 2} className="text-center p-6 text-xs">
                                    Loading...
                                </td>
                            </tr>
                        ) : employees.length === 0 ? (
                            <tr>
                                <td colSpan={TABLE_KEYS.length + 2} className="text-center py-6 text-xs">
                                    No employees found.
                                </td>
                            </tr>
                        ) : (
                            employees.map((emp, idx) => (
                                <tr key={emp.id || emp.EmployeeID} className={""}>
                                    <td className="p-2 border text-center font-mono text-xs">{idx + 1}</td>
                                    {TABLE_KEYS.map(k => (
                                        <td className="p-2 border text-xs" key={k}>
                                            {k === "active_flag" ? (
                                                <ActiveFlagBadge value={emp[k]} />
                                            ) : (
                                                <span className="text-xs">{emp[k] ?? ""}</span>
                                            )}
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
                                                onClick={() => handleDelete(emp.id)}
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

            {/* Add/Edit Employee Modal */}
            <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
                <h3 className="text-xl font-semibold mb-4">
                    {modalMode === "add" ? "Add New Employee" : "Edit Employee"}
                </h3>
                <form onSubmit={handleModalSubmit} className="space-y-3">
                    {TABLE_KEYS.map(k => (
                        <div key={k}>
                            <label className="block font-medium mb-1 capitalize text-sm">{FIELD_LABELS[k] || k}</label>
                            {renderInputField(k, modalData[k], handleModalChange, modalMode === "edit")}
                            {FIELD_GUIDANCE[k] && (
                                <div className="text-xs text-gray-400 mt-1">{FIELD_GUIDANCE[k]}</div>
                            )}
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
                                : (modalMode === "add" ? "Add Employee" : "Save")}
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