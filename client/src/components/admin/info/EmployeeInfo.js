import React, { useEffect, useState } from "react";
import {
    getAllEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getAllTeams,
    getAllEmployeeTeamAssignments,
    assignOrUpdateEmployeeTeam
} from "../../../services/informationService";
import { TeamBadge } from "./TeamInfo";

const FIELD_GUIDANCE = {
    name: "First letter uppercase, e.g. Lee Tian Le",
    role: "E.g. installer, admin, etc.",
    contact_number: "Format: 01XXXXXXXX (no dashes/spaces)",
    team: "Select the team this employee belongs to"
};

const TABLE_KEYS = ["name", "role", "contact_number", "team", "active_flag"];

const FIELD_LABELS = {
    name: "Name",
    role: "Role",
    contact_number: "Contact Number",
    team: "Team",
    active_flag: "Active Flag"
};

const ROLE_OPTIONS = ["installer", "delivery team", "warehouse loader team", "admin"];

function Modal({ show, onClose, children }) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
            <div
                className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto"
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
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium gap-1 text-xs">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span> Active
            </span>
        )
        : (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium gap-1 text-xs">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span> Inactive
            </span>
        );
}

export default function EmployeeInfo() {
    const [employees, setEmployees] = useState([]);
    const [teams, setTeams] = useState([]);
    const [employeeTeamMap, setEmployeeTeamMap] = useState(new Map());
    const [enrichedEmployees, setEnrichedEmployees] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [modalData, setModalData] = useState({});
    const [editIdx, setEditIdx] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        loadAllData();
    }, []);

    // Load all data and enrich employees with team information
    async function loadAllData() {
        setLoading(true);
        try {
            // Load all data in parallel
            const [employeesData, teamsData, assignmentsData] = await Promise.all([
                getAllEmployees(),
                getAllTeams(),
                getAllEmployeeTeamAssignments()
            ]);

            // Create team lookup map
            const teamMap = new Map();
            teamsData.forEach(team => {
                teamMap.set(team.TeamID, team.TeamType);
            });

            // Create employee-team assignment map
            const empTeamMap = new Map();
            assignmentsData.forEach(assignment => {
                const teamType = teamMap.get(assignment.TeamID);
                empTeamMap.set(assignment.EmployeeID, {
                    TeamID: assignment.TeamID,
                    TeamType: teamType
                });
            });

            // Enrich employees with team information
            const enriched = employeesData.map(emp => ({
                ...emp,
                team: empTeamMap.get(emp.EmployeeID)?.TeamType || null,
                teamId: empTeamMap.get(emp.EmployeeID)?.TeamID || null
            }));

            setEmployees(employeesData);
            setTeams(teamsData);
            setEmployeeTeamMap(empTeamMap);
            setEnrichedEmployees(enriched);
        } catch (e) {
            setError("Failed to load data: " + e.message);
        }
        setLoading(false);
    }

    function openAddModal() {
        setModalMode("add");
        setModalData({
            name: "",
            role: "",
            contact_number: "",
            team: "",
            active_flag: true
        });
        setModalOpen(true);
        setSuccessMsg("");
        setError(null);
    }

    function openEditModal(idx) {
        setModalMode("edit");
        setEditIdx(idx);
        const employee = enrichedEmployees[idx];
        setModalData({
            ...employee,
            team: employee.teamId || "" // Use teamId for the select dropdown
        });
        setModalOpen(true);
        setSuccessMsg("");
        setError(null);
    }

    function handleModalChange(e) {
        const { name, value } = e.target;
        let val = value;

        if (name === "active_flag") {
            val = value === "true";
        }

        setModalData(prev => ({ ...prev, [name]: val }));
    }

    async function handleModalSubmit() {
        setSaving(true);
        setError(null);
        setSuccessMsg("");

        try {
            const employeeData = {
                name: modalData.name,
                role: modalData.role,
                contact_number: modalData.contact_number,
                active_flag: modalData.active_flag
            };

            if (modalMode === "add") {
                // Add new employee
                const newEmp = await addEmployee(employeeData);

                // Assign team only if one is selected
                if (modalData.team) {
                    console.log("Assigning team:", modalData.team);
                    await assignOrUpdateEmployeeTeam(newEmp.EmployeeID, modalData.team);
                }

                setSuccessMsg("Employee added successfully!");
            } else {
                // Update existing employee
                await updateEmployee(modalData.EmployeeID, employeeData);

                // Update team only if it has changed (including null <-> value)
                const oldTeam = modalData.teamId ?? null;
                const newTeam = modalData.team ?? null;

                if (oldTeam !== newTeam) {
                    console.log("Team assignment changed:", oldTeam, "->", newTeam);
                    await assignOrUpdateEmployeeTeam(modalData.EmployeeID, newTeam);
                }

                setSuccessMsg("Employee updated successfully!");
            }

            await loadAllData(); // Refresh data
            setModalOpen(false);
        } catch (e) {
            setError(modalMode === "add"
                ? "Failed to add employee: " + e.message
                : "Failed to update employee: " + e.message
            );
        }

        setSaving(false);
    }

    async function handleDelete(employeeId) {
        if (!window.confirm("Delete this employee? This will also remove their team assignment.")) return;

        setSaving(true);
        setError(null);
        setSuccessMsg("");

        try {
            await deleteEmployee(employeeId);
            setSuccessMsg("Employee deleted successfully!");
            await loadAllData(); // Refresh all data
        } catch (e) {
            setError("Failed to delete employee: " + e.message);
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
                    className="border border-gray-300 p-2 rounded-md w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            );
        }

        if (k === "team") {
            return (
                <select
                    name="team"
                    value={val || ""}
                    onChange={onChange}
                    className="border border-gray-300 p-2 rounded-md w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">Select a team</option>
                    {teams.map(team => (
                        <option key={team.TeamID} value={team.TeamID}>
                            {team.TeamType}
                        </option>
                    ))}
                </select>
            );
        }

        if (k === "contact_number") {
            return (
                <input
                    name={k}
                    value={val ?? ""}
                    onChange={onChange}
                    className="border border-gray-300 p-2 rounded-md w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="border border-gray-300 p-2 rounded-md w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="border border-gray-300 p-2 rounded-md w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="border border-gray-300 p-2 rounded-md w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required={isEdit}
            />
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Employee Management</h2>
                <button
                    onClick={openAddModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                >
                    + Add Employee
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

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                #
                            </th>
                            {TABLE_KEYS.map(k => (
                                <th key={k} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                                        <span className="ml-2 text-gray-500">Loading employees...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : enrichedEmployees.length === 0 ? (
                            <tr>
                                <td colSpan={TABLE_KEYS.length + 2} className="text-center py-8 text-gray-500">
                                    No employees found.
                                </td>
                            </tr>
                        ) : (
                            enrichedEmployees.map((emp, idx) => (
                                <tr key={emp.EmployeeID} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {idx + 1}
                                    </td>
                                    {TABLE_KEYS.map(k => (
                                        <td className="px-4 py-3 text-sm text-gray-900" key={k}>
                                            {k === "active_flag" ? (
                                                <ActiveFlagBadge value={emp[k]} />
                                            ) : k === "team" ? (
                                                <TeamBadge teamType={emp[k]} />
                                            ) : (
                                                <span>{emp[k] ?? "—"}</span>
                                            )}
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(idx)}
                                                className="px-3 py-1 rounded-md text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                                                title="Edit Employee"
                                                disabled={saving}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(emp.EmployeeID)}
                                                className="px-3 py-1 rounded-md text-red-600 hover:bg-red-50 transition-colors duration-200"
                                                title="Delete Employee"
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

            {/* Add/Edit Employee Modal */}
            <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
                <h3 className="text-xl font-semibold mb-6 text-gray-800">
                    {modalMode === "add" ? "Add New Employee" : "Edit Employee"}
                </h3>
                <div className="space-y-4">
                    {TABLE_KEYS.map(k => (
                        <div key={k}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {FIELD_LABELS[k] || k}
                                {k !== "team" && <span className="text-red-500">*</span>}
                            </label>
                            {renderInputField(k, modalData[k], handleModalChange, modalMode === "edit")}
                            {FIELD_GUIDANCE[k] && (
                                <p className="text-xs text-gray-500 mt-1">{FIELD_GUIDANCE[k]}</p>
                            )}
                        </div>
                    ))}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleModalSubmit}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
                            disabled={saving}
                        >
                            {saving
                                ? (modalMode === "add" ? "Adding..." : "Saving...")
                                : (modalMode === "add" ? "Add Employee" : "Save Changes")}
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
                </div>
            </Modal>
        </div>
    );
}