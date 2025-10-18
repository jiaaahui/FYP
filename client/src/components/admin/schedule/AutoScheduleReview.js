// import React, { useEffect, useState } from 'react';
// import { getAllTimeSlots, getAllOrders, getAllLorryTrips, getAllTrucks, getAllBuildings, getAllCustomers } from '../../../services/informationService';
// import { ChevronDown, ChevronUp, Edit } from 'lucide-react';

// /**
//  * AutoScheduleReview
//  * - Loads all TimeSlots, filters those created today with Status === 'Proposed'
//  * - Shows summary and list of orders per timeslot with precise ScheduledStart/ScheduledEnd
//  * - Calls onEdit(timeslot) when admin clicks Edit (Schedule.js already has handleEditTimeSlot)
//  *
//  * Props:
//  * - onEdit: function(timeslot) -> opens edit modal in parent
//  */
// export default function AutoScheduleReview({ onEdit }) {
//   const [loading, setLoading] = useState(true);
//   const [timeSlots, setTimeSlots] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [trips, setTrips] = useState([]);
//   const [trucks, setTrucks] = useState([]);
//   const [buildings, setBuildings] = useState([]);
//   const [customers, setCustomers] = useState([]);
//   const [expanded, setExpanded] = useState({});

//   function isSameDate(a, b) {
//     if (!a || !b) return false;
//     const da = new Date(a);
//     const db = new Date(b);
//     return da.getFullYear() === db.getFullYear() &&
//            da.getMonth() === db.getMonth() &&
//            da.getDate() === db.getDate();
//   }

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       setLoading(true);
//       try {
//         const [tsSnap, ordersArr, tripsArr, trucksArr, buildingsArr, customersArr] = await Promise.all([
//           getAllTimeSlots(),
//           getAllOrders(),
//           getAllLorryTrips(),
//           getAllTrucks(),
//           getAllBuildings(),
//           getAllCustomers()
//         ]);
//         if (!mounted) return;

//         // Expect services to return arrays of objects (with CreatedAt possibly as firestore Timestamp)
//         const now = new Date();
//         // We want the timeslots created "today" (the midnight scheduler run) - local date
//         const todayFiltered = tsSnap.filter(ts => {
//           if (!ts.CreatedAt) return false;
//           const created = (ts.CreatedAt.toDate) ? ts.CreatedAt.toDate() : new Date(ts.CreatedAt);
//           return isSameDate(created, now) && (ts.Status === 'Proposed' || ts.Status === 'AutoProposed' || ts.ProposedAt);
//         });

//         setTimeSlots(todayFiltered);
//         setOrders(ordersArr || []);
//         setTrips(tripsArr || []);
//         setTrucks(trucksArr || []);
//         setBuildings(buildingsArr || []);
//         setCustomers(customersArr || []);
//       } catch (err) {
//         console.error('AutoScheduleReview load error', err);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => mounted = false;
//   }, []);

//   function toggleExpand(id) {
//     setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
//   }

//   function findTrip(tripId) {
//     return trips.find(t => t.LorryTripID === tripId || t.id === tripId) || {};
//   }
//   function findTruck(truckId) {
//     return trucks.find(t => t.TruckID === truckId || t.id === truckId) || {};
//   }
//   function findOrdersForSlot(ts) {
//     // TimeSlot.Orders is expected to be array of { OrderID, ScheduledStartDateTime, ScheduledEndDateTime }
//     if (!ts.Orders) return [];
//     return ts.Orders.map(o => {
//       const order = orders.find(ord => (ord.OrderID === o.OrderID || ord.id === o.OrderID) ) || {};
//       return {
//         ...order,
//         ScheduledStartDateTime: o.ScheduledStartDateTime ? (o.ScheduledStartDateTime.toDate ? o.ScheduledStartDateTime.toDate() : new Date(o.ScheduledStartDateTime)) : null,
//         ScheduledEndDateTime: o.ScheduledEndDateTime ? (o.ScheduledEndDateTime.toDate ? o.ScheduledEndDateTime.toDate() : new Date(o.ScheduledEndDateTime)) : null
//       };
//     });
//   }

//   if (loading) return (
//     <div className="p-2 text-sm text-gray-600">Loading auto-scheduled proposals for today...</div>
//   );

//   if (!timeSlots.length) return (
//     <div className="p-2 text-sm text-gray-500">No auto-scheduled proposals created today at midnight.</div>
//   );

//   return (
//     <div className="p-2 border rounded bg-white shadow-sm">
//       <h3 className="text-sm font-medium mb-2">Auto-scheduler (today @00:00) — proposals</h3>
//       <div className="space-y-3">
//         {timeSlots.map(ts => {
//           const trip = findTrip(ts.LorryTripID || ts.LorryTripId) || {};
//           const truck = findTruck(ts.TruckID || trip.TruckID);
//           const tsOrders = findOrdersForSlot(ts);
//           const createdAt = ts.CreatedAt ? (ts.CreatedAt.toDate ? ts.CreatedAt.toDate() : new Date(ts.CreatedAt)) : null;
//           return (
//             <div key={ts.TimeSlotID || ts.id} className="border rounded p-2">
//               <div className="flex items-center justify-between">
//                 <div className="text-sm font-medium">
//                   {ts.TimeSlotID || ts.id} — {ts.Date || ''} {createdAt ? ` (created ${createdAt.toLocaleString()})` : ''}
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <button
//                     className="flex items-center gap-1 text-xs px-2 py-1 bg-yellow-50 text-yellow-800 rounded"
//                     onClick={() => onEdit && onEdit(ts)}
//                   >
//                     <Edit size={12} /> Edit
//                   </button>
//                   <button
//                     className="text-xs px-2 py-1 rounded bg-gray-50 text-gray-700 flex items-center gap-1"
//                     onClick={() => toggleExpand(ts.TimeSlotID || ts.id)}
//                   >
//                     {expanded[ts.TimeSlotID || ts.id] ? <><ChevronUp size={12} /> Collapse</> : <><ChevronDown size={12} /> Details</>}
//                   </button>
//                 </div>
//               </div>

//               {expanded[ts.TimeSlotID || ts.id] && (
//                 <div className="mt-2 text-sm">
//                   <div><strong>Truck:</strong> {truck.CarPlate || truck.TruckID || '—'}</div>
//                   <div className="mt-2 space-y-2">
//                     {tsOrders.length ? tsOrders.map(o => {
//                       const customer = customers.find(c => c.CustomerID === o.CustomerID || c.id === o.CustomerID) || {};
//                       const building = buildings.find(b => b.BuildingID === o.BuildingID || b.building_id === o.BuildingID || b.id === o.BuildingID) || {};
//                       return (
//                         <div key={o.OrderID || o.id} className="p-2 border rounded bg-gray-50">
//                           <div className="flex justify-between">
//                             <div>
//                               <div className="font-medium">{customer.name || o.CustomerName || o.CustomerID || 'Unknown'}</div>
//                               <div className="text-xs text-gray-600">{building.BuildingName || building.building_name || o.BuildingName || o.BuildingID}</div>
//                             </div>
//                             <div className="text-right text-xs">
//                               <div className="text-gray-800">{o.ScheduledStartDateTime ? o.ScheduledStartDateTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : '-'}</div>
//                               <div className="text-gray-500">{o.ScheduledEndDateTime ? o.ScheduledEndDateTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : '-'}</div>
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     }) : <div className="text-xs text-gray-500">No orders listed in this timeslot</div>}
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }