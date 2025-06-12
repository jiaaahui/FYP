import React, { useState } from 'react';
import ZoneManager from './managers/ZoneManager';
import TruckManager from './managers/TruckManager';
import BuildingManager from './managers/BuildingManager';
import ProductManager from './managers/ProductManager';
import EmployeeManager from './managers/EmployeeManager';
import TeamManager from './managers/TeamManager';
import OrderManager from './managers/OrderManager';
import ReportManager from './managers/ReportManager';
import './InformationDashboard.css';

function InformationDashboard() {
  const [activeTab, setActiveTab] = useState('zones');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tabs = [
    { id: 'zones', label: 'Zones', icon: '🗺️', description: 'Delivery zones management' },
    { id: 'trucks', label: 'Trucks', icon: '🚛', description: 'Fleet management' },
    { id: 'buildings', label: 'Buildings', icon: '🏢', description: 'Building constraints' },
    { id: 'products', label: 'Products', icon: '📦', description: 'Product catalog' },
    { id: 'employees', label: 'Employees', icon: '👥', description: 'Staff management' },
    { id: 'teams', label: 'Teams', icon: '🔗', description: 'Team assignments' },
    { id: 'orders', label: 'Orders', icon: '📋', description: 'Order management' },
    { id: 'reports', label: 'Reports', icon: '📊', description: 'Issue reports' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'zones':
        return <ZoneManager setError={setError} setLoading={setLoading} />;
      case 'trucks':
        return <TruckManager setError={setError} setLoading={setLoading} />;
      case 'buildings':
        return <BuildingManager setError={setError} setLoading={setLoading} />;
      case 'products':
        return <ProductManager setError={setError} setLoading={setLoading} />;
      case 'employees':
        return <EmployeeManager setError={setError} setLoading={setLoading} />;
      case 'teams':
        return <TeamManager setError={setError} setLoading={setLoading} />;
      case 'orders':
        return <OrderManager setError={setError} setLoading={setLoading} />;
      case 'reports':
        return <ReportManager setError={setError} setLoading={setLoading} />;
      default:
        return <ZoneManager setError={setError} setLoading={setLoading} />;
    }
  };

  return (
    <div className="information-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>📊 Information Management</h1>
          <p>Manage all system data and configurations</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          <span className="alert-message">{error}</span>
          <button 
            className="alert-close"
            onClick={() => setError('')}
          >
            ✕
          </button>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Loading...</span>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        {/* Top Navigation Tabs */}
        <div className="top-navigation">
          <div className="nav-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <div className="tab-content">
                  <span className="tab-label">{tab.label}</span>
                  <span className="tab-description">{tab.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content-area">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default InformationDashboard;