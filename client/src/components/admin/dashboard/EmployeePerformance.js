import React, { useEffect, useState } from 'react';
import {
  getAllEmployees, getAllOrders
} from '../../../services/informationService';
import { Users, Star } from 'lucide-react';

export default function EmployeePerformance () {
  const [employees, setEmployees] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getAllEmployees().then(setEmployees);
    getAllOrders().then(setOrders);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {employees.map((employee) => {
          const employeeOrders = orders.filter(order => order.EmployeeID === employee.EmployeeID);
          const avgEmployeeRating = employeeOrders.length > 0 
            ? employeeOrders.reduce((sum, order) => sum + (order.CustomerRating || 0), 0) / employeeOrders.length 
            : 0;
          return (
            <div key={employee.EmployeeID} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{employee.name}</h4>
                  <p className="text-sm text-gray-600">{employee.role || ''}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  employee.ActiveFlag !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {employee.ActiveFlag !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{employeeOrders.length}</p>
                  <p className="text-xs text-gray-600">Orders Completed</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {avgEmployeeRating > 0 ? avgEmployeeRating.toFixed(1) : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-600">Avg Rating</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Contact:</span> {employee.contact_number || ''}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">ID:</span> {employee.EmployeeID}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {/* Employee Orders Detail */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-semibold text-gray-900 mb-4">Order Details by Employee</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feedback</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.OrderID}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.OrderID}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.EmployeeID}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {order.CustomerRating}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.CustomerFeedback}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {order.OrderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};