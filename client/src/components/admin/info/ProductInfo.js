import React, { useEffect, useState } from "react";
import {
    getAllProducts,
    addProduct,
    updateProduct,
    deleteProduct
} from "../../../services/informationService";

// Guidance for admin input fields
const FIELD_GUIDANCE = {
    ProductName: "E.g. Fridge, TV (standalone)",
    EstimatedInstallationTimeMin: "Minimum installation time (minutes)",
    EstimatedInstallationTimeMax: "Maximum installation time (minutes)",
    PackageLengthCM: "Length (cm)",
    PackageWidthCM: "Width (cm)",
    PackageHeightCM: "Height (cm)",
    FragileFlag: "Is the product fragile?",
    NoLieDownFlag: "Cannot be laid down?",
    InstallerTeamRequiredFlag: "Requires installer team?",
    DismantleRequiredFlag: "Dismantle required before install?",
    DismantleExtraTime: "Extra time for dismantling (minutes)",
};

const TABLE_KEYS = [
    "ProductName",
    "EstimatedInstallationTimeMin",
    "EstimatedInstallationTimeMax",
    "PackageLengthCM",
    "PackageWidthCM",
    "PackageHeightCM",
    "FragileFlag",
    "NoLieDownFlag",
    "InstallerTeamRequiredFlag",
    "DismantleRequiredFlag",
    "DismantleExtraTime"
];

const FIELD_LABELS = {
    ProductName: "Product Name",
    EstimatedInstallationTimeMin: "Est. Time Min (min)",
    EstimatedInstallationTimeMax: "Est. Time Max (min)",
    PackageLengthCM: "Length (cm)",
    PackageWidthCM: "Width (cm)",
    PackageHeightCM: "Height (cm)",
    FragileFlag: "Fragile",
    NoLieDownFlag: "No Lie Down",
    InstallerTeamRequiredFlag: "Installer Team",
    DismantleRequiredFlag: "Dismantle Req.",
    DismantleExtraTime: "Dismantle Extra (min)"
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

export default function ProductInfo() {
    const [products, setProducts] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
    const [modalData, setModalData] = useState({});
    const [editIdx, setEditIdx] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => { refreshProducts(); }, []);
    async function refreshProducts() {
        setLoading(true);
        try { setProducts(await getAllProducts()); } catch (e) { setError("Failed to fetch products: " + e.message); }
        setLoading(false);
    }

    function openAddModal() {
        setModalMode("add");
        setModalData({
            ProductName: "",
            EstimatedInstallationTimeMin: "",
            EstimatedInstallationTimeMax: "",
            PackageLengthCM: "",
            PackageWidthCM: "",
            PackageHeightCM: "",
            FragileFlag: false,
            NoLieDownFlag: false,
            InstallerTeamRequiredFlag: false,
            DismantleRequiredFlag: false,
            DismantleExtraTime: ""
        });
        setModalOpen(true);
        setSuccessMsg(""); setError(null); setEditIdx(null);
    }

    function openEditModal(idx) {
        setModalMode("edit");
        setEditIdx(idx);
        setModalData({ ...products[idx] });
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
                const newProduct = await addProduct(modalData);
                setProducts(prev => [...prev, newProduct]);
                setSuccessMsg("Product added!");
            } else {
                await updateProduct(modalData.ProductID || modalData.product_id || modalData.id, modalData);
                setProducts(prev =>
                    prev.map((b, idx) => (idx === editIdx ? { ...modalData } : b))
                );
                setSuccessMsg("Product updated!");
            }
            setModalOpen(false);
        } catch (e) {
            setError(modalMode === "add"
                ? "Failed to add product: " + e.message
                : "Failed to update: " + e.message
            );
        }
        setSaving(false);
    }

    async function handleDelete(id) {
        if (!window.confirm("Delete this product?")) return;
        setSaving(true); setError(null); setSuccessMsg("");
        try {
            await deleteProduct(id);
            setProducts(prev => prev.filter(t => (t.ProductID || t.product_id || t.id) !== id));
            setSuccessMsg("Product deleted!");
        } catch (e) {
            setError("Failed to delete: " + e.message);
        }
        setSaving(false);
    }

    function renderInputField(k, val, onChange, isEdit) {
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
        return (
            <input
                name={k}
                value={val ?? ""}
                onChange={onChange}
                className="border p-2 rounded w-full text-sm"
                type={typeof val === "number" || k.includes("Time") || k.includes("CM") ? "number" : "text"}
                required={isEdit}
            />
        );
    }
    function renderTableCell(k, val, row) {
        if (typeof val === "boolean") return <BoolBadge value={val} />;
        if ((typeof val === "undefined" || val === null || val === "") && (k === "DismantleExtraTime")) return <span className="text-xs">-</span>;
        return <span className="text-xs">{val ?? "-"}</span>;
    }

    return (
        <div className="bg-white p-3 rounded shadow">
            <div className="flex justify-end mb-4">
                <button onClick={openAddModal} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-xs">+ Add Product</button>
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
                        ) : products.length === 0 ? (
                            <tr><td colSpan={TABLE_KEYS.length + 2} className="text-center py-6 text-xs">No products found.</td></tr>
                        ) : (
                            products.map((item, idx) => (
                                <tr key={item.ProductID || item.product_id || item.id}>
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
                                                onClick={() => handleDelete(item.ProductID || item.product_id || item.id)}
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
                    {modalMode === "add" ? "Add New Product" : "Edit Product"}
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
                                : (modalMode === "add" ? "Add Product" : "Save")}
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