// import React, { useEffect, useState } from 'react';
// import {
//   getAllOrders, getAllCustomers, getAllBuildings
// } from '../../../services/informationService';
// import { Package, CheckCircle, Star, Clock } from 'lucide-react';

// export default function OrderPerformance() {
//   const [orders, setOrders] = useState([]);
//   const [customers, setCustomers] = useState([]);
//   const [buildings, setBuildings] = useState([]);

//   useEffect(() => {
//     getAllOrders().then(setOrders);
//     getAllCustomers().then(setCustomers);
//     getAllBuildings().then(setBuildings);
//   }, []);

//   const getCustomerName = (customerId) => {
//     const customer = customers.find(c => c.CustomerID === customerId);
//     return customer?.FullName || customerId;
//   };
//   const getBuildingName = (buildingId) => {
//     const building = buildings.find(b => b.building_id === buildingId || b.BuildingID === buildingId);
//     return building?.BuildingName || buildingId;
//   };

//   const completedOrders = orders.filter(order => order.OrderStatus === 'Completed').length;
//   const avgAttempts = orders.length > 0 ? (orders.reduce((sum, o) => sum + (o.NumberOfAttempts || 1), 0) / orders.length) : 0;
//   const successRate = orders.length > 0 ? Math.round((completedOrders / orders.length) * 100) + '%' : '0%';

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//       <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Management</h3>
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Total Orders</p>
//               <p className="text-2xl font-bold text-blue-600 mt-1">{orders.length}</p>
//             </div>
//             <div className="p-3 bg-blue-50 rounded-lg">
//               <Package className="h-6 w-6 text-blue-600" />
//             </div>
//           </div>
//         </div>
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Success Rate</p>
//               <p className="text-2xl font-bold text-green-600 mt-1">{successRate}</p>
//               <p className="text-xs text-gray-500 mt-1">All orders completed</p>
//             </div>
//             <div className="p-3 bg-green-50 rounded-lg">
//               <CheckCircle className="h-6 w-6 text-green-600" />
//             </div>
//           </div>
//         </div>
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Avg Attempts</p>
//               <p className="text-2xl font-bold text-purple-600 mt-1">{avgAttempts.toFixed(1)}</p>
//               <p className="text-xs text-gray-500 mt-1">First-time success</p>
//             </div>
//             <div className="p-3 bg-purple-50 rounded-lg">
//               <Clock className="h-6 w-6 text-purple-600" />
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Building</th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attempts</th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {orders.map((order) => (
//               <tr key={order.OrderID}>
//                 <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.OrderID}</td>
//                 <td className="px-4 py-3 text-sm text-gray-600">{getCustomerName(order.CustomerID)}</td>
//                 <td className="px-4 py-3 text-sm text-gray-600">{getBuildingName(order.BuildingID)}</td>
//                 <td className="px-4 py-3 text-sm text-gray-600">
//                   <div className="flex items-center">
//                     <Star className="h-4 w-4 text-yellow-400 mr-1" />
//                     {order.CustomerRating}
//                   </div>
//                 </td>
//                 <td className="px-4 py-3 text-sm text-gray-600">{order.NumberOfAttempts}</td>
//                 <td className="px-4 py-3">
//                   <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                     {order.OrderStatus}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };
