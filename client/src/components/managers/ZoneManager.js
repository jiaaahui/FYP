import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';

// Dummy data for zones
const DUMMY_ZONES = [
  { ZoneID: 'ZON_00001', ZoneName: 'North Zone' },
  { ZoneID: 'ZON_00002', ZoneName: 'South Zone' },
  { ZoneID: 'ZON_00003', ZoneName: 'East Zone' },
  { ZoneID: 'ZON_00004', ZoneName: 'West Zone' },
  { ZoneID: 'ZON_00005', ZoneName: 'Central Zone' },
  { ZoneID: 'ZON_00006', ZoneName: 'Downtown Zone' },
  { ZoneID: 'ZON_00007', ZoneName: 'Industrial Zone' },
  { ZoneID: 'ZON_00008', ZoneName: 'Residential Zone A' },
  { ZoneID: 'ZON_00009', ZoneName: 'Residential Zone B' },
  { ZoneID: 'ZON_00010', ZoneName: 'Commercial Zone' },
  { ZoneID: 'ZON_00011', ZoneName: 'Ad-hoc' },
  { ZoneID: 'ZON_00012', ZoneName: 'Airport Zone' }
];

function ZoneManager({ setError, setLoading }) {
  const [zones, setZones] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({
    ZoneID: '',
    ZoneName: ''
  });

  const simulateLoading = (duration = 500) => new Promise(resolve => setTimeout(resolve, duration));

  const loadZones = useCallback(async () => {
    try {
      setLoading(true);
      await simulateLoading(); // Simulate API call delay
      setZones([...DUMMY_ZONES]); // Load dummy data
      setError('');
    } catch (error) {
      setError('Error loading zones: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  const handleAdd = () => {
    setEditingZone(null);
    setFormData({
      ZoneID: `ZON_${String(zones.length + 1).padStart(5, '0')}`,
      ZoneName: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setFormData(zone);
    setIsModalOpen(true);
  };

  const handleDelete = async (zoneId) => {
    if (window.confirm('Are you sure you want to delete this zone?')) {
      try {
        setLoading(true);
        await simulateLoading(300); // Simulate API call
        setZones(prevZones => prevZones.filter(zone => zone.ZoneID !== zoneId));
        setError('Zone deleted successfully!');
        setTimeout(() => setError(''), 3000);
      } catch (error) {
        setError('Error deleting zone: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await simulateLoading(300); // Simulate API call
      if (editingZone) {
        setZones(prevZones => prevZones.map(zone => (zone.ZoneID === formData.ZoneID ? formData : zone)));
        setError('Zone updated successfully!');
      } else {
        setZones(prevZones => [...prevZones, formData]);
        setError('Zone created successfully!');
      }
      setIsModalOpen(false);
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      setError('Error saving zone: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'ZoneID', label: 'Zone ID', sortable: true, render: (value) => <span className="id-badge">{value}</span> },
    { key: 'ZoneName', label: 'Zone Name', sortable: true, render: (value) => <span className="zone-name">{value}</span> }
  ];

  const actions = [
    { label: 'Edit', icon: '✏️', onClick: handleEdit, variant: 'primary' },
    { label: 'Delete', icon: '🗑️', onClick: (zone) => handleDelete(zone.ZoneID), variant: 'danger' }
  ];

  return (
    <div className="zone-manager">
      <div className="manager-header">
        <div className="header-content">
          <h2>🗺️ Zone Management</h2>
          <p>Manage delivery zones and coverage areas (Frontend Demo)</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <span className="btn-icon">➕</span>
          Add New Zone
        </button>
      </div>

      <div className="data-summary">
        <div className="summary-card">
          <div className="summary-value">{zones.length}</div>
          <div className="summary-label">Total Zones</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{zones.filter(z => z.ZoneName !== 'Ad-hoc').length}</div>
          <div className="summary-label">Active Zones</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{zones.filter(z => z.ZoneName === 'Ad-hoc').length}</div>
          <div className="summary-label">Ad-hoc Zones</div>
        </div>
      </div>

      <DataTable
        data={zones}
        columns={columns}
        actions={actions}
        searchable={true}
        searchPlaceholder="Search zones..."
        emptyMessage="No zones found"
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingZone ? 'Edit Zone' : 'Add New Zone'}>
        <div className="form-container">
          <div className="form-group">
            <label className="form-label">Zone ID</label>
            <input
              type="text"
              className="form-input"
              value={formData.ZoneID}
              onChange={(e) => setFormData({ ...formData, ZoneID: e.target.value })}
              disabled={editingZone !== null}
              placeholder="ZON_00001"
            />
            {!editingZone && <small className="form-help">Zone ID will be auto-generated</small>}
          </div>

          <div className="form-group">
            <label className="form-label">Zone Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.ZoneName}
              onChange={(e) => setFormData({ ...formData, ZoneName: e.target.value })}
              placeholder="Enter zone name"
              required
            />
            <small className="form-help">Enter a descriptive name for this delivery zone</small>
          </div>

          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!formData.ZoneName.trim()}>
              {editingZone ? 'Update' : 'Create'} Zone
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ZoneManager;