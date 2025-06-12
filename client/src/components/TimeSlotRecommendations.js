import React, { useState } from 'react';

function TimeSlotRecommendations({ schedulingService, setError }) {
  const [customerRequest, setCustomerRequest] = useState({
    items: [],
    location: {
      type: 'hdb',
      coordinates: { lat: 1.3521, lng: 103.8198 },
      address: ''
    },
    preferredDates: [],
    customerConstraints: {
      preferredTimeOfDay: '',
      preferredDaysOfWeek: []
    }
  });
  
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({
    type: 'air_conditioner',
    complexity: 'medium',
    quantity: 1,
    weight: 0,
    volume: 0
  });

  const handleAddItem = () => {
    setCustomerRequest({
      ...customerRequest,
      items: [...customerRequest.items, { ...newItem, id: Date.now() }]
    });
    setNewItem({
      type: 'air_conditioner',
      complexity: 'medium',
      quantity: 1,
      weight: 0,
      volume: 0
    });
  };

  const handleRemoveItem = (itemId) => {
    setCustomerRequest({
      ...customerRequest,
      items: customerRequest.items.filter(item => item.id !== itemId)
    });
  };

  const handleGetRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (customerRequest.items.length === 0) {
        throw new Error('Please add at least one item');
      }
      
      if (customerRequest.preferredDates.length === 0) {
        throw new Error('Please select at least one preferred date');
      }

      const result = await schedulingService.evaluateTimeSlots(customerRequest);
      setRecommendations(result);
    } catch (err) {
      setError('Error getting recommendations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPreferredDate = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const dateString = nextWeek.toISOString().split('T')[0];
    
    if (!customerRequest.preferredDates.includes(dateString)) {
      setCustomerRequest({
        ...customerRequest,
        preferredDates: [...customerRequest.preferredDates, dateString]
      });
    }
  };

  const formatScore = (score) => {
    return (score * 100).toFixed(1) + '%';
  };

  return (
    <div className="time-slot-recommendations">
      <h2>Time Slot Recommendations</h2>
      
      <div className="recommendation-form">
        {/* Items Section */}
        <div className="form-section">
          <h3>Items to Install</h3>
          
          <div className="add-item-form">
            <div className="form-row">
              <div className="form-group">
                <label>Item Type</label>
                <select 
                  value={newItem.type}
                  onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                  className="form-control"
                >
                  <option value="air_conditioner">Air Conditioner</option>
                  <option value="washing_machine">Washing Machine</option>
                  <option value="refrigerator">Refrigerator</option>
                  <option value="dishwasher">Dishwasher</option>
                  <option value="oven">Oven</option>
                  <option value="water_heater">Water Heater</option>
                  <option value="tv_mount">TV Mount</option>
                  <option value="furniture">Furniture</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Complexity</label>
                <select 
                  value={newItem.complexity}
                  onChange={(e) => setNewItem({...newItem, complexity: e.target.value})}
                  className="form-control"
                >
                  <option value="simple">Simple</option>
                  <option value="medium">Medium</option>
                  <option value="complex">Complex</option>
                  <option value="very_complex">Very Complex</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Quantity</label>
                <input 
                  type="number" 
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                  className="form-control"
                  min="1"
                />
              </div>
              
              <div className="form-group">
                <label>Weight (kg)</label>
                <input 
                  type="number" 
                  value={newItem.weight}
                  onChange={(e) => setNewItem({...newItem, weight: parseFloat(e.target.value)})}
                  className="form-control"
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div className="form-group">
                <label>Volume (m³)</label>
                <input 
                  type="number" 
                  value={newItem.volume}
                  onChange={(e) => setNewItem({...newItem, volume: parseFloat(e.target.value)})}
                  className="form-control"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="form-group">
                <button 
                  type="button" 
                  onClick={handleAddItem}
                  className="btn btn-primary"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>

          {/* Items List */}
          {customerRequest.items.length > 0 && (
            <div className="items-list">
              <h4>Selected Items:</h4>
              {customerRequest.items.map(item => (
                <div key={item.id} className="item-card">
                  <div className="item-info">
                    <strong>{item.type.replace('_', ' ')}</strong>
                    <span>Complexity: {item.complexity}</span>
                    <span>Quantity: {item.quantity}</span>
                    <span>Weight: {item.weight}kg</span>
                    <span>Volume: {item.volume}m³</span>
                  </div>
                  <button 
                    onClick={() => handleRemoveItem(item.id)}
                    className="btn btn-sm btn-danger"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location Section */}
        <div className="form-section">
          <h3>Location Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Location Type</label>
              <select 
                value={customerRequest.location.type}
                onChange={(e) => setCustomerRequest({
                  ...customerRequest,
                  location: {...customerRequest.location, type: e.target.value}
                })}
                className="form-control"
              >
                <option value="hdb">HDB</option>
                <option value="condoTimeWindows">Condominium</option>
                <option value="landed">Landed Property</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Address</label>
              <input 
                type="text" 
                value={customerRequest.location.address}
                onChange={(e) => setCustomerRequest({
                  ...customerRequest,
                  location: {...customerRequest.location, address: e.target.value}
                })}
                className="form-control"
                placeholder="Enter full address"
              />
            </div>
          </div>
        </div>

        {/* Preferred Dates Section */}
        <div className="form-section">
          <h3>Preferred Dates</h3>
          <div className="preferred-dates">
            <button 
              type="button" 
              onClick={handleAddPreferredDate}
              className="btn btn-outline-primary"
            >
              Add Preferred Date
            </button>
            
            {customerRequest.preferredDates.map((date, index) => (
              <div key={index} className="date-input">
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => {
                    const newDates = [...customerRequest.preferredDates];
                    newDates[index] = e.target.value;
                    setCustomerRequest({
                      ...customerRequest,
                      preferredDates: newDates
                    });
                  }}
                  className="form-control"
                />
                <button 
                  onClick={() => {
                    const newDates = customerRequest.preferredDates.filter((_, i) => i !== index);
                    setCustomerRequest({
                      ...customerRequest,
                      preferredDates: newDates
                    });
                  }}
                  className="btn btn-sm btn-danger"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Preferences Section */}
        <div className="form-section">
          <h3>Customer Preferences</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Preferred Time of Day</label>
              <select 
                value={customerRequest.customerConstraints.preferredTimeOfDay}
                onChange={(e) => setCustomerRequest({
                  ...customerRequest,
                  customerConstraints: {
                    ...customerRequest.customerConstraints,
                    preferredTimeOfDay: e.target.value
                  }
                })}
                className="form-control"
              >
                <option value="">No preference</option>
                <option value="morning">Morning (8 AM - 12 PM)</option>
                <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                <option value="evening">Evening (4 PM - 6 PM)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            onClick={handleGetRecommendations}
            disabled={loading}
            className="btn btn-success btn-lg"
          >
            {loading ? 'Calculating...' : 'Get Time Slot Recommendations'}
          </button>
        </div>
      </div>

      {/* Recommendations Display */}
      {recommendations && (
        <div className="recommendations-results">
          <h3>Recommended Time Slots</h3>
          
          <div className="installation-time-info">
            <h4>Estimated Installation Time: {recommendations.installationTime.formattedTime}</h4>
          </div>

          {recommendations.recommendedSlots.length === 0 ? (
            <div className="no-recommendations">
              <p>No suitable time slots found with current constraints.</p>
              <p>Try adjusting your preferences or dates.</p>
            </div>
          ) : (
            <div className="recommendations-list">
              {recommendations.recommendedSlots.map((slot, index) => (
                <div key={index} className="recommendation-card">
                  <div className="recommendation-header">
                    <h4>Option {index + 1}</h4>
                    <div className="overall-score">
                      Score: {formatScore(slot.scores.overall)}
                    </div>
                  </div>
                  
                  <div className="recommendation-details">
                    <div className="date-time">
                      <strong>Date:</strong> {new Date(slot.date).toLocaleDateString()}
                      <strong>Time:</strong> {slot.timeSlot}
                    </div>
                    
                    <div className="scores-breakdown">
                      <div className="score-item">
                        <span>Route Proximity:</span>
                        <span>{formatScore(slot.scores.proximity)}</span>
                      </div>
                      <div className="score-item">
                        <span>Truck Capacity:</span>
                        <span>{formatScore(slot.scores.capacity)}</span>
                      </div>
                      <div className="score-item">
                        <span>Time Constraints:</span>
                        <span>{formatScore(slot.scores.constraint)}</span>
                      </div>
                      <div className="score-item">
                        <span>Customer Preference:</span>
                        <span>{formatScore(slot.scores.customerPreference)}</span>
                      </div>
                    </div>

                    {slot.details.capacityAssessment && (
                      <div className="capacity-info">
                        <small>
                          Truck Usage: {(slot.details.capacityAssessment.weightUtilization * 100).toFixed(1)}% weight, 
                          {(slot.details.capacityAssessment.volumeUtilization * 100).toFixed(1)}% volume
                        </small>
                      </div>
                    )}
                  </div>
                  
                  <div className="recommendation-actions">
                    <button className="btn btn-primary">
                      Schedule This Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TimeSlotRecommendations;