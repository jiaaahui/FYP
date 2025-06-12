import React, { useState, useEffect, useCallback } from 'react';
import { useInformationService } from '../../services/informationService';
import DataTable from '../common/DataTable';

function TeamManager({ setError, setLoading }) {
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeeTeamAssignments, setEmployeeTeamAssignments] = useState([]);

  const informationService = useInformationService();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [teamsData, employeesData, assignmentsData] = await Promise.all([
        informationService.getTeams(),
        informationService.getEmployees(),
        informationService.getEmployeeTeamAssignments()
      ]);
      
      setTeams(teamsData);
      setEmployees(employeesData);
      setEmployeeTeamAssignments(assignmentsData);
      setError('');
    } catch (error) {
      setError('Error loading team data: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [informationService, setError, setLoading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getTeamMembers = (teamId) => {
    const assignments = employeeTeamAssignments.filter(a => a.TeamID === teamId);
    return assignments.map(assignment => {
      const employee = employees.find(e => e.EmployeeID === assignment.EmployeeID);
      return employee ? { ...employee, assignmentId: assignment.id } : null;
    }).filter(Boolean);
  };

  const getTeamMemberCount = (teamId) => {
    return employeeTeamAssignments.filter(a => a.TeamID === teamId).length;
  };

  const getUnassignedEmployees = () => {
    const assignedEmployeeIds = employeeTeamAssignments.map(a => a.EmployeeID);
    return employees.filter(e => !assignedEmployeeIds.includes(e.EmployeeID) && e.active_flag);
  };

  const columns = [
    { 
      key: 'TeamID', 
      label: 'Team ID', 
      sortable: true,
      render: (value) => <span className="id-badge">{value}</span>
    },
    {
      key: 'TeamType',
      label: 'Team Type',
      sortable: true,
      render: (value) => (
        <span className={`team-type-badge team-${value.toLowerCase().replace(/\s+/g, '-')}`}>
          {value}
        </span>
      )
    },
    {
      key: 'memberCount',
      label: 'Members',
      render: (value, team) => (
        <span className="member-count">
          {getTeamMemberCount(team.TeamID)} members
        </span>
      )
    },
    {
      key: 'members',
      label: 'Team Members',
      render: (value, team) => {
        const members = getTeamMembers(team.TeamID);
        return (
          <div className="team-members-list">
            {members.length > 0 ? (
              members.map(member => (
                <div key={member.EmployeeID} className="team-member-item">
                  <span className="member-name">{member.name}</span>
                  <span className="member-role">({member.role})</span>
                </div>
              ))
            ) : (
              <span className="no-members">No assigned members</span>
            )}
          </div>
        );
      }
    }
  ];

  const teamStats = {
    totalTeams: teams.length,
    deliveryTeams: teams.filter(t => t.TeamType === 'Delivery').length,
    installerTeams: teams.filter(t => t.TeamType === 'Installer').length,
    warehouseTeams: teams.filter(t => t.TeamType === 'Warehouse').length,
    unassignedEmployees: getUnassignedEmployees().length
  };

  return (
    <div className="team-manager">
      <div className="manager-header">
        <div className="header-content">
          <h2>🔗 Team Management</h2>
          <p>View team assignments and member allocations</p>
        </div>
      </div>

      <div className="data-summary">
        <div className="summary-card">
          <div className="summary-value">{teamStats.totalTeams}</div>
          <div className="summary-label">Total Teams</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{teamStats.deliveryTeams}</div>
          <div className="summary-label">Delivery Teams</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{teamStats.installerTeams}</div>
          <div className="summary-label">Installer Teams</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{teamStats.unassignedEmployees}</div>
          <div className="summary-label">Unassigned Employees</div>
        </div>
      </div>

      <DataTable
        data={teams}
        columns={columns}
        searchable={true}
        searchPlaceholder="Search teams..."
        emptyMessage="No teams found"
      />

      {/* Unassigned Employees Section */}
      {getUnassignedEmployees().length > 0 && (
        <div className="unassigned-section">
          <h3>🚨 Unassigned Employees</h3>
          <div className="unassigned-employees">
            {getUnassignedEmployees().map(employee => (
              <div key={employee.EmployeeID} className="unassigned-employee">
                <div className="employee-info">
                  <span className="employee-name">{employee.name}</span>
                  <span className="employee-role">({employee.role})</span>
                  <span className="employee-id">{employee.EmployeeID}</span>
                </div>
                <span className="unassigned-badge">No Team</span>
              </div>
            ))}
          </div>
          <div className="unassigned-note">
            <p>💡 These employees need to be assigned to teams. Use the Employee Management section to assign them.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamManager;