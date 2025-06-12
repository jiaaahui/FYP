import React, { useState, useEffect } from 'react';
import { useSchedulingService } from '../../services/schedulingService';
import TimeSlotRecommendations from './TimeSlotRecommendations';
import DeliveryOptimizer from './DeliveryOptimizer';
import TruckLoadingSchedule from './TruckLoadingSchedule';
import RealTimeAdjustments from './RealTimeAdjustments';

function SchedulingDashboard() {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const schedulingService = useSchedulingService();

  return (
    <div className="scheduling-dashboard">
      <div className="dashboard-header">
        <h1>Intelligent Scheduling System</h1>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="scheduling-tabs">
        <button 
          className={`tab-button ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          Time Slot Recommendations
        </button>
        <button 
          className={`tab-button ${activeTab === 'optimization' ? 'active' : ''}`}
          onClick={() => setActiveTab('optimization')}
        >
          Route Optimization
        </button>
        <button 
          className={`tab-button ${activeTab === 'loading' ? 'active' : ''}`}
          onClick={() => setActiveTab('loading')}
        >
          Truck Loading Schedule
        </button>
        <button 
          className={`tab-button ${activeTab === 'adjustments' ? 'active' : ''}`}
          onClick={() => setActiveTab('adjustments')}
        >
          Real-time Adjustments
        </button>
      </div>

      <div className="scheduling-content">
        {activeTab === 'recommendations' && (
          <TimeSlotRecommendations 
            schedulingService={schedulingService}
            setError={setError}
          />
        )}
        {activeTab === 'optimization' && (
          <DeliveryOptimizer 
            schedulingService={schedulingService}
            setError={setError}
          />
        )}
        {activeTab === 'loading' && (
          <TruckLoadingSchedule 
            schedulingService={schedulingService}
            setError={setError}
          />
        )}
        {activeTab === 'adjustments' && (
          <RealTimeAdjustments 
            schedulingService={schedulingService}
            setError={setError}
          />
        )}
      </div>
    </div>
  );
}

export default SchedulingDashboard;