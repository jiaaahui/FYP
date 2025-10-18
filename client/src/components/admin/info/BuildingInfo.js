import React, { useEffect, useState } from "react";
import { building, zone } from "../../../api/Api"; // ✅ use Prisma-based API hooks

// --- Field setup remains the same ---
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
    ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium gap-1 text-xs">
        Yes
      </span>
    )
    : (
      <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium gap-1 text-xs">
        No
      </span>
    );
}

function Modal({ show, onClose, children }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto"
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

  // ===============================
  // 📍 Load Zones from DB
  // ===============================
  useEffect(() => {
    async function loadZones() {
      try {
        const z = await zone.list();
        setZones(z);
        const map = {};
        z.forEach((zn) => (map[zn.id] = zn.ZoneName || zn.zone_name || zn.name || zn.id));
        setZoneMap(map);
      } catch (e) {
        setError("Failed to fetch zones: " + e.message);
      }
    }
    loadZones();
  }, []);

  // ===============================
  // 🏢 Load Buildings
  // ===============================
  useEffect(() => {
    refreshBuildings();
  }, []);

  async function refreshBuildings() {
    setLoading(true);
    try {
      const data = await building.list();
      // Prisma stores JSON in data column (if so)
      const formatted = data.map((b) => ({
        id: b.id,
        ...b.data,
        ZoneID: b.data?.ZoneID || b.ZoneID,
      }));
      setBuildings(formatted);
    } catch (e) {
      setError("Failed to fetch buildings: " + e.message);
    }
    setLoading(false);
  }

  // ===============================
  // ➕ Open Add Modal
  // ===============================
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
    setSuccessMsg("");
    setError(null);
    setEditIdx(null);
  }

  // ===============================
  // ✏️ Open Edit Modal
  // ===============================
  function openEditModal(idx) {
    setModalMode("edit");
    setEditIdx(idx);
    setModalData({ ...buildings[idx] });
    setModalOpen(true);
    setSuccessMsg("");
    setError(null);
  }

  // ===============================
  // 🧩 Handle input change
  // ===============================
  function handleModalChange(e) {
    const { name, value, type, checked } = e.target;
    setModalData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  // ===============================
  // 💾 Save (Add/Edit)
  // ===============================
  async function handleModalSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg("");

    try {
      if (modalMode === "add") {
        const newBuilding = await building.create({ data: modalData });
        setBuildings((prev) => [...prev, { id: newBuilding.id, ...modalData }]);
        setSuccessMsg("Building added!");
      } else {
        const id = modalData.id || modalData.BuildingID;
        await building.update(id, { data: modalData });
        setBuildings((prev) =>
          prev.map((b, idx) => (idx === editIdx ? { ...modalData, id } : b))
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

  // ===============================
  // 🗑️ Delete
  // ===============================
  async function handleDelete(id) {
    if (!window.confirm("Delete this building?")) return;
    setSaving(true);
    setError(null);
    setSuccessMsg("");
    try {
      await building.remove(id);
      setBuildings((prev) => prev.filter((t) => t.id !== id));
      setSuccessMsg("Building deleted!");
    } catch (e) {
      setError("Failed to delete: " + e.message);
    }
    setSaving(false);
  }

  // ===============================
  // 🧱 Render Input Field
  // ===============================
  function renderInputField(k, val, onChange, isEdit) {
    if (k === "ZoneID") {
      return (
        <select
          name="ZoneID"
          value={val ?? ""}
          onChange={onChange}
          className="border border-gray-300 p-2 rounded-md w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Select a zone</option>
          {zones.map((z) => (
            <option key={z.id} value={z.id}>
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

  // ===============================
  // 🧾 Render Table Cell
  // ===============================
  function renderTableCell(k, val) {
    if (k === "ZoneID") return <span className="text-xs">{zoneMap[val] || val || "-"}</span>;
    if (typeof val === "boolean") return <BoolBadge value={val} />;
    if (k === "Notes" && !val) return <span className="text-xs">-</span>;
    return <span className="text-xs">{val ?? "-"}</span>;
  }

  // ===============================
  // 🎨 UI Layout
  // ===============================
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

      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* --- Table --- */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              {TABLE_KEYS.map((k) => (
                <th
                  key={k}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {FIELD_LABELS[k] || k}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
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
                  {TABLE_KEYS.map((k) => (
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
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 rounded-md text-red-600 hover:bg-red-50 transition-colors duration-200"
                        title="Delete Building"
                        disabled={saving}
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

      {/* --- Modal --- */}
      <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 className="text-xl font-semibold mb-4">
          {modalMode === "add" ? "Add New Building" : "Edit Building"}
        </h3>
        <form onSubmit={handleModalSubmit} className="space-y-3">
          {TABLE_KEYS.map((k) => (
            <div key={k}>
              <label className="block font-medium mb-1 text-sm">{FIELD_LABELS[k] || k}</label>
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
                ? modalMode === "add"
                  ? "Adding..."
                  : "Saving..."
                : modalMode === "add"
                ? "Add Building"
                : "Save Changes"}
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
