import React, { useState, useEffect, useCallback } from 'react';
import { useInformationService } from '../../services/informationService';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';

function OrderManager({ setError, setLoading }) {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [products, setProducts] = useState([]);
  const [orderProducts, setOrderProducts] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [lorryTrips, setLorryTrips] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({
    OrderID: '',
    CustomerID: '',
    BuildingID: '',
    Address: '',
    OrderStatus: 'Pending',
    CustomerResponse: 'Pending',
    PreferredDateTimeStart: '',
    PreferredDateTimeEnd: '',
    TimeSlotID: '',
    SpecialInstructions: '',
    DeliveryNotes: '',
    Priority: 'Medium'
  });

  const informationService = useInformationService();

  const orderStatuses = ['Pending', 'Confirmed', 'Scheduled', 'In Transit', 'Delivered', 'Completed', 'Cancelled'];
  const customerResponses = ['Pending', 'Accepted', 'Rejected', 'Rescheduled'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        ordersData, 
        customersData, 
        buildingsData, 
        productsData, 
        orderProductsData,
        timeSlotsData,
        lorryTripsData,
        trucksData,
        teamsData
      ] = await Promise.all([
        informationService.getOrders(),
        informationService.getCustomers(),
        informationService.getBuildings(),
        informationService.getProducts(),
        informationService.getOrderProducts(),
        informationService.getTimeSlots(),
        informationService.getLorryTrips(),
        informationService.getTrucks(),
        informationService.getTeams()
      ]);

      setOrders(ordersData);
      setCustomers(customersData);
      setBuildings(buildingsData);
      setProducts(productsData);
      setOrderProducts(orderProductsData);
      setTimeSlots(timeSlotsData);
      setLorryTrips(lorryTripsData);
      setTrucks(trucksData);
      setTeams(teamsData);
      setError('');
    } catch (error) {
      setError('Error loading order data: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [informationService, setError, setLoading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getCustomerInfo = (customerId) => {
    const customer = customers.find(c => c.CustomerID === customerId);
    return customer || { FullName: 'Unknown Customer', Email: '', PhoneNumber: '', Address: '' };
  };

  const getBuildingInfo = (buildingId) => {
    const building = buildings.find(b => b.BuildingID === buildingId);
    return building || { BuildingName: 'Unknown Building', HousingType: '', PostalCode: '', ZoneID: '' };
  };

  const getTimeSlotInfo = (timeSlotId) => {
    const timeSlot = timeSlots.find(ts => ts.TimeSlotID === timeSlotId);
    if (!timeSlot) return null;
    return timeSlot;
  };

  const getLorryTripInfo = (timeSlotId) => {
    const timeSlot = timeSlots.find(ts => ts.TimeSlotID === timeSlotId);
    if (!timeSlot || !timeSlot.LorryTripID) return null;
    
    const lorryTrip = lorryTrips.find(lt => lt.LorryTripID === timeSlot.LorryTripID);
    if (!lorryTrip) return null;

    const truck = trucks.find(t => t.TruckID === lorryTrip.TruckID);
    const deliveryTeam = teams.find(t => t.TeamID === lorryTrip.DeliveryTeamID);
    const warehouseTeam = teams.find(t => t.TeamID === lorryTrip.WarehouseTeamID);

    return {
      ...lorryTrip,
      TruckName: truck ? truck.TruckName : 'Unknown Truck',
      DeliveryTeamType: deliveryTeam ? deliveryTeam.TeamType : 'Unknown Team',
      WarehouseTeamType: warehouseTeam ? warehouseTeam.TeamType : 'Unknown Team'
    };
  };

  const getOrderProducts = (orderId) => {
    const orderItems = orderProducts.filter(op => op.OrderID === orderId);
    return orderItems.map(item => {
      const product = products.find(p => p.ProductID === item.ProductID);
      return {
        ...item,
        ProductName: product ? product.ProductName : 'Unknown Product',
        Category: product ? product.Category : 'Unknown',
        Dimensions: product ? `${product.PackageLengthCM}×${product.PackageWidthCM}×${product.PackageHeightCM}cm` : '',
        InstallationTime: product ? `${product.EstimatedInstallationTimeMin}-${product.EstimatedInstallationTimeMax}min` : ''
      };
    });
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      OrderID: order.OrderID,
      CustomerID: order.CustomerID,
      BuildingID: order.BuildingID,
      Address: order.Address,
      OrderStatus: order.OrderStatus,
      CustomerResponse: order.CustomerResponse,
      PreferredDateTimeStart: order.PreferredDateTimeStart,
      PreferredDateTimeEnd: order.PreferredDateTimeEnd,
      TimeSlotID: order.TimeSlotID || '',
      SpecialInstructions: order.SpecialInstructions || '',
      DeliveryNotes: order.DeliveryNotes || '',
      Priority: order.Priority || 'Medium'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateOrder = async () => {
    try {
      setLoading(true);
      await informationService.updateOrder(formData.OrderID, formData);
      setIsEditModalOpen(false);
      await loadData();
      setError('');
    } catch (error) {
      setError('Error updating order: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'pending';
      case 'Confirmed': return 'confirmed';
      case 'Scheduled': return 'scheduled';
      case 'In Transit': return 'transit';
      case 'Delivered': return 'delivered';
      case 'Completed': return 'completed';
      case 'Cancelled': return 'cancelled';
      default: return 'pending';
    }
  };

  const getCustomerResponseColor = (response) => {
    switch (response) {
      case 'Accepted': return 'accepted';
      case 'Pending': return 'pending';
      case 'Rejected': return 'rejected';
      case 'Rescheduled': return 'rescheduled';
      default: return 'pending';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'urgent';
      case 'High': return 'high';
      case 'Medium': return 'medium';
      case 'Low': return 'low';
      default: return 'medium';
    }
  };

  const columns = [
    { 
      key: 'OrderID', 
      label: 'Order ID', 
      sortable: true,
      render: (value) => <span className="id-badge order-id">{value}</span>
    },
    { 
      key: 'CustomerID', 
      label: 'Customer', 
      sortable: true,
      render: (value, row) => {
        const customer = getCustomerInfo(value);
        return (
          <div className="customer-info">
            <div className="customer-name">{customer.FullName}</div>
            <div className="customer-contact">{customer.PhoneNumber}</div>
            <div className="customer-id">{value}</div>
          </div>
        );
      }
    },
    { 
      key: 'BuildingID', 
      label: 'Delivery Location', 
      sortable: true,
      render: (value, row) => {
        const building = getBuildingInfo(value);
        return (
          <div className="location-info">
            <div className="building-name">{building.BuildingName}</div>
            <div className="building-type">{building.HousingType}</div>
            <div className="postal-code">{building.PostalCode}</div>
          </div>
        );
      }
    },
    {
      key: 'OrderStatus',
      label: 'Order Status',
      sortable: true,
      render: (value) => (
        <span className={`status-badge order-status-${getOrderStatusColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'CustomerResponse',
      label: 'Customer Response',
      sortable: true,
      render: (value) => (
        <span className={`status-badge customer-response-${getCustomerResponseColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'Priority',
      label: 'Priority',
      sortable: true,
      render: (value) => (
        <span className={`priority-badge priority-${getPriorityColor(value)}`}>
          {value || 'Medium'}
        </span>
      )
    },
    {
      key: 'TimeSlotID',
      label: 'Scheduled Time',
      render: (value) => {
        const timeSlot = getTimeSlotInfo(value);
        if (!timeSlot) return <span className="no-schedule">Not scheduled</span>;
        return (
          <div className="time-slot-info">
            <div className="schedule-date">{timeSlot.Date}</div>
            <div className="schedule-time">{timeSlot.TimeWindowStart} - {timeSlot.TimeWindowEnd}</div>
          </div>
        );
      }
    },
    {
      key: 'OrderID',
      label: 'Items',
      render: (value) => {
        const items = getOrderProducts(value);
        const totalItems = items.reduce((sum, item) => sum + (item.Quantity || 0), 0);
        return (
          <div className="order-items-summary">
            <div className="items-count">{totalItems} items</div>
            <div className="products-count">{items.length} products</div>
          </div>
        );
      }
    }
  ];

  const actions = [
    {
      label: 'View Details',
      icon: '👁️',
      onClick: handleViewDetails,
      variant: 'primary'
    },
    {
      label: 'Edit',
      icon: '✏️',
      onClick: handleEdit,
      variant: 'secondary'
    }
  ];

  // Statistics
  const ordersByStatus = orders.reduce((acc, order) => {
    acc[order.OrderStatus] = (acc[order.OrderStatus] || 0) + 1;
    return acc;
  }, {});

  const ordersByResponse = orders.reduce((acc, order) => {
    acc[order.CustomerResponse] = (acc[order.CustomerResponse] || 0) + 1;
    return acc;
  }, {});

  const todayOrders = orders.filter(order => {
    const timeSlot = getTimeSlotInfo(order.TimeSlotID);
    if (!timeSlot) return false;
    const today = new Date().toISOString().split('T')[0];
    return timeSlot.Date === today;
  });

  const urgentOrders = orders.filter(order => order.Priority === 'Urgent' || order.Priority === 'High');

  return (
    <div className="order-manager">
      <div className="manager-header">
        <div className="header-content">
          <h2>📋 Order Management</h2>
          <p>View and manage customer orders and deliveries</p>
        </div>
      </div>

      <div className="data-summary">
        <div className="summary-card total-orders">
          <div className="summary-value">{orders.length}</div>
          <div className="summary-label">Total Orders</div>
        </div>
        <div className="summary-card pending-orders">
          <div className="summary-value">{ordersByStatus.Pending || 0}</div>
          <div className="summary-label">Pending Orders</div>
        </div>
        <div className="summary-card scheduled-orders">
          <div className="summary-value">{ordersByStatus.Scheduled || 0}</div>
          <div className="summary-label">Scheduled Orders</div>
        </div>
        <div className="summary-card today-orders">
          <div className="summary-value">{todayOrders.length}</div>
          <div className="summary-label">Today's Deliveries</div>
        </div>
        <div className="summary-card urgent-orders">
          <div className="summary-value">{urgentOrders.length}</div>
          <div className="summary-label">Urgent Orders</div>
        </div>
        <div className="summary-card accepted-orders">
          <div className="summary-value">{ordersByResponse.Accepted || 0}</div>
          <div className="summary-label">Customer Accepted</div>
        </div>
      </div>

      <DataTable
        data={orders}
        columns={columns}
        actions={actions}
        searchable={true}
        searchPlaceholder="Search orders by ID, customer, or building..."
        emptyMessage="No orders found"
      />

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Order Details - ${selectedOrder.OrderID}`}
          size="extra-large"
        >
          <OrderDetailsContent 
            order={selectedOrder}
            customer={getCustomerInfo(selectedOrder.CustomerID)}
            building={getBuildingInfo(selectedOrder.BuildingID)}
            timeSlot={getTimeSlotInfo(selectedOrder.TimeSlotID)}
            lorryTrip={getLorryTripInfo(selectedOrder.TimeSlotID)}
            orderItems={getOrderProducts(selectedOrder.OrderID)}
          />
        </Modal>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Order - ${editingOrder.OrderID}`}
          size="large"
        >
          <div className="form-container">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Order Status</label>
                <select
                  className="form-select"
                  value={formData.OrderStatus}
                  onChange={(e) => setFormData({ ...formData, OrderStatus: e.target.value })}
                >
                  {orderStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Customer Response</label>
                <select
                  className="form-select"
                  value={formData.CustomerResponse}
                  onChange={(e) => setFormData({ ...formData, CustomerResponse: e.target.value })}
                >
                  {customerResponses.map(response => (
                    <option key={response} value={response}>{response}</option>
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
                <label className="form-label">Time Slot</label>
                <select
                  className="form-select"
                  value={formData.TimeSlotID}
                  onChange={(e) => setFormData({ ...formData, TimeSlotID: e.target.value })}
                >
                  <option value="">No time slot assigned</option>
                  {timeSlots.filter(ts => ts.AvailableFlag).map(timeSlot => (
                    <option key={timeSlot.TimeSlotID} value={timeSlot.TimeSlotID}>
                      {timeSlot.Date} | {timeSlot.TimeWindowStart} - {timeSlot.TimeWindowEnd}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Special Instructions</label>
              <textarea
                className="form-textarea"
                value={formData.SpecialInstructions}
                onChange={(e) => setFormData({ ...formData, SpecialInstructions: e.target.value })}
                placeholder="Special delivery instructions..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Notes</label>
              <textarea
                className="form-textarea"
                value={formData.DeliveryNotes}
                onChange={(e) => setFormData({ ...formData, DeliveryNotes: e.target.value })}
                placeholder="Internal delivery notes..."
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleUpdateOrder}>
                Update Order
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Order Details Content Component
function OrderDetailsContent({ order, customer, building, timeSlot, lorryTrip, orderItems }) {
  return (
    <div className="order-details-content">
      <div className="details-overview">
        <div className="overview-section">
          <h3>📋 Order Overview</h3>
          <div className="overview-stats">
            <div className="stat-item">
              <span className="stat-label">Order ID</span>
              <span className="stat-value id-badge">{order.OrderID}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Status</span>
              <span className={`stat-value status-badge order-status-${order.OrderStatus.toLowerCase()}`}>
                {order.OrderStatus}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Customer Response</span>
              <span className={`stat-value status-badge customer-response-${order.CustomerResponse.toLowerCase()}`}>
                {order.CustomerResponse}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Priority</span>
              <span className={`stat-value priority-badge priority-${(order.Priority || 'Medium').toLowerCase()}`}>
                {order.Priority || 'Medium'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Items</span>
              <span className="stat-value items-count">
                {orderItems.reduce((sum, item) => sum + (item.Quantity || 0), 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="details-grid">
        <div className="details-section customer-section">
          <h3>👤 Customer Information</h3>
          <div className="detail-item">
            <label>Name:</label>
            <span>{customer.FullName}</span>
          </div>
          <div className="detail-item">
            <label>Email:</label>
            <span>{customer.Email}</span>
          </div>
          <div className="detail-item">
            <label>Phone:</label>
            <span className="contact-number">{customer.PhoneNumber}</span>
          </div>
          <div className="detail-item">
            <label>Address:</label>
            <span>{customer.Address}</span>
          </div>
        </div>

        <div className="details-section building-section">
          <h3>🏢 Delivery Location</h3>
          <div className="detail-item">
            <label>Building:</label>
            <span>{building.BuildingName}</span>
          </div>
          <div className="detail-item">
            <label>Type:</label>
            <span className={`type-badge type-${building.HousingType.toLowerCase()}`}>
              {building.HousingType}
            </span>
          </div>
          <div className="detail-item">
            <label>Postal Code:</label>
            <span className="postal-code">{building.PostalCode}</span>
          </div>
          <div className="detail-item">
            <label>Delivery Address:</label>
            <span>{order.Address}</span>
          </div>
          <div className="detail-item">
            <label>Access Hours:</label>
            <span className="access-hours">
              {building.AccessTimeWindowStart} - {building.AccessTimeWindowEnd}
            </span>
          </div>
          <div className="detail-item">
            <label>Facilities:</label>
            <div className="facilities-list">
              {building.LiftAvailable && <span className="facility-badge available">✅ Lift</span>}
              {building.LoadingBayAvailable && <span className="facility-badge available">✅ Loading Bay</span>}
              {building.PreRegistrationRequired && <span className="facility-badge required">⚠️ Pre-registration Required</span>}
            </div>
          </div>
        </div>

        {timeSlot && (
          <div className="details-section schedule-section">
            <h3>⏰ Schedule Information</h3>
            <div className="detail-item">
              <label>Date:</label>
              <span className="schedule-date">{timeSlot.Date}</span>
            </div>
            <div className="detail-item">
              <label>Time Window:</label>
              <span className="schedule-time">
                {timeSlot.TimeWindowStart} - {timeSlot.TimeWindowEnd}
              </span>
            </div>
            <div className="detail-item">
              <label>Available:</label>
              <span className={`availability-badge ${timeSlot.AvailableFlag ? 'available' : 'unavailable'}`}>
                {timeSlot.AvailableFlag ? '✅ Available' : '❌ Unavailable'}
              </span>
            </div>
          </div>
        )}

        {lorryTrip && (
          <div className="details-section logistics-section">
            <h3>🚛 Logistics Information</h3>
            <div className="detail-item">
              <label>Truck:</label>
              <span>{lorryTrip.TruckName}</span>
            </div>
            <div className="detail-item">
              <label>Delivery Team:</label>
              <span className="team-badge team-delivery">{lorryTrip.DeliveryTeamType}</span>
            </div>
            <div className="detail-item">
              <label>Warehouse Team:</label>
              <span className="team-badge team-warehouse">{lorryTrip.WarehouseTeamType}</span>
            </div>
          </div>
        )}

        <div className="details-section preferences-section">
          <h3>📅 Customer Preferences</h3>
          <div className="detail-item">
            <label>Preferred Start:</label>
            <span>{order.PreferredDateTimeStart ? new Date(order.PreferredDateTimeStart).toLocaleString() : 'Not specified'}</span>
          </div>
          <div className="detail-item">
            <label>Preferred End:</label>
            <span>{order.PreferredDateTimeEnd ? new Date(order.PreferredDateTimeEnd).toLocaleString() : 'Not specified'}</span>
          </div>
          {order.SpecialInstructions && (
            <div className="detail-item">
              <label>Special Instructions:</label>
              <span className="special-instructions">{order.SpecialInstructions}</span>
            </div>
          )}
          {order.DeliveryNotes && (
            <div className="detail-item">
              <label>Delivery Notes:</label>
              <span className="delivery-notes">{order.DeliveryNotes}</span>
            </div>
          )}
        </div>
      </div>

      <div className="order-products-section">
        <h3>📦 Order Products</h3>
        {orderItems.length > 0 ? (
          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Dimensions</th>
                  <th>Installation Time</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item, index) => (
                  <tr key={index}>
                    <td><span className="id-badge">{item.ProductID}</span></td>
                    <td className="product-name">{item.ProductName}</td>
                    <td>
                      <span className={`category-badge category-${item.Category.toLowerCase()}`}>
                        {item.Category}
                      </span>
                    </td>
                    <td><span className="quantity-badge">{item.Quantity}</span></td>
                    <td className="dimensions-text">{item.Dimensions}</td>
                    <td className="installation-time">{item.InstallationTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>No products found for this order</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderManager;