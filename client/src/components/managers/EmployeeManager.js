import React, { useState, useEffect, useCallback } from 'react';
import { useInformationService } from '../../services/informationService';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';

function EmployeeManager({ setError, setLoading }) {
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [employeeTeamAssignments, setEmployeeTeamAssignments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    EmployeeID: '',
    name: '',
    role: 'delivery team',
    contact_number: '',
    active_flag: true
  });

  const informationService = useInformationService();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [employeesData, teamsData, assignmentsData] = await Promise.all([
        informationService.getEmployees(),
        informationService.getTeams(),
        informationService.getEmployeeTeamAssignments()
      ]);
      setEmployees(employeesData);
      setTeams(teamsData);
      setEmployeeTeamAssignments(assignmentsData);
      setError('');
    } catch (error) {
      setError('Error loading employee data: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [informationService, setError, setLoading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getEmployeeTeam = (employeeId) => {
    const assignment = employeeTeamAssignments.find(a => a.EmployeeID === employeeId);
    if (!assignment) return 'Unassigned';
    
    const team = teams.find(t => t.TeamID === assignment.TeamID);
    return team ? `${team.TeamID} (${team.TeamType})` : 'Unknown Team';
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setFormData({
      EmployeeID: `EMP_${String(employees.length + 1).padStart(5, '0')}`,
      name: '',
      role: 'delivery team',
      contact_number: '',
      active_flag: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData(employee);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (employee) => {
    try {
      setLoading(true);
      await informationService.updateEmployee(employee.EmployeeID, {
        ...employee,
        active_flag: !employee.active_flag
      });
      await loadData();
      setError('');
    } catch (error) {
      setError('Error updating employee status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        setLoading(true);
        await informationService.deleteEmployee(employeeId);
        await loadData();
        setError('');
      } catch (error) {
        setError('Error deleting employee: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (editingEmployee) {
        await informationService.updateEmployee(formData.EmployeeID, formData);
      } else {
        await informationService.createEmployee(formData);
      }
      setIsModalOpen(false);
      await loadData();
      setError('');
    } catch (error) {
      setError('Error saving employee: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      key: 'EmployeeID', 
      label: 'Employee ID', 
      sortable: true,
      render: (value) => <span className="id-badge">{value}</span>
    },
    { 
      key: 'name', 
      label: 'Name', 
      sortable: true,
      render: (value) => <span className="employee-name">{value}</span>
    },
    { 
      key: 'role', 
      label: 'Role', 
      sortable: true,
      render: (value) => (
        <span className={`role-badge ${value.replace(' ', '-')}`}>
          {value}
        </span>
      )
    },
    { 
      key: 'contact_number', 
      label: 'Contact', 
      render: (value) => <span className="contact-number">{value}</span>
    },
    {
      key: 'team',
      label: 'Team Assignment',
      render: (value, employee) => (
        <span className="team-assignment">{getEmployeeTeam(employee.EmployeeID)}</span>
      )
    },
    {
      key: 'active_flag',
      label: 'Status',
      render: (value) => (
        <span className={`status-badge ${value ? 'active' : 'inactive'}`}>
          {value ? '✅ Active' : '❌ Inactive'}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: 'Edit',
      icon: '✏️',
      onClick: handleEdit,
      variant: 'primary'
    },
    {
      label: (employee) => employee.active_flag ? 'Deactivate' : 'Activate',
      icon: (employee) => employee.active_flag ? '🔴' : '🟢',
      onClick: handleToggleStatus,
      variant: 'warning'
    },
    {
      label: 'Delete',
      icon: '🗑️',
      onClick: (employee) => handleDelete(employee.EmployeeID),
      variant: 'danger'
    }
  ];

  const roles = ['delivery team', 'installer', 'warehouse loader team', 'supervisor', 'manager'];

  return (
    <div className="employee-manager">
      <div className="manager-header">
        <div className="header-content">
          <h2>👥 Employee Management</h2>
          <p>Manage staff information and assignments</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <span className="btn-icon">➕</span>
          Add New Employee
        </button>
      </div>

      <div className="data-summary">
        <div className="summary-card">
          <div className="summary-value">{employees.length}</div>
          <div className="summary-label">Total Employees</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">
            {employees.filter(e => e.active_flag).length}
          </div>
          <div className="summary-label">Active Employees</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">
            {employees.filter(e => e.role === 'delivery team').length}
          </div>
          <div className="summary-label">Delivery Team</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">
            {employees.filter(e => e.role === 'installer').length}
          </div>
          <div className="summary-label">Installers</div>
        </div>
      </div>

      <DataTable
        data={employees}
        columns={columns}
        actions={actions}
        searchable={true}
        searchPlaceholder="Search employees..."
        emptyMessage="No employees found"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
      >
        <div className="form-container">
          <div className="form-group">
            <label className="form-label">Employee ID</label>
            <input
              type="text"
              className="form-input"
              value={formData.EmployeeID}
              onChange={(e) => setFormData({ ...formData, EmployeeID: e.target.value })}
              disabled={editingEmployee !== null}
              placeholder="EMP_00001"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter employee name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Contact Number</label>
            <input
              type="tel"
              className="form-input"
              value={formData.contact_number}
              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
              placeholder="Enter contact number"
              required
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.active_flag}
                onChange={(e) => setFormData({ ...formData, active_flag: e.target.checked })}
              />
              <span>Active Employee</span>
            </label>
          </div>

          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={!formData.name.trim() || !formData.contact_number.trim()}
            >
              {editingEmployee ? 'Update' : 'Create'} Employee
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default EmployeeManager;