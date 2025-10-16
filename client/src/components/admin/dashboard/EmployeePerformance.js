import React, { useEffect, useState } from 'react';
import {
  getAllEmployees, getAllOrders
} from '../../../services/informationService';
import { Users, Star, Phone, Badge, TrendingUp } from 'lucide-react';

export default function EmployeePerformance() {
  const [employees, setEmployees] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getAllEmployees().then(setEmployees);
    getAllOrders().then(setOrders);
  }, []);

  // Calculate top performers
  const employeeStats = employees.map(employee => {
    const employeeOrders = orders.filter(order => order.EmployeeID === employee.EmployeeID);
    const avgRating = employeeOrders.length > 0 
      ? employeeOrders.reduce((sum, order) => sum + (order.CustomerRating || 0), 0) / employeeOrders.length 
      : 0;
    
    return {
      ...employee,
      orderCount: employeeOrders.length,
      avgRating: avgRating,
      orders: employeeOrders
    };
  });

  const topPerformers = employeeStats
    .filter(emp => emp.orderCount > 0)
    .sort((a, b) => (b.avgRating * b.orderCount) - (a.avgRating * a.orderCount))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header Section with Summary Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      
        {/* Top Performers */}
        {topPerformers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Top Performers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topPerformers.map((employee, index) => (
                <div key={employee.EmployeeID} className="relative">
                  {index === 0 && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      1
                    </div>
                  )}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{employee.name}</h4>
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-4 w-4 fill-current mr-1" />
                        <span className="text-sm font-medium">{employee.avgRating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{employee.role || 'Staff'}</p>
                    <p className="text-lg font-bold text-blue-600">{employee.orderCount} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {employeeStats.map((employee) => (
          <div key={employee.EmployeeID} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="font-semibold text-gray-900 text-lg">{employee.name}</h4>
                    <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      employee.ActiveFlag !== false 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.ActiveFlag !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Badge className="h-4 w-4 mr-1" />
                    {employee.role || 'Staff Member'}
                  </p>
                  {employee.contact_number && (
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <Phone className="h-4 w-4 mr-1" />
                      {employee.contact_number}
                    </p>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{employee.orderCount}</p>
                  <p className="text-xs text-gray-600 mt-1">Orders Completed</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <p className="text-2xl font-bold text-yellow-600">
                      {employee.avgRating > 0 ? employee.avgRating.toFixed(1) : 'N/A'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600">Avg Rating</p>
                </div>
              </div>

              {/* Employee ID */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Employee ID: <span className="font-mono">{employee.EmployeeID}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Order Details by Employee</h3>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-1" />
            {orders.length} total orders
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Feedback
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => {
                const employee = employees.find(e => e.EmployeeID === order.EmployeeID);
                return (
                  <tr key={order.OrderID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.OrderID}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div>
                        <div className="font-medium">{employee?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">ID: {order.EmployeeID}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.CustomerRating ? (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                          <span className="font-medium">{order.CustomerRating}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No rating</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                      <div className="truncate" title={order.CustomerFeedback}>
                        {order.CustomerFeedback || 'No feedback provided'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.OrderStatus === 'Completed' 
                          ? 'bg-green-100 text-green-800'
                          : order.OrderStatus === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.OrderStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};