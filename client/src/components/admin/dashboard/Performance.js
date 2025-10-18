// import React, { useState } from 'react';
// import { Users, Truck, Package, MapPin, Clock, Star, AlertCircle, CheckCircle, Calendar, TrendingUp } from 'lucide-react';

// const Dashboard = () => {
//   const [activeTab, setActiveTab] = useState('overview');

//   // Data from the database
//   const employees = [
//     { id: 'EMP_00015', name: 'Tester 6', active: true, contact: '0123455571', role: 'installer' },
//     { id: 'EMP_00016', name: 'Tester 5', active: false, contact: '01232323232', role: 'warehouse loader team' }
//   ];

//   const orders = [
//     {
//       id: 'ORD_00019',
//       customerId: 'CUS_00003',
//       employeeId: 'EMP_00010',
//       rating: 3.7,
//       feedback: 'Excellent!',
//       status: 'Completed',
//       scheduledStart: '2025-06-08T14:48:17Z',
//       actualStart: '2025-06-08T14:59:17Z',
//       actualEnd: '2025-06-08T16:01:17Z',
//       buildingId: 'BLD_00008',
//       attempts: 1
//     },
//     {
//       id: 'ORD_00020',
//       customerId: 'CUS_00003',
//       employeeId: 'EMP_00010',
//       rating: 4.7,
//       feedback: 'Quick and clean.',
//       status: 'Completed',
//       scheduledStart: '2025-05-31T17:48:18Z',
//       actualStart: '2025-05-31T18:06:18Z',
//       actualEnd: '2025-05-31T19:24:18Z',
//       buildingId: 'BLD_00003',
//       attempts: 1
//     }
//   ];

//   const buildings = [
//     { id: 'BLD_00007', name: 'Bangsar Park Residence', type: 'Condominium', zone: 'ZON_00011', postal: '54231', lift: true, loading: true },
//     { id: 'BLD_00008', name: 'OUG Parklane', type: 'Condominium', zone: 'ZON_00009', postal: '54069', lift: true, loading: true }
//   ];

//   const trucks = [
//     { id: 'TRK_00019', plate: 'XWD4558', tone: 3, length: 443, width: 250, height: 210 },
//     { id: 'TRK_00020', plate: 'FAC6652', tone: 3, length: 443, width: 250, height: 210 }
//   ];

//   const products = [
//     { id: 'PRD_00005', name: 'Dryer', installTime: '10-15 min', installerRequired: false, fragile: false },
//     { id: 'PRD_00006', name: 'Air Conditioner', installTime: '60-90 min', installerRequired: true, fragile: false }
//   ];

//   const reports = [
//     { id: 'RPT_00002', content: 'Delivery issue reported #2', status: 'resolved', date: '2025-06-12', employee: 'EMP_00003' },
//     { id: 'RPT_00003', content: 'Delivery issue reported #3', status: 'pending', date: '2025-06-12', employee: 'EMP_00009' }
//   ];

//   const zones = [
//     { id: 'ZON_00014', name: 'Setapak' },
//     { id: 'ZON_00015', name: 'Ad-hoc' }
//   ];

//   const timeSlots = [
//     { id: 'TSL_00004', date: '2025-06-14', start: '08:00', end: '12:00', available: true, tripId: 'TRP_00005' },
//     { id: 'TSL_00005', date: '2025-06-15', start: '08:00', end: '12:00', available: true, tripId: 'TRP_00001' }
//   ];

//   // Calculate metrics
//   const avgRating = orders.reduce((sum, order) => sum + order.rating, 0) / orders.length;
//   const completedOrders = orders.filter(order => order.status === 'Completed').length;
//   const activeEmployees = employees.filter(emp => emp.active).length;
//   const pendingReports = reports.filter(report => report.status === 'pending').length;

