import React, { useState, useEffect } from 'react';
import {
    getAllTimeSlots, addTimeSlot, updateTimeSlot, deleteTimeSlot,
    getAllLorryTrips, addLorryTrip, updateLorryTrip,
    getAllTrucks, getAllTeams, getAllOrders, getAllOrderProducts,
    getAllEmployees, getAllEmployeeTeamAssignments,
    getAllCustomers, getAllBuildings, getAllProducts
} from '../../../services/informationService'; // Adjust path as needed
import { Calendar, Clock, Truck, Package, Users, MapPin, Edit, Save, X, Plus, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

// Helper for generating days in a given month
function getMonthDates(year, month) {
    const dates = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return dates;
}

export default function Schedule() {
    const [viewMode, setViewMode] = useState('weekly');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [editingTimeSlot, setEditingTimeSlot] = useState(null);
    const [expandedSlots, setExpandedSlots] = useState(new Set());
    const [showAddModal, setShowAddModal] = useState(false);

    // Data from Firestore
    const [timeSlots, setTimeSlots] = useState([]);
    const [lorryTrips, setLorryTrips] = useState([]);
    const [trucks, setTrucks] = useState([]);
    const [teams, setTeams] = useState([]);
    const [orders, setOrders] = useState([]);
    const [orderProducts, setOrderProducts] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [employeeAssignments, setEmployeeAssignments] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [productsList, setProductsList] = useState([]);

    // Modal states
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState('');
    const [addOrEdit, setAddOrEdit] = useState('add'); // or 'edit'

    // Load all data
    useEffect(() => {
        async function loadAll() {
            const [
                slots, trips, tks, tms, ords, ordProds, emps, empAssigns, custs, blds, prods
            ] = await Promise.all([
                getAllTimeSlots(),
                getAllLorryTrips(),
                getAllTrucks(),
                getAllTeams(),
                getAllOrders(),
                getAllOrderProducts(),
                getAllEmployees(),
                getAllEmployeeTeamAssignments(),
                getAllCustomers(),
                getAllBuildings(),
                getAllProducts()
            ]);
            setTimeSlots(slots);
            setLorryTrips(trips);
            setTrucks(tks);
            setTeams(tms);
            setOrders(ords);
            setOrderProducts(ordProds);
            setEmployees(emps);
            setEmployeeAssignments(empAssigns);
            setCustomers(custs);
            setBuildings(blds);
            setProductsList(prods);
        }
        loadAll();
    }, []);

    // --- Data enrichment helpers ---
    function getTruck(truckId) {
        return trucks.find(t => t.truck_id === truckId || t.TruckID === truckId);
    }
    function getTeam(teamId) {
        return teams.find(t => t.TeamID === teamId);
    }
    function getOrdersForSlot(timeSlotId) {
        return orders.filter(o => o.TimeSlotID === timeSlotId);
    }
    function getOrderProductsForOrder(orderId) {
        return orderProducts.filter(op => op.OrderID === orderId);
    }
    function getEmployeesForTeam(teamId) {
        const assigned = employeeAssignments.filter(ea => ea.TeamID === teamId);
        return employees.filter(e => assigned.some(a => a.EmployeeID === e.EmployeeID));
    }
    function getLorryTrip(tripId) {
        return lorryTrips.find(t => t.LorryTripID === tripId);
    }

    // --- Calendar logic ---
    const getCurrentWeekDates = () => {
        const start = new Date(selectedDate);
        const day = start.getDay();
        const diff = start.getDate() - day;
        start.setDate(diff);
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const formatDate = (date) => date.toISOString().split('T')[0];

    const getTimeSlotsForDate = (date) => {
        const dateStr = formatDate(date);
        return timeSlots.filter(slot => slot.Date === dateStr);
    };

    // --- CRUD Handlers ---
    const handleEditTimeSlot = (slot) => {
        setAddOrEdit('edit');
        // Deep clone, add slot.lorryTrip for easier editing
        const lorryTrip = getLorryTrip(slot.LorryTripID) || {};
        setEditingTimeSlot({
            ...slot,
            lorryTrip: { ...lorryTrip }
        });
        setShowAddModal(true);
    };

    const handleDeleteTimeSlot = async (slot) => {
        if (!window.confirm('Delete this time slot?')) return;
        await deleteTimeSlot(slot.TimeSlotID);
        setTimeSlots(prev => prev.filter(s => s.TimeSlotID !== slot.TimeSlotID));
    };

    // --- Add TimeSlot Modal ---
    const handleAddTimeSlot = () => {
        setAddOrEdit('add');
        setEditingTimeSlot({
            Date: formatDate(selectedDate),
            TimeWindowStart: '',
            TimeWindowEnd: '',
            AvailableFlag: true,
            LorryTripID: '',
            lorryTrip: {}
        });
        setShowAddModal(true);
    };

    // --- Save handler for Add/Edit Modal ---
    const handleSaveEdit = async () => {
        setModalLoading(true);
        setModalError('');
        try {
            // 1. Handle lorry trip (assign or create)
            let lorryTripID = editingTimeSlot.LorryTripID;
            let tripData = { ...editingTimeSlot.lorryTrip };
            if (!lorryTripID) {
                // Create new LorryTrip
                const newTrip = await addLorryTrip(tripData);
                lorryTripID = newTrip.LorryTripID;
            } else {
                // Update existing LorryTrip
                await updateLorryTrip(lorryTripID, tripData);
            }
            // 2. Save TimeSlot
            let slotData = {
                Date: editingTimeSlot.Date,
                TimeWindowStart: editingTimeSlot.TimeWindowStart,
                TimeWindowEnd: editingTimeSlot.TimeWindowEnd,
                AvailableFlag: !!editingTimeSlot.AvailableFlag,
                LorryTripID: lorryTripID
            };
            if (addOrEdit === 'edit') {
                await updateTimeSlot(editingTimeSlot.TimeSlotID, slotData);
            } else {
                await addTimeSlot(slotData);
            }
            // 3. Refresh
            const slots = await getAllTimeSlots();
            setTimeSlots(slots);
            setEditingTimeSlot(null);
            setShowAddModal(false);
        } catch (e) {
            setModalError('Error saving: ' + e.message);
        }
        setModalLoading(false);
    };

    // --- Assign truck to lorry trip ---
    const handleAssignTruck = (truckId) => {
        setEditingTimeSlot(ts => ({
            ...ts,
            lorryTrip: { ...ts.lorryTrip, TruckID: truckId }
        }));
    };

    // --- Assign team to lorry trip ---
    const handleAssignTeam = (teamId) => {
        setEditingTimeSlot(ts => ({
            ...ts,
            lorryTrip: { ...ts.lorryTrip, DeliveryTeamID: teamId }
        }));
    };

    // --- Assign warehouse team to lorry trip ---
    const handleAssignWarehouseTeam = (teamId) => {
        setEditingTimeSlot(ts => ({
            ...ts,
            lorryTrip: { ...ts.lorryTrip, WarehouseTeamID: teamId }
        }));
    };

    // --- Calendar rendering helpers ---
    const getStatusColor = (available, orderCount) => {
        if (!available) return 'bg-gray-100 border-gray-300';
        if (orderCount === 0) return 'bg-green-50 border-green-200';
        return 'bg-blue-50 border-blue-200';
    };

    const toggleSlotExpansion = (slotId) => {
        setExpandedSlots(exp => {
            const newSet = new Set(exp);
            if (newSet.has(slotId)) newSet.delete(slotId);
            else newSet.add(slotId);
            return newSet;
        });
    };

    // --- Render ---
    const renderWeeklyView = () => {
        const weekDates = getCurrentWeekDates();
        return (
            <div className="grid grid-cols-7 gap-4">
                {weekDates.map((date, index) => (
                    <div key={index} className="min-h-96">
                        <div className="bg-gray-50 p-2 text-center font-medium mb-3 rounded">
                            <div className="text-sm text-gray-600">
                                {date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div className="text-lg">{date.getDate()}</div>
                        </div>
                        <div className="space-y-2">
                            {getTimeSlotsForDate(date).map(slot => {
                                const trip = getLorryTrip(slot.LorryTripID) || {};
                                const truck = getTruck(trip.TruckID) || {};
                                const deliveryTeam = getTeam(trip.DeliveryTeamID) || {};
                                const teamMembers = getEmployeesForTeam(deliveryTeam.TeamID) || [];
                                const slotOrders = getOrdersForSlot(slot.TimeSlotID).map(order => {
                                    const customer = customers.find(c => c.CustomerID === order.CustomerID) || {};
                                    const building = buildings.find(b => b.building_id === order.BuildingID || b.BuildingID === order.BuildingID) || {};
                                    const orderProductRows = orderProducts.filter(op => op.OrderID === order.OrderID);
                                    const products = orderProductRows.map(op => {
                                        const product = productsList.find(p => p.product_id === op.ProductID || p.ProductID === op.ProductID) || {};
                                        return {
                                            ...op,
                                            ProductName: product.ProductName,
                                            InstallerTeamRequiredFlag: product.InstallerTeamRequiredFlag,
                                            EstimatedInstallationTimeMin: product.EstimatedInstallationTimeMin,
                                            EstimatedInstallationTimeMax: product.EstimatedInstallationTimeMax
                                        };
                                    });
                                    return {
                                        ...order,
                                        CustomerName: customer.FullName,
                                        BuildingName: building.BuildingName,
                                        products
                                    };
                                });
                                return (
                                    <div
                                        key={slot.TimeSlotID}
                                        className={`p-2 rounded-lg border-2 cursor-pointer transition-all ${getStatusColor(slot.AvailableFlag, slotOrders.length)}`}
                                        onClick={() => toggleSlotExpansion(slot.TimeSlotID)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs font-medium">
                                                {slot.TimeWindowStart} - {slot.TimeWindowEnd}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={e => { e.stopPropagation(); handleEditTimeSlot(slot); }}
                                                    className="p-1 hover:bg-white rounded"
                                                >
                                                    <Edit size={12} />
                                                </button>
                                                <button
                                                    onClick={e => { e.stopPropagation(); handleDeleteTimeSlot(slot); }}
                                                    className="p-1 hover:bg-red-100 rounded"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                                {expandedSlots.has(slot.TimeSlotID)
                                                    ? <ChevronUp size={12} />
                                                    : <ChevronDown size={12} />}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            <div className="flex items-center gap-1">
                                                <Truck size={10} />
                                                {truck.CarPlate}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Package size={10} />
                                                {slotOrders.length} orders
                                            </div>
                                        </div>
                                        {expandedSlots.has(slot.TimeSlotID) && (
                                            <div className="mt-2 pt-2 border-t border-gray-200 text-xs space-y-1">
                                                <div><strong>Team:</strong> {deliveryTeam.TeamType}</div>
                                                <div><strong>Truck:</strong> {truck.Tone}T - {truck.CarPlate}</div>
                                                <div><strong>Team Members:</strong> {teamMembers.map(e => e.name).join(', ')}</div>
                                                {slotOrders.map(order => (
                                                    <div key={order.OrderID} className="bg-white p-2 rounded mt-1">
                                                        <div><strong>{order.CustomerName}</strong></div>
                                                        <div>{order.BuildingName}</div>
                                                        <div className="text-green-600">{order.OrderStatus}</div>
                                                        {order.products.map((product, idx) => (
                                                            <div key={idx} className="flex items-center gap-1 text-gray-600">
                                                                <Package size={8} />
                                                                {product.Quantity}x {product.ProductName}
                                                                {product.InstallerTeamRequiredFlag && (
                                                                    <span className="bg-orange-100 text-orange-600 px-1 rounded text-xs">
                                                                        Install
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // --- DAILY VIEW ---
    const renderDailyView = () => {
        const slots = getTimeSlotsForDate(selectedDate);
        return (
            <div>
                <div className="mb-4 text-center">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {selectedDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </h2>
                </div>
                <div className="space-y-4">
                    {slots.length === 0 && (
                        <div className="text-center text-gray-500 text-sm py-8">No time slots scheduled for this day</div>
                    )}
                    {slots.map(slot => {
                        const trip = getLorryTrip(slot.LorryTripID) || {};
                        const truck = getTruck(trip.TruckID) || {};
                        const deliveryTeam = getTeam(trip.DeliveryTeamID) || {};
                        const teamMembers = getEmployeesForTeam(deliveryTeam.TeamID) || [];
                        const slotOrders = getOrdersForSlot(slot.TimeSlotID).map(order => {
                            // Get customer & building info
                            const customer = customers.find(c => c.CustomerID === order.CustomerID) || {};
                            const building = buildings.find(b => b.building_id === order.BuildingID || b.BuildingID === order.BuildingID) || {};

                            // Join product details
                            const orderProductRows = orderProducts.filter(op => op.OrderID === order.OrderID);
                            const products = orderProductRows.map(op => {
                                const product = productsList.find(p => p.product_id === op.ProductID || p.ProductID === op.ProductID) || {};
                                return {
                                    ...op,
                                    ProductName: product.ProductName,
                                    InstallerTeamRequiredFlag: product.InstallerTeamRequiredFlag,
                                    EstimatedInstallationTimeMin: product.EstimatedInstallationTimeMin,
                                    EstimatedInstallationTimeMax: product.EstimatedInstallationTimeMax
                                };
                            });

                            return {
                                ...order,
                                CustomerName: customer.FullName,
                                BuildingName: building.BuildingName,
                                products
                            };
                        });
                        return (
                            <div
                                key={slot.TimeSlotID}
                                className={`p-6 rounded-lg border-2 ${getStatusColor(slot.AvailableFlag, slotOrders.length)}`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="text-lg font-semibold text-gray-800">
                                            {slot.TimeWindowStart} - {slot.TimeWindowEnd}
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${slot.AvailableFlag ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {slot.AvailableFlag ? 'Available' : 'Unavailable'}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEditTimeSlot(slot)}
                                            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                                        >
                                            <Edit size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTimeSlot(slot)}
                                            className="p-1 hover:bg-red-100 rounded"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <h3 className="font-medium text-sm flex items-center gap-2 text-gray-700">
                                            <Truck size={16} />
                                            Truck Details
                                        </h3>
                                        <div className="bg-white p-3 rounded-md border text-sm">
                                            <div><strong>Plate:</strong> {truck.CarPlate}</div>
                                            <div><strong>Capacity:</strong> {truck.Tone}T</div>
                                            <div><strong>Dimensions:</strong> {truck.LengthCM}×{truck.WidthCM}×{truck.HeightCM}cm</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-medium text-sm flex items-center gap-2 text-gray-700">
                                            <Users size={16} />
                                            Team Details
                                        </h3>
                                        <div className="bg-white p-3 rounded-md border text-sm">
                                            <div><strong>Team:</strong> {deliveryTeam.TeamType}</div>
                                            <div><strong>ID:</strong> {deliveryTeam.TeamID}</div>
                                            <div><strong>Members:</strong> {teamMembers.map(e => e.name).join(', ')}</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-medium text-sm flex items-center gap-2 text-gray-700">
                                            <Package size={16} />
                                            Orders ({slotOrders.length})
                                        </h3>
                                        <div className="bg-white p-3 rounded-md border max-h-32 overflow-y-auto text-sm">
                                            {slotOrders.length > 0 ? (
                                                slotOrders.map(order => (
                                                    <div key={order.OrderID} className="mb-2 last:mb-0 pb-2 last:pb-0 border-b last:border-b-0">
                                                        <div className="font-medium text-sm">{order.CustomerName}</div>
                                                        <div className="text-xs text-gray-600 flex items-center gap-1">
                                                            <MapPin size={10} />
                                                            {order.BuildingName}
                                                        </div>
                                                        <div className="text-xs text-green-600">{order.OrderStatus}</div>
                                                        <div className="mt-1 space-y-1">
                                                            {order.products.map((product, idx) => (
                                                                <div key={idx} className="text-xs flex items-center justify-between">
                                                                    <span>{product.Quantity}× {product.ProductName}</span>
                                                                    {product.InstallerTeamRequiredFlag && (
                                                                        <span className="bg-orange-100 text-orange-600 px-1 py-0.5 rounded text-xs">
                                                                            Install ({product.EstimatedInstallationTimeMin}-{product.EstimatedInstallationTimeMax}min)
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-gray-500 text-center text-xs">No orders assigned</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // --- MONTHLY VIEW ---
    const renderMonthlyView = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const monthDates = getMonthDates(year, month);
        // For calendar grid: get day of week of 1st, fill blanks
        const firstDay = new Date(year, month, 1).getDay();
        const weeks = [];
        let week = [];
        // Padding for start of month
        for (let i = 0; i < firstDay; i++) {
            week.push(null);
        }
        monthDates.forEach(date => {
            week.push(date);
            if (week.length === 7) {
                weeks.push(week);
                week = [];
            }
        });
        if (week.length > 0) {
            // pad end of month
            while (week.length < 7) week.push(null);
            weeks.push(week);
        }
        return (
            <div>
                <div className="mb-4 text-center font-medium text-lg">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <div className="grid grid-cols-7 gap-1 bg-gray-50 rounded-t">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-xs py-2 text-center">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {weeks.flat().map((date, idx) => {
                        if (!date) return <div key={idx} className="h-24 bg-gray-50" />;
                        const slots = getTimeSlotsForDate(date);
                        return (
                            <div key={idx} className="h-24 border bg-white relative group">
                                <div className="absolute top-1 left-1 text-xs text-gray-500">{date.getDate()}</div>
                                <div className="flex flex-col gap-1 mt-5">
                                    {slots.slice(0, 2).map(slot => (
                                        <div
                                            key={slot.TimeSlotID}
                                            className={`truncate px-1 py-0.5 rounded text-xs cursor-pointer ${slot.AvailableFlag ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}
                                            title={`${slot.TimeWindowStart}-${slot.TimeWindowEnd}`}
                                            onClick={() => { handleEditTimeSlot(slot); setShowAddModal(true); }}
                                        >
                                            {slot.TimeWindowStart}-{slot.TimeWindowEnd}
                                        </div>
                                    ))}
                                    {slots.length > 2 && (
                                        <div className="text-xs text-blue-600 cursor-pointer"
                                            onClick={() => {
                                                setSelectedDate(date);
                                                setViewMode("daily");
                                            }}
                                        >
                                            +{slots.length - 2} more
                                        </div>
                                    )}
                                </div>
                                <button
                                    className="absolute bottom-1 right-1 text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100"
                                    title="Add TimeSlot"
                                    onClick={e => { e.stopPropagation(); setSelectedDate(date); handleAddTimeSlot(); }}
                                >
                                    <Plus size={12} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // --- Modal for Add/Edit TimeSlot ---
    const renderTimeSlotModal = () => {
        if (!editingTimeSlot) return null;
        const trip = editingTimeSlot.lorryTrip || {};
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded-md shadow-sm w-full max-w-md">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            {addOrEdit === 'add' ? 'Add TimeSlot' : 'Edit TimeSlot'}
                        </h3>
                        <button
                            onClick={() => { setEditingTimeSlot(null); setShowAddModal(false); }}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    {modalError && <div className="text-red-600">{modalError}</div>}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                value={editingTimeSlot.Date}
                                onChange={(e) => setEditingTimeSlot(ts => ({ ...ts, Date: e.target.value }))}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    value={editingTimeSlot.TimeWindowStart}
                                    onChange={(e) => setEditingTimeSlot(ts => ({ ...ts, TimeWindowStart: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                <input
                                    type="time"
                                    value={editingTimeSlot.TimeWindowEnd}
                                    onChange={(e) => setEditingTimeSlot(ts => ({ ...ts, TimeWindowEnd: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Available</label>
                            <input
                                type="checkbox"
                                checked={!!editingTimeSlot.AvailableFlag}
                                onChange={e => setEditingTimeSlot(ts => ({ ...ts, AvailableFlag: e.target.checked }))}
                                className="mr-2"
                            />
                            <span className="text-sm font-medium text-gray-700">{editingTimeSlot.AvailableFlag ? 'Yes' : 'No'}</span>
                        </div>
                        {/* Lorry Trip assignment */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Truck</label>
                            <select
                                value={trip.TruckID || ''}
                                onChange={e => handleAssignTruck(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="">-- Select Truck --</option>
                                {trucks.map(truck => (
                                    <option key={truck.truck_id || truck.TruckID} value={truck.truck_id || truck.TruckID}>
                                        {truck.CarPlate} ({truck.Tone}T)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Delivery Team</label>
                            <select
                                value={trip.DeliveryTeamID || ''}
                                onChange={e => handleAssignTeam(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="">-- Select Team --</option>
                                {teams.map(team => (
                                    <option key={team.TeamID} value={team.TeamID}>{team.TeamType}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Warehouse Team</label>
                            <select
                                value={trip.WarehouseTeamID || ''}
                                onChange={e => handleAssignWarehouseTeam(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="">-- Select Team --</option>
                                {teams.map(team => (
                                    <option key={team.TeamID} value={team.TeamID}>{team.TeamType}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={handleSaveEdit}
                            disabled={modalLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                        >
                            <Save size={14} />
                            {modalLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            onClick={() => { setEditingTimeSlot(null); setShowAddModal(false); }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 max-w-7xl mx-auto bg-white">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <Calendar className="text-blue-600" size={20} />
                        TimeSlot Admin Calendar
                    </h1>
                    <button
                        onClick={handleAddTimeSlot}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                    >
                        <Plus size={14} />
                        Add TimeSlot
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {['daily', 'weekly', 'monthly'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-3 py-1 rounded capitalize text-sm ${viewMode === mode
                                    ? 'bg-white shadow text-blue-600 font-medium'
                                    : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                const newDate = new Date(selectedDate);
                                if (viewMode === 'daily') newDate.setDate(newDate.getDate() - 1);
                                else if (viewMode === 'weekly') newDate.setDate(newDate.getDate() - 7);
                                else if (viewMode === 'monthly') newDate.setMonth(newDate.getMonth() - 1);
                                setSelectedDate(newDate);
                            }}
                            className="px-3 py-1 border rounded-md hover:bg-gray-50 text-sm"
                        >
                            ←
                        </button>
                        <span className="px-3 py-1 font-medium text-sm">
                            {viewMode === 'daily'
                                ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                : viewMode === 'weekly'
                                    ? `Week of ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                    : selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                            }
                        </span>
                        <button
                            onClick={() => {
                                const newDate = new Date(selectedDate);
                                if (viewMode === 'daily') newDate.setDate(newDate.getDate() + 1);
                                else if (viewMode === 'weekly') newDate.setDate(newDate.getDate() + 7);
                                else if (viewMode === 'monthly') newDate.setMonth(newDate.getMonth() + 1);
                                setSelectedDate(newDate);
                            }}
                            className="px-3 py-1 border rounded-md hover:bg-gray-50 text-sm"
                        >
                            →
                        </button>
                    </div>
                </div>
            </div>
            <div className="mb-6">
                {viewMode === 'daily' && renderDailyView()}
                {viewMode === 'weekly' && renderWeeklyView()}
                {viewMode === 'monthly' && renderMonthlyView()}
            </div>
            {showAddModal && renderTimeSlotModal()}
        </div>
    );
}