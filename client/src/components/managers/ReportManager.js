import React, { useState, useEffect } from 'react';
import { useInformationService } from '../../services/informationService';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';

function ReportManager({ setError, setLoading }) {
  const [reports, setReports] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  // Complete ReportManager formData structure
const [formData, setFormData] = useState({
  ReportID: '',
  EmployeeID: '',
  OrderID: '',
  ReportType: 'Delivery Issue',
  Priority: 'Medium',
  Title: '',
  Content: '',
  Status: 'Open',
  ReportedDate: new Date().toISOString().split('T')[0],
  ResolvedDate: '',
  Resolution: ''
});

  const informationService = useInformationService();

  const reportTypes = [
    'Delivery Issue',
    'Vehicle Problem',
    'Customer Complaint',
    'Safety Incident',
    'Equipment Failure',
    'Route Problem',
    'Weather Delay',
    'Building Access Issue',
    'Product Damage',
    'Other'
  ];

  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const statuses = ['Open', 'In Progress', 'Resolved', 'Closed', 'Escalated'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportsData, employeesData, ordersData] = await Promise.all([
        informationService.getReports(),
        informationService.getEmployees(),
        informationService.getOrders()
      ]);
      
      setReports(reportsData);
      setEmployees(employeesData);
      setOrders(ordersData);
      setError('');
    } catch (error) {
      setError('Error loading report data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.EmployeeID === employeeId);
    return employee ? employee.name : 'Unknown Employee';
  };

  const getEmployeeRole = (employeeId) => {
    const employee = employees.find(e => e.EmployeeID === employeeId);
    return employee ? employee.role : '';
  };

  const handleAdd = () => {
    setEditingReport(null);
    const nextId = Math.max(...reports.map(r => parseInt(r.ReportID.split('_')[1]) || 0), 0) + 1;
    setFormData({
      ReportID: `RPT_${String(nextId).padStart(5, '0')}`,
      EmployeeID: '',
      OrderID: '',
      ReportType: 'Delivery Issue',
      Priority: 'Medium',
      Title: '',
      Content: '',
      Status: 'Open',
      ReportedDate: new Date().toISOString().split('T')[0],
      ResolvedDate: '',
      Resolution: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    setFormData({
      ...report,
      ReportedDate: report.ReportedDate ? new Date(report.ReportedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      ResolvedDate: report.ResolvedDate ? new Date(report.ResolvedDate).toISOString().split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        setLoading(true);
        await informationService.deleteReport(reportId);
        await loadData();
        setError('');
      } catch (error) {
        setError('Error deleting report: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.EmployeeID || !formData.Title.trim() || !formData.Content.trim()) {
      setError('Employee, Title, and Content are required');
      return;
    }

    try {
      setLoading(true);
      const saveData = {
        ...formData,
        ReportedDate: new Date(formData.ReportedDate),
        ResolvedDate: formData.ResolvedDate ? new Date(formData.ResolvedDate) : null
      };

      if (editingReport) {
        await informationService.updateReport(formData.ReportID, saveData);
      } else {
        await informationService.createReport(saveData);
      }
      setIsModalOpen(false);
      await loadData();
      setError('');
    } catch (error) {
      setError('Error saving report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (report, newStatus) => {
    try {
      setLoading(true);
      const updateData = {
        ...report,
        Status: newStatus,
        ResolvedDate: newStatus === 'Resolved' || newStatus === 'Closed' ? new Date() : report.ResolvedDate
      };
      await informationService.updateReport(report.ReportID, updateData);
      await loadData();
      setError('');
    } catch (error) {
      setError('Error updating report status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      key: 'ReportID', 
      label: 'Report ID', 
      sortable: true,
      render: (value) => (
        <span className="id-badge">{value}</span>
      )
    },
    {
      key: 'Title',
      label: 'Title',
      sortable: true,
      render: (value) => (
        <span className="report-title" title={value}>
          {value.length > 40 ? value.substring(0, 40) + '...' : value}
        </span>
      )
    },
    {
      key: 'ReportType',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <span className={`type-badge type-${value.toLowerCase().replace(/\s+/g, '-')}`}>
          {value}
        </span>
      )
    },
    {
      key: 'Priority',
      label: 'Priority',
      sortable: true,
      render: (value) => (
        <span className={`priority-badge priority-${value.toLowerCase()}`}>
          {value}
        </span>
      )
    },
    {
      key: 'Status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`status-badge status-${value.toLowerCase().replace(' ', '-')}`}>
          {value}
        </span>
      )
    },
    {
      key: 'EmployeeID',
      label: 'Reported By',
      render: (value) => (
        <div className="employee-info">
          <div className="employee-name">{getEmployeeName(value)}</div>
          <div className="employee-role">{getEmployeeRole(value)}</div>
        </div>
      )
    },
    {
      key: 'ReportedDate',
      label: 'Reported Date',
      sortable: true,
      render: (value) => (
        <span className="date-value">
          {value ? new Date(value).toLocaleDateString() : 'N/A'}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: 'View Details',
      icon: '👁️',
      onClick: handleViewDetails,
      variant: 'info'
    },
    {
      label: 'Edit',
      icon: '✏️',
      onClick: handleEdit,
      variant: 'primary'
    },
    {
      label: 'Mark Resolved',
      icon: '✅',
      onClick: (report) => handleStatusUpdate(report, 'Resolved'),
      variant: 'success',
      condition: (report) => report.Status !== 'Resolved' && report.Status !== 'Closed'
    },
    {
      label: 'Delete',
      icon: '🗑️',
      onClick: (report) => handleDelete(report.ReportID),
      variant: 'danger'
    }
  ];

  const getStatusCounts = () => {
    const counts = {};
    statuses.forEach(status => {
      counts[status] = reports.filter(r => r.Status === status).length;
    });
    return counts;
  };

  const getPriorityCounts = () => {
    const counts = {};
    priorities.forEach(priority => {
      counts[priority] = reports.filter(r => r.Priority === priority).length;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();
  const priorityCounts = getPriorityCounts();

  return (
    <div className="report-manager">
      <div className="manager-header">
        <div className="header-content">
          <h2>📊 Report Management</h2>
          <p>Manage incident reports, delivery issues, and employee feedback</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <span className="btn-icon">➕</span>
          Create New Report
        </button>
      </div>

      <div className="data-summary">
        <div className="summary-card">
          <div className="summary-value">{reports.length}</div>
          <div className="summary-label">Total Reports</div>
        </div>
        <div className="summary-card open">
          <div className="summary-value">{statusCounts.Open || 0}</div>
          <div className="summary-label">Open</div>
        </div>
        <div className="summary-card progress">
          <div className="summary-value">{statusCounts['In Progress'] || 0}</div>
          <div className="summary-label">In Progress</div>
        </div>
        <div className="summary-card critical">
          <div className="summary-value">{priorityCounts.Critical || 0}</div>
          <div className="summary-label">Critical</div>
        </div>
      </div>

      <DataTable
        data={reports}
        columns={columns}
        actions={actions}
        searchable={true}
        searchPlaceholder="Search reports by title, type, or reporter..."
        emptyMessage="No reports found"
      />

      {/* Report Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReport ? 'Edit Report' : 'Create New Report'}
        size="large"
      >
        <div className="form-container">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Report ID</label>
              <input
                type="text"
                className="form-input"
                value={formData.ReportID}
                disabled
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.Status}
                onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Report Type</label>
              <select
                className="form-select"
                value={formData.ReportType}
                onChange={(e) => setFormData({ ...formData, ReportType: e.target.value })}
              >
                {reportTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={formData.Priority}
                onChange={(e) => setFormData({ ...formData, Priority: e.target.value })}
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Reported By *</label>
              <select
                className="form-select"
                value={formData.EmployeeID}
                onChange={(e) => setFormData({ ...formData, EmployeeID: e.target.value })}
                required
              >
                <option value="">Select Employee</option>
                {employees.map(employee => (
                  <option key={employee.EmployeeID} value={employee.EmployeeID}>
                    {employee.name} - {employee.role}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Related Order</label>
              <select
                className="form-select"
                value={formData.OrderID}
                onChange={(e) => setFormData({ ...formData, OrderID: e.target.value })}
              >
                <option value="">Select Order (Optional)</option>
                {orders.map(order => (
                  <option key={order.OrderID} value={order.OrderID}>
                    {order.OrderID} - {order.OrderStatus}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              className="form-input"
              value={formData.Title}
              onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description *</label>
            <textarea
              className="form-input"
              value={formData.Content}
              onChange={(e) => setFormData({ ...formData, Content: e.target.value })}
              placeholder="Provide detailed information about the issue, incident, or feedback"
              rows="5"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Reported Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.ReportedDate}
                onChange={(e) => setFormData({ ...formData, ReportedDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Resolved Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.ResolvedDate}
                onChange={(e) => setFormData({ ...formData, ResolvedDate: e.target.value })}
                disabled={formData.Status !== 'Resolved' && formData.Status !== 'Closed'}
              />
            </div>
          </div>

          {(formData.Status === 'Resolved' || formData.Status === 'Closed') && (
            <div className="form-group">
              <label className="form-label">Resolution Details</label>
              <textarea
                className="form-input"
                value={formData.Resolution}
                onChange={(e) => setFormData({ ...formData, Resolution: e.target.value })}
                placeholder="Describe how the issue was resolved"
                rows="3"
              />
            </div>
          )}

          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={!formData.EmployeeID || !formData.Title.trim() || !formData.Content.trim()}
            >
              {editingReport ? 'Update' : 'Create'} Report
            </button>
          </div>
        </div>
      </Modal>

      {/* Report Details Modal */}
      {selectedReport && (
        <ReportDetailsModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          report={selectedReport}
          employee={employees.find(e => e.EmployeeID === selectedReport.EmployeeID)}
          order={orders.find(o => o.OrderID === selectedReport.OrderID)}
        />
      )}
    </div>
  );
}

// Report Details Modal Component
function ReportDetailsModal({ isOpen, onClose, report, employee, order }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Report Details: ${report.ReportID}`}
      size="large"
    >
      <div className="report-details-container">
        {/* Report Overview */}
        <div className="details-section">
          <div className="section-header">
            <h3>{report.Title}</h3>
            <div className="report-badges">
              <span className={`type-badge type-${report.ReportType.toLowerCase().replace(/\s+/g, '-')}`}>
                {report.ReportType}
              </span>
              <span className={`priority-badge priority-${report.Priority.toLowerCase()}`}>
                {report.Priority}
              </span>
              <span className={`status-badge status-${report.Status.toLowerCase().replace(' ', '-')}`}>
                {report.Status}
              </span>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <strong>Report ID:</strong> {report.ReportID}
            </div>
            <div className="info-item">
              <strong>Reported Date:</strong> {report.ReportedDate ? new Date(report.ReportedDate).toLocaleDateString() : 'N/A'}
            </div>
            {report.ResolvedDate && (
              <div className="info-item">
                <strong>Resolved Date:</strong> {new Date(report.ResolvedDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Reporter Information */}
        {employee && (
          <div className="details-section">
            <h4>👤 Reported By</h4>
            <div className="info-grid">
              <div className="info-item">
                <strong>Name:</strong> {employee.name}
              </div>
              <div className="info-item">
                <strong>Role:</strong> {employee.role}
              </div>
              <div className="info-item">
                <strong>Contact:</strong> {employee.contact_number}
              </div>
              <div className="info-item">
                <strong>Status:</strong> {employee.active_flag ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        )}

        {/* Related Order */}
        {order && (
          <div className="details-section">
            <h4>📋 Related Order</h4>
            <div className="info-grid">
              <div className="info-item">
                <strong>Order ID:</strong> {order.OrderID}
              </div>
              <div className="info-item">
                <strong>Order Status:</strong> 
                <span className={`status-badge status-${order.OrderStatus.toLowerCase().replace(' ', '-')}`}>
                  {order.OrderStatus}
                </span>
              </div>
              <div className="info-item">
                <strong>Customer Response:</strong> {order.CustomerResponse}
              </div>
            </div>
          </div>
        )}

        {/* Report Content */}
        <div className="details-section">
          <h4>📝 Report Details</h4>
          <div className="report-content">
            {report.Content}
          </div>
        </div>

        {/* Resolution */}
        {report.Resolution && (
          <div className="details-section">
            <h4>✅ Resolution</h4>
            <div className="resolution-content">
              {report.Resolution}
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ReportManager;