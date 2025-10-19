import React, { useEffect, useState } from "react";
import { TeamBadge } from "./TeamInfo";

// Field label / guidance constants
const FIELD_GUIDANCE = {
  name: "First letter uppercase, e.g. Lee Tian Le",
  role: "E.g. installer, admin, etc.",
  contact_number: "Format: 01XXXXXXXX (no dashes/spaces)",
  team: "Select the team this employee belongs to",
  email: "Press Tab to accept suggested email or type your own",
  password: "Set a secure password for the employee"
};

const TABLE_KEYS = ["name", "role", "contact_number", "email", "team", "active_flag"];
const FIELD_LABELS = {
  name: "Name",
  role: "Role",
  contact_number: "Contact Number",
  email: "Email",
  team: "Team",
  active_flag: "Active Flag",
  password: "Password"
};

const ROLE_OPTIONS = ["installer", "delivery team", "warehouse loader team", "admin"];

function generateEmailFromName(name) {
  if (!name || name.trim().length === 0) return "";
  const cleanName = name.trim().toLowerCase();
  const emailName = cleanName.replace(/\s+/g, '');
  const sanitizedName = emailName.replace(/[^a-z0-9.]/g, '');
  return `${sanitizedName}@gmail.com`;
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

function ActiveFlagBadge({ value }) {
  return value ? (
    <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium gap-1 text-xs">
      <span className="w-2 h-2 bg-green-500 rounded-full"></span> Active
    </span>
  ) : (
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

  // Email suggestion states
  const [suggestedEmail, setSuggestedEmail] = useState("");
  const [showEmailSuggestion, setShowEmailSuggestion] = useState(false);
  const [emailInputRef, setEmailInputRef] = useState(null);

  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      // Fetch employees, teams and assignments from your Postgres REST API
      const [employeesRes, teamsRes, assignmentsRes] = await Promise.all([
        fetch('/api/employees').then(r => r.json()),
        fetch('/api/teams').then(r => r.json()),
        fetch('/api/employee-team-assignments').then(r => r.json()).catch(() => [])
      ]);

      const teamMap = new Map();
      (teamsRes || []).forEach(team => {
        teamMap.set(team.teamID || team.TeamID, team.teamType || team.TeamType);
      });

      const empTeamMap = new Map();
      (assignmentsRes || []).forEach(asg => {
        const teamType = teamMap.get(asg.teamID || asg.TeamID);
        empTeamMap.set(asg.employeeID || asg.EmployeeID, {
          TeamID: asg.teamID || asg.TeamID,
          TeamType: teamType
        });
      });

      const enriched = (employeesRes || []).map(emp => ({
        ...emp,
        team: empTeamMap.get(emp.employeeID || emp.EmployeeID)?.TeamType || null,
        teamId: empTeamMap.get(emp.employeeID || emp.EmployeeID)?.TeamID || null
      }));

      setEmployees(employeesRes || []);
      setTeams(teamsRes || []);
      setEmployeeTeamMap(empTeamMap);
      setEnrichedEmployees(enriched);
    } catch (e) {
      console.error("loadAllData error:", e);
      setError("Failed to load data: " + (e.message || e));
    }
    setLoading(false);
  }

  function openAddModal() {
    setModalMode("add");
    setModalData({
      name: "",
      email: "",
      password: "",
      role: "",
      contact_number: "",
      team: "",
      active_flag: true
    });
    setModalOpen(true);
    setSuccessMsg("");
    setError(null);
    setSuggestedEmail("");
    setShowEmailSuggestion(false);
  }

  function openEditModal(idx) {
    setModalMode("edit");
    setEditIdx(idx);
    const employee = enrichedEmployees[idx];
    setModalData({
      ...employee,
      password: "",
      team: employee.teamId || ""
    });
    setModalOpen(true);
    setSuccessMsg("");
    setError(null);
    setSuggestedEmail("");
    setShowEmailSuggestion(false);
  }

  function handleModalChange(e) {
    const { name, value } = e.target;
    let val = value;
    if (name === "active_flag") val = value === "true";
    setModalData(prev => ({ ...prev, [name]: val }));

    if (name === "name" && modalMode === "add") {
      const suggested = generateEmailFromName(value);
      setSuggestedEmail(suggested);
      setShowEmailSuggestion(value.trim().length > 0 && !modalData.email);
    }
  }

  function handleEmailKeyDown(e) {
    if (e.key === "Tab" && showEmailSuggestion && suggestedEmail) {
      e.preventDefault();
      setModalData(prev => ({ ...prev, email: suggestedEmail }));
      setShowEmailSuggestion(false);
    }
  }
  function handleEmailFocus() {
    if (modalMode === "add" && modalData.name && !modalData.email) {
      setShowEmailSuggestion(true);
    }
  }
  function handleEmailBlur() {
    setTimeout(() => setShowEmailSuggestion(false), 150);
  }

  function isDuplicateEmail(email) {
    if (!email) return false;
    const lower = email.toLowerCase();
    return enrichedEmployees.some(emp => (emp.email || '').toLowerCase() === lower);
  }

  async function handleModalSubmit() {
    setSaving(true);
    setError(null);
    setSuccessMsg("");

    try {
      if (modalMode === "add") {
        if (!modalData.password || modalData.password.length < 6) {
          setError("Password is required and must be at least 6 characters.");
          setSaving(false);
          return;
        }
        if (!modalData.email) {
          setError("Email is required.");
          setSaving(false);
          return;
        }
        if (isDuplicateEmail(modalData.email)) {
          setError("Email already exists. Choose another email.");
          setSaving(false);
          return;
        }
      } else {
        const initial = enrichedEmployees[editIdx];
        if (modalData.email && modalData.email !== initial.email && isDuplicateEmail(modalData.email)) {
          setError("Email already exists. Choose another email.");
          setSaving(false);
          return;
        }
      }

      const payload = {
        name: modalData.name,
        email: modalData.email,
        role: modalData.role,
        contact_number: modalData.contact_number,
        active_flag: modalData.active_flag,
        displayName: modalData.name
      };

      let res;
      if (modalMode === "add") {
        payload.password = modalData.password;
        res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.status === 409) {
          const body = await res.json();
          throw new Error(body.error || 'Email already exists');
        }
        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || 'Failed to create employee');
        }
        setSuccessMsg("Employee added successfully!");
      } else {
        if (modalData.password && modalData.password.length >= 6) {
          payload.password = modalData.password;
        }
        res = await fetch(`/api/employees/${modalData.employeeID || modalData.employeeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.status === 409) {
          const body = await res.json();
          throw new Error(body.error || 'Email already exists');
        }
        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || 'Failed to update employee');
        }
        setSuccessMsg("Employee updated successfully!");
      }

      // If team selected, call assignment API (POST assign)
      if (modalData.team) {
        await fetch('/api/employee-team-assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeID: (await res.json()).employeeID || modalData.employeeID || modalData.employeeId, teamID: modalData.team })
        }).catch(err => {
          console.warn('team-assignment failed', err);
        });
      }

      await loadAllData();
      setModalOpen(false);
    } catch (e) {
      console.error('handleModalSubmit error', e);
      setError(e.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(employeeId) {
    if (!window.confirm("Delete this employee? This will also remove their team assignment.")) return;
    setSaving(true);
    setError(null);
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/employees/${employeeId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete employee');
      setSuccessMsg("Employee deleted successfully!");
      await loadAllData();
    } catch (e) {
      setError("Failed to delete employee: " + e.message);
    }
    setSaving(false);
  }

  // Render input field (adds password input in add modal)
  function renderInputField(k, val, onChange, isEdit) {
    if (k === "active_flag") {
      return (
        <select name="active_flag" value={val === true ? "true" : "false"} onChange={onChange}
          className="border border-gray-300 p-2 rounded-md w-full text-sm">
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      );
    }

    if (k === "team") {
      return (
        <select name="team" value={val || ""} onChange={onChange}
          className="border border-gray-300 p-2 rounded-md w-full text-sm">
          <option value="">Select a team</option>
          {teams.map(team => (
            <option key={team.teamID || team.TeamID} value={team.teamID || team.TeamID}>
              {team.teamType || team.TeamType}
            </option>
          ))}
        </select>
      );
    }

    if (k === "email") {
      return (
        <div className="relative">
          <input ref={setEmailInputRef} name={k} type="email" value={val ?? ""} onChange={onChange}
            onKeyDown={handleEmailKeyDown} onFocus={handleEmailFocus} onBlur={handleEmailBlur}
            className="border border-gray-300 p-2 rounded-md w-full text-sm" placeholder="email@example.com" required />
          {showEmailSuggestion && suggestedEmail && modalMode === "add" && (
            <div className="absolute top-full left-0 right-0 bg-blue-50 border border-blue-200 rounded-md mt-1 p-2 text-sm text-blue-700 z-10">
              <div className="flex items-center justify-between">
                <span>Suggested: <strong>{suggestedEmail}</strong></span>
                <span className="text-xs text-blue-500">Press Tab to accept</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (k === "contact_number") {
      return <input name={k} value={val ?? ""} onChange={onChange} placeholder="01XXXXXXXX" pattern="01[0-9]{8,9}"
        className="border border-gray-300 p-2 rounded-md w-full text-sm" title={FIELD_GUIDANCE[k]} />;
    }

    if (k === "name") {
      return <input name={k} value={val ?? ""} onChange={onChange} placeholder="Lee Tian" className="border border-gray-300 p-2 rounded-md w-full text-sm" />;
    }

    if (k === "role") {
      return (
        <select name={k} value={val ?? ""} onChange={onChange} className="border border-gray-300 p-2 rounded-md w-full text-sm">
          <option value="">Select a role</option>
          {ROLE_OPTIONS.map(role => <option key={role} value={role}>{role}</option>)}
        </select>
      );
    }

    // fallback
    return <input name={k} value={val ?? ""} onChange={onChange} className="border border-gray-300 p-2 rounded-md w-full text-sm" />;
  }

  // Render
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Employee Management</h2>
        <button onClick={openAddModal} className="bg-blue-600 text-white px-4 py-2 rounded-md">+ Add Employee</button>
      </div>

      {successMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">{successMsg}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50"><tr>
            <th>#</th>
            {TABLE_KEYS.map(k => <th key={k}>{FIELD_LABELS[k] || k}</th>)}
            <th>Actions</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={TABLE_KEYS.length+2}>Loading...</td></tr> :
              enrichedEmployees.length === 0 ? <tr><td colSpan={TABLE_KEYS.length+2}>No employees</td></tr> :
              enrichedEmployees.map((emp, idx) => (
                <tr key={emp.employeeID || emp.EmployeeID} className="hover:bg-gray-50">
                  <td>{idx+1}</td>
                  {TABLE_KEYS.map(k => (
                    <td key={k}>
                      {k === 'active_flag' ? <ActiveFlagBadge value={emp.active_flag} /> :
                        k === 'team' ? <TeamBadge teamType={emp.team} /> : <span>{emp[k] ?? '—'}</span>}
                    </td>
                  ))}
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(idx)} className="text-blue-600">Edit</button>
                      <button onClick={() => handleDelete(emp.employeeID || emp.EmployeeID)} className="text-red-600">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 className="text-xl font-semibold mb-6">{modalMode === 'add' ? 'Add New Employee' : 'Edit Employee'}</h3>
        <div className="space-y-4">
          {TABLE_KEYS.concat(modalMode === 'add' ? ['password'] : []).map(k => (
            <div key={k}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{FIELD_LABELS[k] || k}{k !== 'team' && <span className="text-red-500">*</span>}</label>
              {k === 'password' ? (
                <input name="password" value={modalData.password || ''} onChange={handleModalChange} type="password"
                  className="border border-gray-300 p-2 rounded-md w-full text-sm" placeholder="Set password (min 6 chars)" />
              ) : renderInputField(k, modalData[k], handleModalChange, modalMode === 'edit')}
              {FIELD_GUIDANCE[k] && <p className="text-xs text-gray-500 mt-1">{FIELD_GUIDANCE[k]}</p>}
            </div>
          ))}
          <div className="flex gap-3 pt-4">
            <button onClick={handleModalSubmit} disabled={saving} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md">
              {saving ? (modalMode === 'add' ? 'Adding...' : 'Saving...') : (modalMode === 'add' ? 'Add Employee' : 'Save Changes')}
            </button>
            <button onClick={() => setModalOpen(false)} disabled={saving} className="flex-1 bg-gray-300 px-4 py-2 rounded-md">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}