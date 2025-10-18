// import React, { useState, useEffect } from 'react';
// import { 
//   Clock, 
//   MapPin, 
//   Navigation, 
//   Package, 
//   User, 
//   Star, 
//   CheckCircle, 
//   AlertCircle, 
//   Calendar,
//   Route,
//   Phone,
//   Building,
//   Timer,
//   ExternalLink,
//   Play,
//   Pause,
//   Check
// } from 'lucide-react';


// // Mock delivery data - replace with your Firebase data
// const mockDeliveryData = [
//   {
//     OrderID: "ORD_00016",
//     CustomerID: "CUS_00001",
//     BuildingID: "BLD_00005",
//     DeliveryTeamID: "TEM_00003",
//     EmployeeID: "EMP_00010",
//     OrderStatus: "Completed",
//     ScheduledStartDateTime: new Date('2025-05-27T01:48:15+08:00'),
//     ScheduledEndDateTime: new Date('2025-05-27T05:48:15+08:00'),
//     ActualStartDateTime: new Date('2025-05-27T01:56:15+08:00'),
//     ActualEndDateTime: new Date('2025-05-27T04:17:15+08:00'),
//     ActualArrivalDateTime: new Date('2025-05-27T02:21:15+08:00'),
//     CustomerRating: 4.1,
//     CustomerFeedback: "Team was polite.",
//     TimeSlotID: "TSL_00001",
//     NumberOfAttempts: 1,
//     ProofOfDeliveryURL: "https://dummy.pod/ORD_00016.jpg",
//     DelayReason: null,
//     // Additional data for routing
//     BuildingAddress: "123 Main Street, Petaling Jaya, Selangor",
//     CustomerName: "John Doe",
//     CustomerPhone: "+60123456789",
//     Items: ["Package A", "Package B"],
//     Priority: "Normal",
//     EstimatedDuration: 30 // minutes
//   },
//   {
//     OrderID: "ORD_00017",
//     CustomerID: "CUS_00002",
//     BuildingID: "BLD_00006",
//     DeliveryTeamID: "TEM_00003",
//     EmployeeID: "EMP_00010",
//     OrderStatus: "In Progress",
//     ScheduledStartDateTime: new Date('2025-05-27T09:00:00+08:00'),
//     ScheduledEndDateTime: new Date('2025-05-27T12:00:00+08:00'),
//     ActualStartDateTime: new Date('2025-05-27T09:15:00+08:00'),
//     ActualEndDateTime: null,
//     ActualArrivalDateTime: null,
//     CustomerRating: null,
//     CustomerFeedback: null,
//     TimeSlotID: "TSL_00002",
//     NumberOfAttempts: 1,
//     ProofOfDeliveryURL: null,
//     DelayReason: null,
//     BuildingAddress: "456 Business Ave, Kuala Lumpur",
//     CustomerName: "Sarah Chen",
//     CustomerPhone: "+60129876543",
//     Items: ["Document Package", "Equipment"],
//     Priority: "High",
//     EstimatedDuration: 45
//   },
//   {
//     OrderID: "ORD_00018",
//     CustomerID: "CUS_00003",
//     BuildingID: "BLD_00007",
//     DeliveryTeamID: "TEM_00003",
//     EmployeeID: "EMP_00010",
//     OrderStatus: "Pending",
//     ScheduledStartDateTime: new Date('2025-05-27T09:00:00+08:00'),
//     ScheduledEndDateTime: new Date('2025-05-27T12:00:00+08:00'),
//     ActualStartDateTime: null,
//     ActualEndDateTime: null,
//     ActualArrivalDateTime: null,
//     CustomerRating: null,
//     CustomerFeedback: null,
//     TimeSlotID: "TSL_00002",
//     NumberOfAttempts: 0,
//     ProofOfDeliveryURL: null,
//     DelayReason: null,
//     BuildingAddress: "789 Commerce Street, Shah Alam, Selangor",
//     CustomerName: "Ahmad Rahman",
//     CustomerPhone: "+60187654321",
//     Items: ["Fragile Items"],
//     Priority: "Normal",
//     EstimatedDuration: 25
//   },
//   {
//     OrderID: "ORD_00019",
//     CustomerID: "CUS_00004",
//     BuildingID: "BLD_00008",
//     DeliveryTeamID: "TEM_00003",
//     EmployeeID: "EMP_00010",
//     OrderStatus: "Pending",
//     ScheduledStartDateTime: new Date('2025-05-27T13:00:00+08:00'),
//     ScheduledEndDateTime: new Date('2025-05-27T18:00:00+08:00'),
//     ActualStartDateTime: null,
//     ActualEndDateTime: null,
//     ActualArrivalDateTime: null,
//     CustomerRating: null,
//     CustomerFeedback: null,
//     TimeSlotID: "TSL_00003",
//     NumberOfAttempts: 0,
//     ProofOfDeliveryURL: null,
//     DelayReason: null,
//     BuildingAddress: "321 Industrial Park, Subang Jaya, Selangor",
//     CustomerName: "Lisa Wong",
//     CustomerPhone: "+60156789012",
//     Items: ["Bulk Order", "Special Delivery"],
//     Priority: "High",
//     EstimatedDuration: 60
//   }
// ];