//   const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium text-gray-600">{title}</p>
//           <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
//           {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
//         </div>
//         <div className={`p-3 bg-${color}-50 rounded-lg`}>
//           <Icon className={`h-6 w-6 text-${color}-600`} />
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Logistics Dashboard</h1>
//               <p className="text-sm text-gray-600">Welcome back! Here's what's happening today.</p>
//             </div>
//             <div className="flex items-center space-x-3">
//               <div className="text-right">
//                 <p className="text-sm font-medium text-gray-900">Saturday, June 14, 2025</p>
//                 <p className="text-xs text-gray-500">Kuala Lumpur, Malaysia</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Navigation Tabs */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
//         <div className="border-b border-gray-200">
//           <nav className="-mb-px flex space-x-8">
//             {[
//               { id: 'overview', name: 'Overview', icon: TrendingUp },
//               { id: 'employees', name: 'Employee Performance', icon: Users },
//               { id: 'orders', name: 'Orders', icon: Package },
//               { id: 'fleet', name: 'Fleet & Zones', icon: Truck }
//             ].map((tab) => {
//               const Icon = tab.icon;
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
//                     activeTab === tab.id
//                       ? 'border-blue-500 text-blue-600'
//                       : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                   }`}
//                 >
//                   <Icon className="h-4 w-4 mr-2" />
//                   {tab.name}
//                 </button>
//               );
//             })}
//           </nav>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {activeTab === 'overview' && (
//           <div className="space-y-8">
//             {/* Key Metrics */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               <StatCard
//                 title="Completed Orders"
//                 value={completedOrders}
//                 icon={CheckCircle}
//                 color="green"
//                 subtitle="All time"
//               />
//               <StatCard
//                 title="Average Rating"
//                 value={avgRating.toFixed(1)}
//                 icon={Star}
//                 color="yellow"
//                 subtitle="Customer satisfaction"
//               />
//               <StatCard
//                 title="Active Employees"
//                 value={activeEmployees}
//                 icon={Users}
//                 color="blue"
//                 subtitle={`${employees.length - activeEmployees} inactive`}
//               />
//               <StatCard
//                 title="Pending Reports"
//                 value={pendingReports}
//                 icon={AlertCircle}
//                 color="red"
//                 subtitle="Requires attention"
//               />
//             </div>

//             {/* Recent Activity */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
//                 <div className="space-y-4">
//                   {orders.map((order) => (
//                     <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                       <div>
//                         <p className="font-medium text-gray-900">{order.id}</p>
//                         <p className="text-sm text-gray-600">{order.feedback}</p>
//                       </div>
//                       <div className="text-right">
//                         <div className="flex items-center">
//                           <Star className="h-4 w-4 text-yellow-400 mr-1" />
//                           <span className="text-sm font-medium">{order.rating}</span>
//                         </div>
//                         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
//                           {order.status}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">System Reports</h3>
//                 <div className="space-y-4">
//                   {reports.map((report) => (
//                     <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                       <div>
//                         <p className="font-medium text-gray-900">{report.id}</p>
//                         <p className="text-sm text-gray-600">{report.content}</p>
//                       </div>
//                       <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                         report.status === 'resolved' 
//                           ? 'bg-green-100 text-green-800' 
//                           : 'bg-red-100 text-red-800'
//                       }`}>
//                         {report.status}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'employees' && (
//           <div className="space-y-8">
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-6">Employee Performance</h3>
              
//               {/* Employee Performance Cards */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//                 {employees.map((employee) => {
//                   const employeeOrders = orders.filter(order => order.employeeId === employee.id);
//                   const avgEmployeeRating = employeeOrders.length > 0 
//                     ? employeeOrders.reduce((sum, order) => sum + order.rating, 0) / employeeOrders.length 
//                     : 0;
                  
//                   return (
//                     <div key={employee.id} className="border border-gray-200 rounded-lg p-4">
//                       <div className="flex items-center justify-between mb-3">
//                         <div>
//                           <h4 className="font-semibold text-gray-900">{employee.name}</h4>
//                           <p className="text-sm text-gray-600">{employee.role}</p>
//                         </div>
//                         <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                           employee.active 
//                             ? 'bg-green-100 text-green-800' 
//                             : 'bg-red-100 text-red-800'
//                         }`}>
//                           {employee.active ? 'Active' : 'Inactive'}
//                         </span>
//                       </div>
                      
//                       <div className="grid grid-cols-2 gap-4 mt-4">
//                         <div className="text-center p-3 bg-blue-50 rounded-lg">
//                           <p className="text-2xl font-bold text-blue-600">{employeeOrders.length}</p>
//                           <p className="text-xs text-gray-600">Orders Completed</p>
//                         </div>
//                         <div className="text-center p-3 bg-yellow-50 rounded-lg">
//                           <p className="text-2xl font-bold text-yellow-600">
//                             {avgEmployeeRating > 0 ? avgEmployeeRating.toFixed(1) : 'N/A'}
//                           </p>
//                           <p className="text-xs text-gray-600">Avg Rating</p>
//                         </div>
//                       </div>
                      
//                       <div className="mt-4 pt-3 border-t border-gray-100">
//                         <p className="text-sm text-gray-600">
//                           <span className="font-medium">Contact:</span> {employee.contact}
//                         </p>
//                         <p className="text-sm text-gray-600">
//                           <span className="font-medium">ID:</span> {employee.id}
//                         </p>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Employee Orders Detail */}
//               <div className="border-t border-gray-200 pt-6">
//                 <h4 className="font-semibold text-gray-900 mb-4">Order Details by Employee</h4>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feedback</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {orders.map((order) => (
//                         <tr key={order.id}>
//                           <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.id}</td>
//                           <td className="px-4 py-3 text-sm text-gray-600">{order.employeeId}</td>
//                           <td className="px-4 py-3 text-sm text-gray-600">
//                             <div className="flex items-center">
//                               <Star className="h-4 w-4 text-yellow-400 mr-1" />
//                               {order.rating}
//                             </div>
//                           </td>
//                           <td className="px-4 py-3 text-sm text-gray-600">{order.feedback}</td>
//                           <td className="px-4 py-3">
//                             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                               {order.status}
//                             </span>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'orders' && (
//           <div className="space-y-8">
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Management</h3>
              
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//                 <StatCard
//                   title="Total Orders"
//                   value={orders.length}
//                   icon={Package}
//                   color="blue"
//                 />
//                 <StatCard
//                   title="Success Rate"
//                   value="100%"
//                   icon={CheckCircle}
//                   color="green"
//                   subtitle="All orders completed"
//                 />
//                 <StatCard
//                   title="Avg Attempts"
//                   value="1.0"
//                   icon={Clock}
//                   color="purple"
//                   subtitle="First-time success"
//                 />
//               </div>

//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Building</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attempts</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {orders.map((order) => (
//                       <tr key={order.id}>
//                         <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.id}</td>
//                         <td className="px-4 py-3 text-sm text-gray-600">{order.customerId}</td>
//                         <td className="px-4 py-3 text-sm text-gray-600">{order.buildingId}</td>
//                         <td className="px-4 py-3 text-sm text-gray-600">
//                           <div className="flex items-center">
//                             <Star className="h-4 w-4 text-yellow-400 mr-1" />
//                             {order.rating}
//                           </div>
//                         </td>
//                         <td className="px-4 py-3 text-sm text-gray-600">{order.attempts}</td>
//                         <td className="px-4 py-3">
//                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                             {order.status}
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'fleet' && (
//           <div className="space-y-8">
//             {/* Fleet Overview */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Fleet Status</h3>
//                 <div className="space-y-4">
//                   {trucks.map((truck) => (
//                     <div key={truck.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                       <div>
//                         <p className="font-medium text-gray-900">{truck.plate}</p>
//                         <p className="text-sm text-gray-600">{truck.tone}T Capacity</p>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-sm text-gray-600">{truck.id}</p>
//                         <p className="text-xs text-gray-500">{truck.length}×{truck.width}×{truck.height} cm</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Zones</h3>
//                 <div className="space-y-4">
//                   {zones.map((zone) => (
//                     <div key={zone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                       <div className="flex items-center">
//                         <MapPin className="h-4 w-4 text-blue-600 mr-2" />
//                         <div>
//                           <p className="font-medium text-gray-900">{zone.name}</p>
//                           <p className="text-sm text-gray-600">{zone.id}</p>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Buildings */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Buildings & Facilities</h3>
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 {buildings.map((building) => (
//                   <div key={building.id} className="border border-gray-200 rounded-lg p-4">
//                     <div className="flex items-center justify-between mb-3">
//                       <h4 className="font-semibold text-gray-900">{building.name}</h4>
//                       <span className="text-xs text-gray-500">{building.postal}</span>
//                     </div>
//                     <p className="text-sm text-gray-600 mb-3">{building.type}</p>
//                     <div className="flex items-center space-x-4">
//                       <div className="flex items-center">
//                         <div className={`w-2 h-2 rounded-full mr-2 ${building.lift ? 'bg-green-400' : 'bg-red-400'}`}></div>
//                         <span className="text-xs text-gray-600">Lift Available</span>
//                       </div>
//                       <div className="flex items-center">
//                         <div className={`w-2 h-2 rounded-full mr-2 ${building.loading ? 'bg-green-400' : 'bg-red-400'}`}></div>
//                         <span className="text-xs text-gray-600">Loading Bay</span>
//                       </div>
//                     </div>
//                     <p className="text-xs text-gray-500 mt-2">Zone: {building.zone}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Time Slots */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Time Slots</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {timeSlots.map((slot) => (
//                   <div key={slot.id} className="border border-gray-200 rounded-lg p-4">
//                     <div className="flex items-center justify-between mb-2">
//                       <div className="flex items-center">
//                         <Calendar className="h-4 w-4 text-blue-600 mr-2" />
//                         <span className="font-medium text-gray-900">{slot.date}</span>
//                       </div>
//                       <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                         slot.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                       }`}>
//                         {slot.available ? 'Available' : 'Booked'}
//                       </span>
//                     </div>
//                     <div className="flex items-center text-sm text-gray-600">
//                       <Clock className="h-4 w-4 mr-1" />
//                       {slot.start} - {slot.end}
//                     </div>
//                     <p className="text-xs text-gray-500 mt-1">Trip: {slot.tripId}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;