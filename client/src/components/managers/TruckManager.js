import React, { useState, useEffect, useCallback } from 'react';
import { useInformationService } from '../../services/informationService';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';

function TruckManager({ setError, setLoading }) {
  const [trucks, setTrucks] = useState([]);
  const [truckZones, setTruckZones] = useState([]);
  const [zones, setZones] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [formData, setFormData] = useState({
    TruckID: '',
    TruckName: '',
    Volume: 0
  });

  const informationService = useInformationService();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [trucksData, truckZonesData, zonesData] = await Promise.all([
        informationService.getTrucks(),
        informationService.getTruckZones(),
        informationService.getZones()
      ]);
      setTrucks(trucksData);
      setTruckZones(truckZonesData);
      setZones(zonesData);
      setError('');
    } catch (error) {
      setError('Error loading truck data: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [informationService, setError, setLoading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getTruckZoneAssignments = (truckId) => {
    const assignments = truckZones.filter(tz => tz.TruckID === truckId);
    const primary = assignments.find(a => a.IsPrimaryZone);
    const secondary = assignments.filter(a => !a.IsPrimaryZone);
    
    return {
      primary: primary ? zones.find(z => z.ZoneID === primary.ZoneID)?.ZoneName : 'None',
      secondary: secondary.map(s => zones.find(z => z.ZoneID === s.ZoneID)?.ZoneName).join(', ') || 'None'
    };
  };

  const handleAdd = () => {
    setEditingTruck(null);
    setFormData({
      TruckID: `TRK_${String(trucks.length + 1).padStart(5, '0')}`,
      TruckName: '',
      Volume: 0
    });
    setIsModalOpen(true);
  };

  const handleEdit = (truck) => {
    setEditingTruck(truck);
    setFormData(truck);
    setIsModalOpen(true);
  };

  const handleManageZones = (truck) => {
    setSelectedTruck(truck);
    setIsZoneModalOpen(true);
  };

  const handleDelete = async (truckId) => {
    if (window.confirm('Are you sure you want to delete this truck?')) {
      try {
        setLoading(true);
        await informationService.deleteTruck(truckId);
        await loadData();
        setError('');
      } catch (error) {
        setError('Error deleting truck: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (editingTruck) {
        await informationService.updateTruck(formData.TruckID, formData);
      } else {
        await informationService.createTruck(formData);
      }
      setIsModalOpen(false);
      await loadData();
      setError('');
    } catch (error) {
      setError('Error saving truck: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      key: 'TruckID', 
      label: 'Truck ID', 
      sortable: true,
      render: (value) => (
        <span className="id-badge">{value}</span>
      )
    },
    { 
      key: 'TruckName', 
      label: 'Truck Name', 
      sortable: true,
      render: (value) => (
        <span className="truck-name">{value}</span>
      )
    },
    { 
      key: 'Volume', 
      label: 'Volume (m³)', 
      sortable: true,
      render: (value) => (
        <span className="volume-badge">{value}</span>
      )
    },
    {
      key: 'zones',
      label: 'Zone Assignments',
      render: (value, truck) => {
        const assignments = getTruckZoneAssignments(truck.TruckID);
        return (
          <div className="zone-assignments">
            <div className="primary-zone">
              <strong>Primary:</strong> {assignments.primary}
            </div>
            <div className="secondary-zones">
              <strong>Secondary:</strong> {assignments.secondary}
            </div>
          </div>
        );
      }
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
      label: 'Manage Zones',
      icon: '🗺️',
      onClick: handleManageZones,
      variant: 'info'
    },
    {
      label: 'Delete',
      icon: '🗑️',
      onClick: (truck) => handleDelete(truck.TruckID),
      variant: 'danger'
    }
  ];

  return (
    <div className="truck-manager">
      <div className="manager-header">
        <div className="header-content">
          <h2>🚛 Truck Management</h2>
          <p>Manage fleet vehicles and zone assignments</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleAdd}
        >
          <span className="btn-icon">➕</span>
          Add New Truck
        </button>
      </div>

      <div className="data-summary">
        <div className="summary-card">
          <div className="summary-value">{trucks.length}</div>
          <div className="summary-label">Total Trucks</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">
            {trucks.filter(t => t.Volume === 8).length}
          </div>
          <div className="summary-label">1T Trucks</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">
            {trucks.filter(t => t.Volume === 20).length}
          </div>
          <div className="summary-label">3T Trucks</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">
            {trucks.reduce((sum, t) => sum + t.Volume, 0)}
          </div>
          <div className="summary-label">Total Volume (m³)</div>
        </div>
      </div>

      <DataTable
        data={trucks}
        columns={columns}
        actions={actions}
        searchable={true}
        searchPlaceholder="Search trucks..."
        emptyMessage="No trucks found"
      />

      {/* Truck Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTruck ? 'Edit Truck' : 'Add New Truck'}
      >
        <div className="form-container">
          <div className="form-group">
            <label className="form-label">Truck ID</label>
            <input
              type="text"
              className="form-input"
              value={formData.TruckID}
              onChange={(e) => setFormData({ ...formData, TruckID: e.target.value })}
              disabled={editingTruck !== null}
              placeholder="TRK_00001"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Truck Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.TruckName}
              onChange={(e) => setFormData({ ...formData, TruckName: e.target.value })}
              placeholder="Enter truck name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Volume (m³)</label>
            <select
              className="form-select"
              value={formData.Volume}
              onChange={(e) => setFormData({ ...formData, Volume: parseInt(e.target.value) })}
              required
            >
              <option value="">Select volume</option>
              <option value={8}>8 m³ (1T Truck)</option>
              <option value={20}>20 m³ (3T Truck)</option>
            </select>
          </div>

          <div className="form-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!formData.TruckName.trim() || !formData.Volume}
            >
              {editingTruck ? 'Update' : 'Create'} Truck
            </button>
          </div>
        </div>
      </Modal>

      {/* Zone Assignment Modal */}
      {selectedTruck && (
        <TruckZoneAssignmentModal
          isOpen={isZoneModalOpen}
          onClose={() => setIsZoneModalOpen(false)}
          truck={selectedTruck}
          zones={zones}
          truckZones={truckZones}
          onUpdate={loadData}
          setError={setError}
          setLoading={setLoading}
        />
      )}
    </div>
  );
}

// Truck Zone Assignment Modal Component
function TruckZoneAssignmentModal({ 
  isOpen, 
  onClose, 
  truck, 
  zones, 
  truckZones, 
  onUpdate, 
  setError, 
  setLoading 
}) {
  const [assignments, setAssignments] = useState([]);
  const informationService = useInformationService();

  useEffect(() => {
    if (isOpen && truck) {
      const truckAssignments = truckZones.filter(tz => tz.TruckID === truck.TruckID);
      setAssignments(truckAssignments);
    }
  }, [isOpen, truck, truckZones]);

  const handlePrimaryZoneChange = (zoneId) => {
    setAssignments(prev => {
      const updated = prev.map(a => ({ ...a, IsPrimaryZone: false }));
      const existing = updated.find(a => a.ZoneID === zoneId);
      
      if (existing) {
        existing.IsPrimaryZone = true;
      } else {
        updated.push({
          TruckID: truck.TruckID,
          ZoneID: zoneId,
          IsPrimaryZone: true
        });
      }
      
      return updated;
    });
  };

  const handleSecondaryZoneToggle = (zoneId) => {
    setAssignments(prev => {
      const existing = prev.find(a => a.ZoneID === zoneId && !a.IsPrimaryZone);
      
      if (existing) {
        return prev.filter(a => !(a.ZoneID === zoneId && !a.IsPrimaryZone));
      } else {
        return [...prev, {
          TruckID: truck.TruckID,
          ZoneID: zoneId,
          IsPrimaryZone: false
        }];
      }
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await informationService.updateTruckZoneAssignments(truck.TruckID, assignments);
      onClose();
      await onUpdate();
      setError('');
    } catch (error) {
      setError('Error updating zone assignments: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const primaryZone = assignments.find(a => a.IsPrimaryZone)?.ZoneID || '';
  const secondaryZones = assignments.filter(a => !a.IsPrimaryZone).map(a => a.ZoneID);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Zone Assignments - ${truck?.TruckName}`}
      size="large"
    >
      <div className="zone-assignment-container">
        <div className="assignment-section">
          <h3>Primary Zone</h3>
          <p>Select the main zone for this truck</p>
          <select
            className="form-select"
            value={primaryZone}
            onChange={(e) => handlePrimaryZoneChange(e.target.value)}
          >
            <option value="">Select primary zone</option>
            {zones.map(zone => (
              <option key={zone.ZoneID} value={zone.ZoneID}>
                {zone.ZoneName}
              </option>
            ))}
          </select>
        </div>

        <div className="assignment-section">
          <h3>Secondary Zones</h3>
          <p>Select additional zones this truck can serve</p>
          <div className="zone-checkboxes">
            {zones.filter(z => z.ZoneID !== primaryZone).map(zone => (
              <label key={zone.ZoneID} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={secondaryZones.includes(zone.ZoneID)}
                  onChange={() => handleSecondaryZoneToggle(zone.ZoneID)}
                />
                <span className="checkbox-text">{zone.ZoneName}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Assignments
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default TruckManager;