// // Time slot definitions
// const timeSlots = {
//   "TSL_00001": { name: "Early Morning", start: "01:00", end: "06:00" },
//   "TSL_00002": { name: "Morning", start: "09:00", end: "12:00" },
//   "TSL_00003": { name: "Afternoon", start: "13:00", end: "18:00" },
//   "TSL_00004": { name: "Evening", start: "19:00", end: "21:00" }
// };

// export default function DeliverySchedule() {
//   const [orders, setOrders] = useState(mockDeliveryData);
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const [selectedTeam, setSelectedTeam] = useState("TEM_00003");
//   const [currentOrder, setCurrentOrder] = useState(null);

//   // Group orders by time slot
//   const groupedOrders = orders.reduce((groups, order) => {
//     const timeSlot = order.TimeSlotID;
//     if (!groups[timeSlot]) {
//       groups[timeSlot] = [];
//     }
//     groups[timeSlot].push(order);
//     return groups;
//   }, {});

//   // Sort orders within each time slot by priority and scheduled time
//   Object.keys(groupedOrders).forEach(timeSlot => {
//     groupedOrders[timeSlot].sort((a, b) => {
//       // High priority first
//       if (a.Priority === "High" && b.Priority !== "High") return -1;
//       if (b.Priority === "High" && a.Priority !== "High") return 1;
//       // Then by scheduled start time
//       return new Date(a.ScheduledStartDateTime) - new Date(b.ScheduledStartDateTime);
//     });
//   });

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'Completed': return 'bg-green-100 text-green-800';
//       case 'In Progress': return 'bg-blue-100 text-blue-800';
//       case 'Pending': return 'bg-yellow-100 text-yellow-800';
//       case 'Failed': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const getPriorityColor = (priority) => {
//     switch (priority) {
//       case 'High': return 'bg-red-100 text-red-800';
//       case 'Normal': return 'bg-gray-100 text-gray-800';
//       case 'Low': return 'bg-green-100 text-green-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const formatTime = (date) => {
//     if (!date) return 'N/A';
//     return new Date(date).toLocaleTimeString('en-US', { 
//       hour: '2-digit', 
//       minute: '2-digit',
//       hour12: false 
//     });
//   };

//   const generateGoogleMapsRoute = (orders) => {
//     if (orders.length === 0) return '#';
    
//     const waypoints = orders.map(order => encodeURIComponent(order.BuildingAddress)).join('|');
//     const destination = encodeURIComponent(orders[orders.length - 1].BuildingAddress);
    
//     // Starting from current location
//     return `https://www.google.com/maps/dir/Current+Location/${waypoints}/${destination}`;
//   };

//   const generateSingleLocationMap = (address) => {
//     return `https://www.google.com/maps/search/${encodeURIComponent(address)}`;
//   };

//   const updateOrderStatus = (orderId, newStatus) => {
//     setOrders(prev => prev.map(order => 
//       order.OrderID === orderId 
//         ? { ...order, OrderStatus: newStatus, ActualStartDateTime: newStatus === 'In Progress' ? new Date() : order.ActualStartDateTime }
//         : order
//     ));
//   };

//   const getTotalEstimatedTime = (orders) => {
//     return orders.reduce((total, order) => total + order.EstimatedDuration, 0);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <Navigation className="h-8 w-8 text-blue-600 mr-3" />
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">Delivery Schedule</h1>
//                 <p className="text-gray-600">Optimized delivery routes and schedules</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="flex items-center space-x-2">
//                 <Calendar className="h-4 w-4 text-gray-500" />
//                 <input
//                   type="date"
//                   value={selectedDate}
//                   onChange={(e) => setSelectedDate(e.target.value)}
//                   className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
//                 />
//               </div>
//               <select
//                 value={selectedTeam}
//                 onChange={(e) => setSelectedTeam(e.target.value)}
//                 className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
//               >
//                 <option value="TEM_00003">Team Alpha</option>
//                 <option value="TEM_00004">Team Beta</option>
//                 <option value="TEM_00005">Team Gamma</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Time Slot Schedule */}
//         <div className="space-y-6">
//           {Object.entries(groupedOrders).map(([timeSlotId, timeSlotOrders]) => {
//             const timeSlot = timeSlots[timeSlotId];
//             const totalTime = getTotalEstimatedTime(timeSlotOrders);
//             const completedOrders = timeSlotOrders.filter(o => o.OrderStatus === 'Completed').length;
            
