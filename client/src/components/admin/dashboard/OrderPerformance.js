import React, { useEffect, useState } from 'react';
import {
  getAllOrders, getAllCustomers, getAllBuildings
} from '../../../services/informationService';
import { Package, CheckCircle, Star, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export default function OrderPerformance() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [buildings, setBuildings] = useState([]);

  // selected month state (focus month). Defaults to current month.
  const [selectedMonthDate, setSelectedMonthDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  useEffect(() => {
    getAllOrders().then(setOrders).catch(err => console.warn(err));
    getAllCustomers().then(setCustomers).catch(err => console.warn(err));
    getAllBuildings().then(setBuildings).catch(err => console.warn(err));
  }, []);

  const getCustomerId = (order) => order.customer_id ?? order.CustomerID ?? order.customerId;
  const getBuildingId = (order) => order.building_id ?? order.BuildingID ?? order.buildingId;
  const getOrderId = (order) => order.id ?? order.OrderID ?? order.orderId;
  const getOrderStatus = (order) => order.order_status ?? order.OrderStatus ?? order.status ?? '';
  const getNumberOfAttempts = (order) => Number(order.number_of_attempts ?? order.NumberOfAttempts ?? order.attempts ?? 1);

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => (c.id || c.CustomerID || c.customerId) === customerId);
    return customer?.full_name || customer?.FullName || customer?.name || customerId;
  };
  const getBuildingName = (buildingId) => {
    const building = buildings.find(b => (b.id || b.BuildingID || b.building_id) === buildingId);
    return building?.building_name || building?.BuildingName || building?.name || buildingId;
  };

  // Robust getOrderDate: returns Date object or null if no valid date found.
  const getOrderDate = (order) => {
    if (!order) return null;
    const tryFields = ['actual_arrival_date_time', 'ActualArrivalDateTime', 'actual_end_date_time', 'created_at', 'createdAt', 'CreatedAt'];
    for (const f of tryFields) {
      const v = order[f];
      if (!v) continue;
      // Firestore Timestamp
      if (typeof v?.toDate === 'function') {
        const d = v.toDate();
        if (d instanceof Date && !isNaN(d.getTime())) return d;
      }
      // ISO string or epoch number or Date object
      if (typeof v === 'string' || typeof v === 'number' || v instanceof Date) {
        const d = v instanceof Date ? v : new Date(v);
        if (d instanceof Date && !isNaN(d.getTime())) return d;
      }
    }
    return null;
  };

  // Defensive formatter (used only if needed)
  function formatMonthYear(date) {
    if (!date) return '';
    try {
      return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return String(date);
    }
  }

  // Helper to filter orders by month/year safely
  const ordersInMonth = (month, year) => (orders || []).filter(order => {
    const d = getOrderDate(order);
    if (!d) return false;
    return d.getMonth() === month && d.getFullYear() === year;
  });

  // Selected month/year
  const now = selectedMonthDate;
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Orders for selected month
  const filteredOrdersForMonth = ordersInMonth(currentMonth, currentYear);

  // Metrics for selected month
  const totalOrdersThisMonth = filteredOrdersForMonth.length;
  const completedOrdersThisMonth = filteredOrdersForMonth.filter(order => getOrderStatus(order) === 'Completed').length;
  const pendingOrdersThisMonth = filteredOrdersForMonth.filter(order => getOrderStatus(order) === 'Pending').length;

  const avgAttemptsThisMonth = filteredOrdersForMonth.length > 0
    ? (filteredOrdersForMonth.reduce((sum, o) => sum + getNumberOfAttempts(o), 0) / filteredOrdersForMonth.length)
    : 0;

  const successRateThisMonth = filteredOrdersForMonth.length > 0
    ? `${Math.round((completedOrdersThisMonth / filteredOrdersForMonth.length) * 100)}%`
    : '0%';

  // helpers for table display
  const getOrderRating = (order) => {
    const r = order.CustomerRating ?? order.rating ?? order.Rating ?? null;
    return (r === '' || r === null || typeof r === 'undefined') ? null : Number(r);
  };

  // Month navigation handlers
  const prevMonth = () => setSelectedMonthDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setSelectedMonthDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Order Management</h3>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={prevMonth}
              className="inline-flex items-center px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50"
              title="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="text-sm font-medium">{formatMonthYear(selectedMonthDate)}</div>

            <button
              onClick={nextMonth}
              className="inline-flex items-center px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50"
              title="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders (month)</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{totalOrdersThisMonth}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate (month)</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{successRateThisMonth}</p>
              <p className="text-xs text-gray-500 mt-1">Completed / total (month)</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Attempts (month)</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{avgAttemptsThisMonth.toFixed(1)}</p>
              <p className="text-xs text-gray-500 mt-1">Average attempts per order</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Building</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attempts</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrdersForMonth.map((order) => {
              const rating = getOrderRating(order);
              return (
                <tr key={getOrderId(order)}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{getOrderId(order)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getCustomerName(getCustomerId(order))}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getBuildingName(getBuildingId(order))}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {rating !== null ? rating.toFixed(1) : 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getNumberOfAttempts(order)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      getOrderStatus(order) === 'Completed' ? 'bg-green-100 text-green-800'
                        : getOrderStatus(order) === 'Pending' ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {getOrderStatus(order)}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filteredOrdersForMonth.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">No orders for selected month.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};