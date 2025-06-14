import React, { useEffect, useState } from 'react';
import {
  getAllEmployees, getAllOrders, getAllReports
} from '../../../services/informationService';
import { Users, Star, CheckCircle, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 bg-${color}-50 rounded-lg`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
    </div>
  </div>
);

export default function Overview ()  {
  const [employees, setEmployees] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    getAllEmployees().then(setEmployees);
    getAllOrders().then(setOrders);
    getAllReports().then(setReports);
  }, []);

  // Defensive helpers for field access
  const getOrderId = (order) => order.OrderID || order.id;
  const getOrderRating = (order) => order.CustomerRating ?? order.rating ?? '';
  const getOrderFeedback = (order) => order.CustomerFeedback ?? order.feedback ?? '';
  const getOrderStatus = (order) => order.OrderStatus ?? order.status ?? '';
  const getReportId = (report) => report.ReportID || report.id;
  const getReportContent = (report) => report.Content ?? report.content ?? '';
  const getReportStatus = (report) => report.Status ?? report.status ?? '';

  // Metrics based on flexible keys
  const avgRating = orders.length > 0
    ? (orders.reduce((sum, o) => sum + (getOrderRating(o) ? Number(getOrderRating(o)) : 0), 0) / orders.length)
    : 0;
  const completedOrders = orders.filter(order => getOrderStatus(order) === 'Completed').length;
  const activeEmployees = employees.filter(e => e.ActiveFlag !== false && e.active !== false).length;
  const pendingReports = reports.filter(report => getReportStatus(report) === 'pending').length;

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Completed Orders"
          value={completedOrders}
          icon={CheckCircle}
          color="green"
          subtitle="All time"
        />
        <StatCard
          title="Average Rating"
          value={avgRating.toFixed(1)}
          icon={Star}
          color="yellow"
          subtitle="Customer satisfaction"
        />
        <StatCard
          title="Active Employees"
          value={activeEmployees}
          icon={Users}
          color="blue"
          subtitle={`${employees.length - activeEmployees} inactive`}
        />
        <StatCard
          title="Pending Reports"
          value={pendingReports}
          icon={AlertCircle}
          color="red"
          subtitle="Requires attention"
        />
      </div>
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={getOrderId(order)} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{getOrderId(order)}</p>
                  <p className="text-sm text-gray-600">{getOrderFeedback(order)}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">{getOrderRating(order)}</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                    {getOrderStatus(order)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Reports</h3>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={getReportId(report)} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{getReportId(report)}</p>
                  <p className="text-sm text-gray-600">{getReportContent(report)}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  getReportStatus(report) === 'resolved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getReportStatus(report)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}