//             return (
//               <div key={timeSlotId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//                 {/* Time Slot Header */}
//                 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center">
//                       <Clock className="h-6 w-6 text-blue-600 mr-3" />
//                       <div>
//                         <h3 className="text-lg font-semibold text-gray-900">{timeSlot.name}</h3>
//                         <p className="text-sm text-gray-600">{timeSlot.start} - {timeSlot.end}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-6">
//                       <div className="text-center">
//                         <p className="text-2xl font-bold text-blue-600">{timeSlotOrders.length}</p>
//                         <p className="text-xs text-gray-600">Orders</p>
//                       </div>
//                       <div className="text-center">
//                         <p className="text-2xl font-bold text-green-600">{completedOrders}</p>
//                         <p className="text-xs text-gray-600">Completed</p>
//                       </div>
//                       <div className="text-center">
//                         <p className="text-2xl font-bold text-purple-600">{totalTime}m</p>
//                         <p className="text-xs text-gray-600">Est. Time</p>
//                       </div>
//                       <a
//                         href={generateGoogleMapsRoute(timeSlotOrders)}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                       >
//                         <Route className="h-4 w-4 mr-2" />
//                         Optimal Route
//                         <ExternalLink className="h-3 w-3 ml-1" />
//                       </a>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Orders List */}
//                 <div className="p-6">
//                   <div className="space-y-4">
//                     {timeSlotOrders.map((order, index) => (
//                       <div key={order.OrderID} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
//                         <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
//                           {/* Sequence Number */}
//                           <div className="lg:col-span-1">
//                             <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
//                               {index + 1}
//                             </div>
//                           </div>

//                           {/* Order Info */}
//                           <div className="lg:col-span-4">
//                             <div className="flex items-center justify-between mb-2">
//                               <h4 className="font-semibold text-gray-900">{order.OrderID}</h4>
//                               <div className="flex space-x-2">
//                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.OrderStatus)}`}>
//                                   {order.OrderStatus}
//                                 </span>
//                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.Priority)}`}>
//                                   {order.Priority}
//                                 </span>
//                               </div>
//                             </div>
//                             <div className="space-y-1 text-sm text-gray-600">
//                               <div className="flex items-center">
//                                 <User className="h-3 w-3 mr-1" />
//                                 {order.CustomerName}
//                               </div>
//                               <div className="flex items-center">
//                                 <Phone className="h-3 w-3 mr-1" />
//                                 {order.CustomerPhone}
//                               </div>
//                               <div className="flex items-center">
//                                 <Package className="h-3 w-3 mr-1" />
//                                 {order.Items.join(', ')}
//                               </div>
//                             </div>
//                           </div>

//                           {/* Address */}
//                           <div className="lg:col-span-3">
//                             <div className="flex items-start">
//                               <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
//                               <div>
//                                 <p className="text-sm text-gray-900 font-medium">{order.BuildingID}</p>
//                                 <p className="text-xs text-gray-600">{order.BuildingAddress}</p>
//                               </div>
//                             </div>
//                           </div>

//                           {/* Time Info */}
//                           <div className="lg:col-span-2">
//                             <div className="text-sm">
//                               <div className="flex items-center text-gray-600 mb-1">
//                                 <Timer className="h-3 w-3 mr-1" />
//                                 Est. {order.EstimatedDuration}m
//                               </div>
//                               {order.ActualStartDateTime && (
//                                 <div className="text-blue-600">
//                                   Started: {formatTime(order.ActualStartDateTime)}
//                                 </div>
//                               )}
//                               {order.ActualEndDateTime && (
//                                 <div className="text-green-600">
//                                   Completed: {formatTime(order.ActualEndDateTime)}
//                                 </div>
//                               )}
//                             </div>
//                           </div>

//                           {/* Actions */}
//                           <div className="lg:col-span-2 flex items-center space-x-2">
//                             {/* Status Update Buttons */}
//                             {order.OrderStatus === 'Pending' && (
//                               <button
//                                 onClick={() => updateOrderStatus(order.OrderID, 'In Progress')}
//                                 className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                                 title="Start Delivery"
//                               >
//                                 <Play className="h-4 w-4" />
//                               </button>
//                             )}
//                             {order.OrderStatus === 'In Progress' && (
//                               <button
//                                 onClick={() => updateOrderStatus(order.OrderID, 'Completed')}
//                                 className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
//                                 title="Mark Complete"
//                               >
//                                 <Check className="h-4 w-4" />
//                               </button>
//                             )}

//                             {/* Navigation Button */}
//                             <a
//                               href={generateSingleLocationMap(order.BuildingAddress)}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
//                             >
//                               <Navigation className="h-4 w-4 mr-1" />
//                               Navigate
//                             </a>
//                           </div>
//                         </div>

//                         {/* Additional Info for Completed Orders */}
//                         {order.OrderStatus === 'Completed' && order.CustomerRating && (
//                           <div className="mt-4 pt-4 border-t border-gray-100">
//                             <div className="flex items-center justify-between">
//                               <div className="flex items-center">
//                                 <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
//                                 <span className="text-sm font-medium">{order.CustomerRating}/5</span>
//                                 {order.CustomerFeedback && (
//                                   <span className="text-sm text-gray-600 ml-3">"{order.CustomerFeedback}"</span>
//                                 )}
//                               </div>
//                               {order.ProofOfDeliveryURL && (
//                                 <a
//                                   href={order.ProofOfDeliveryURL}
//                                   target="_blank"
//                                   rel="noopener noreferrer"
//                                   className="text-sm text-blue-600 hover:text-blue-800"
//                                 >
//                                   View Proof of Delivery
//                                 </a>
//                               )}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }