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
        ? (<span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium gap-1 text-xs">Yes</span>)
        : (<span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium gap-1 text-xs">No</span>);
}

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

// Helper: normalize product from API (snake_case) to component format (PascalCase)
function normalizeProduct(product) {
    return {
        id: product.id,
        ProductName: product.product_name || product.ProductName,
        EstimatedInstallationTimeMin: product.estimated_installation_time_min ?? product.EstimatedInstallationTimeMin,
        EstimatedInstallationTimeMax: product.estimated_installation_time_max ?? product.EstimatedInstallationTimeMax,
        PackageLengthCM: product.package_length_cm ?? product.PackageLengthCM,
        PackageWidthCM: product.package_width_cm ?? product.PackageWidthCM,
        PackageHeightCM: product.package_height_cm ?? product.PackageHeightCM,
        FragileFlag: product.fragile_flag ?? product.FragileFlag ?? false,
        NoLieDownFlag: product.no_lie_down_flag ?? product.NoLieDownFlag ?? false,
        InstallerTeamRequiredFlag: product.installer_team_required_flag ?? product.InstallerTeamRequiredFlag ?? false,
        DismantleRequiredFlag: product.dismantle_required_flag ?? product.DismantleRequiredFlag ?? false,
        DismantleExtraTime: product.dismantle_time ?? product.DismantleTime
    };
}

// Helper: convert component format (PascalCase) to API format (snake_case)
function toApiFormat(product) {
    const toIntOrNull = (v) => {
        if (v === undefined || v === null || v === "") return null;
        // Accept numbers or numeric strings; parse and return integer
        const n = Number(v);
        if (Number.isNaN(n)) return null;
        // If your DB expects integer, use Math.floor or parseInt; here parseInt keeps whole
        return Number.isInteger(n) ? n : Math.round(n);
    };

    return {
        product_name: product.ProductName,
        estimated_installation_time_min: toIntOrNull(product.EstimatedInstallationTimeMin),
        estimated_installation_time_max: toIntOrNull(product.EstimatedInstallationTimeMax),
        package_length_cm: toIntOrNull(product.PackageLengthCM),
        package_width_cm: toIntOrNull(product.PackageWidthCM),
        package_height_cm: toIntOrNull(product.PackageHeightCM),
        fragile_flag: product.FragileFlag,
        no_lie_down_flag: product.NoLieDownFlag,
        installer_team_required_flag: product.InstallerTeamRequiredFlag,
        dismantle_required_flag: product.DismantleRequiredFlag,
        dismantle_time: product.DismantleTime || null
    };
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
        try {
            const data = await getAllProducts();
            console.log('[ProductInfo] Products fetched:', {
                count: data?.length,
                sample: data?.[0]
            });
            setProducts(data.map(normalizeProduct));
        } catch (e) {
            console.error('[ProductInfo] Load error:', e);
            setError("Failed to fetch products: " + e.message);
        }
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
            const apiData = toApiFormat(modalData);
            if (modalMode === "add") {
                const newProduct = await addProduct(apiData);
                console.log('[ProductInfo] Product added:', newProduct);
                await refreshProducts(); // Refresh to get normalized data
                setSuccessMsg("Product added!");
            } else {
                await updateProduct(modalData.id, apiData);
                await refreshProducts(); // Refresh to get normalized data
                setSuccessMsg("Product updated!");
            }
            setModalOpen(false);
        } catch (e) {
            console.error('[ProductInfo] Save error:', e);
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
            setProducts(prev => prev.filter(t => t.id !== id));
            setSuccessMsg("Product deleted!");
        } catch (e) {
            console.error('[ProductInfo] Delete error:', e);
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
                className="border border-gray-300 p-2 rounded-md w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                type={typeof val === "number" || k.includes("Time") || k.includes("time") || k.includes("CM") ? "number" : "text"}
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
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Product Management</h2>
                <button
                    onClick={openAddModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                >
                    + Add Product
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
                                        <span className="ml-2 text-gray-500">Loading products...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan={TABLE_KEYS.length + 2} className="text-center py-8 text-gray-500">
                                    No products found.
                                </td>
                            </tr>
                        ) : (
                            products.map((item, idx) => (
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
                                                title="Edit Product"
                                                disabled={saving}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="px-3 py-1 rounded-md text-red-600 hover:bg-red-50 transition-colors duration-200"
                                                title="Delete Product"
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
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
                            disabled={saving}
                        >
                            {saving
                                ? (modalMode === "add" ? "Adding..." : "Saving...")
                                : (modalMode === "add" ? "Add Product" : "Save Changes")}
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