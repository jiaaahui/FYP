import React, { useState, useMemo } from 'react';
import { Truck, Package, Clock, Users, MapPin, AlertTriangle, CheckCircle, RotateCcw, Maximize, Info, Calendar, User } from 'lucide-react';

const WarehouseLoadingSchedule = () => {
  const [selectedDate, setSelectedDate] = useState('2025-08-28');
  const [selectedTruck, setSelectedTruck] = useState('all');
  const [viewMode, setViewMode] = useState('schedule'); // 'schedule' or 'optimization'

  // Dummy data following exact attribute structure
  const trucks = {
    'TRK_00019': {
      TruckID: 'TRK_00019',
      CarPlate: 'XWD4558',
      LengthCM: 443,
      WidthCM: 250,
      HeightCM: 210,
      Tone: 3
    },
    'TRK_00020': {
      TruckID: 'TRK_00020',
      CarPlate: 'FAC6652',
      LengthCM: 443,
      WidthCM: 250,
      HeightCM: 210,
      Tone: 3
    },
    'TRK_00021': {
      TruckID: 'TRK_00021',
      CarPlate: 'ABC1234',
      LengthCM: 600,
      WidthCM: 250,
      HeightCM: 250,
      Tone: 5
    }
  };

  const lorryTrips = [
    {
      LorryTripID: 'TRP_00010',
      TruckID: 'TRK_00019',
      DeliveryTeamID: 'TEM_00005',
      WarehouseTeamID: 'TEM_00006',
      Date: '2025-08-28',
      LoadingStartTime: '07:00',
      LoadingEndTime: '09:00',
      DepartureTime: '09:30',
      Status: 'Scheduled'
    },
    {
      LorryTripID: 'TRP_00011',
      TruckID: 'TRK_00020',
      DeliveryTeamID: 'TEM_00005',
      WarehouseTeamID: 'TEM_00007',
      Date: '2025-08-28',
      LoadingStartTime: '08:00',
      LoadingEndTime: '10:00',
      DepartureTime: '10:30',
      Status: 'Loading'
    },
    {
      LorryTripID: 'TRP_00012',
      TruckID: 'TRK_00021',
      DeliveryTeamID: 'TEM_00008',
      WarehouseTeamID: 'TEM_00006',
      Date: '2025-08-28',
      LoadingStartTime: '06:30',
      LoadingEndTime: '08:30',
      DepartureTime: '09:00',
      Status: 'Completed'
    }
  ];

  const orders = [
    {
      OrderID: 'ORD_00030',
      CustomerID: 'CUS_00010',
      BuildingID: 'BLD_00008',
      TimeSlotID: 'TSL_00010',
      DeliveryTeamID: 'TEM_00005',
      LorryTripID: 'TRP_00010',
      OrderStatus: 'Ready for Loading',
      ScheduledStartDateTime: new Date('2025-08-28T09:00:00'),
      ScheduledEndDateTime: new Date('2025-08-28T10:30:00'),
      Priority: 1,
      LoadingSequence: 1,
      CreatedAt: new Date('2025-08-25T10:00:00')
    },
    {
      OrderID: 'ORD_00031',
      CustomerID: 'CUS_00011',
      BuildingID: 'BLD_00009',
      TimeSlotID: 'TSL_00011',
      DeliveryTeamID: 'TEM_00005',
      LorryTripID: 'TRP_00010',
      OrderStatus: 'Ready for Loading',
      ScheduledStartDateTime: new Date('2025-08-28T14:00:00'),
      ScheduledEndDateTime: new Date('2025-08-28T15:30:00'),
      Priority: 2,
      LoadingSequence: 2,
      CreatedAt: new Date('2025-08-26T11:30:00')
    },
    {
      OrderID: 'ORD_00032',
      CustomerID: 'CUS_00012',
      BuildingID: 'BLD_00010',
      TimeSlotID: 'TSL_00012',
      DeliveryTeamID: 'TEM_00005',
      LorryTripID: 'TRP_00011',
      OrderStatus: 'Loading in Progress',
      ScheduledStartDateTime: new Date('2025-08-28T11:00:00'),
      ScheduledEndDateTime: new Date('2025-08-28T12:30:00'),
      Priority: 1,
      LoadingSequence: 1,
      CreatedAt: new Date('2025-08-27T09:00:00')
    },
    {
      OrderID: 'ORD_00033',
      CustomerID: 'CUS_00013',
      BuildingID: 'BLD_00011',
      TimeSlotID: 'TSL_00013',
      DeliveryTeamID: 'TEM_00008',
      LorryTripID: 'TRP_00012',
      OrderStatus: 'Loaded',
      ScheduledStartDateTime: new Date('2025-08-28T10:00:00'),
      ScheduledEndDateTime: new Date('2025-08-28T11:30:00'),
      Priority: 1,
      LoadingSequence: 1,
      CreatedAt: new Date('2025-08-24T14:00:00')
    }
  ];

  const orderProducts = [
    {
      OrderID: 'ORD_00030',
      ProductID: 'PRD_00005',
      Quantity: 1,
      LoadingPosition: 'A1',
      IsLoaded: false
    },
    {
      OrderID: 'ORD_00030',
      ProductID: 'PRD_00006',
      Quantity: 1,
      LoadingPosition: 'A2',
      IsLoaded: false
    },
    {
      OrderID: 'ORD_00031',
      ProductID: 'PRD_00007',
      Quantity: 2,
      LoadingPosition: 'B1',
      IsLoaded: false
    },
    {
      OrderID: 'ORD_00032',
      ProductID: 'PRD_00005',
      Quantity: 1,
      LoadingPosition: 'A1',
      IsLoaded: true
    },
    {
      OrderID: 'ORD_00033',
      ProductID: 'PRD_00006',
      Quantity: 1,
      LoadingPosition: 'A1',
      IsLoaded: true
    }
  ];

  const products = {
    'PRD_00005': {
      ProductID: 'PRD_00005',
      ProductName: 'Panasonic Dryer A700',
      PackageLengthCM: 107,
      PackageWidthCM: 88,
      PackageHeightCM: 53,
      WeightKG: 45,
      FragileFlag: false,
      NoLieDownFlag: false,
      StackableFlag: true,
      MaxStackHeight: 2
    },
    'PRD_00006': {
      ProductID: 'PRD_00006',
      ProductName: 'DAIKIN Air Conditioner',
      PackageLengthCM: 115,
      PackageWidthCM: 83,
      PackageHeightCM: 43,
      WeightKG: 32,
      FragileFlag: true,
      NoLieDownFlag: true,
      StackableFlag: false,
      MaxStackHeight: 1
    },
    'PRD_00007': {
      ProductID: 'PRD_00007',
      ProductName: 'Samsung Refrigerator',
      PackageLengthCM: 180,
      PackageWidthCM: 70,
      PackageHeightCM: 65,
      WeightKG: 85,
      FragileFlag: false,
      NoLieDownFlag: true,
      StackableFlag: false,
      MaxStackHeight: 1
    },
    'PRD_00008': {
      ProductID: 'PRD_00008',
      ProductName: 'LG Washing Machine',
      PackageLengthCM: 95,
      PackageWidthCM: 60,
      PackageHeightCM: 85,
      WeightKG: 70,
      FragileFlag: false,
      NoLieDownFlag: true,
      StackableFlag: false,
      MaxStackHeight: 1
    }
  };

  const customers = {
    'CUS_00010': { name: 'Alice Tan', address: 'Mont Kiara' },
    'CUS_00011': { name: 'Bob Lee', address: 'KLCC' },
    'CUS_00012': { name: 'Carol Wong', address: 'Bangsar' },
    'CUS_00013': { name: 'David Lim', address: 'Petaling Jaya' }
  };

  const teams = {
    'TEM_00005': { TeamType: 'Delivery Team A' },
    'TEM_00006': { TeamType: 'Warehouse Team A' },
    'TEM_00007': { TeamType: 'Warehouse Team B' },
    'TEM_00008': { TeamType: 'Delivery Team B' }
  };

  // Calculate truck utilization and optimization
  const calculateTruckOptimization = (lorryTripId) => {
    const trip = lorryTrips.find(t => t.LorryTripID === lorryTripId);
    const truck = trucks[trip.TruckID];
    const tripOrders = orders.filter(o => o.LorryTripID === lorryTripId);
    
    let totalVolume = 0;
    let totalWeight = 0;
    let items = [];

    tripOrders.forEach(order => {
      const orderItems = orderProducts.filter(op => op.OrderID === order.OrderID);
      orderItems.forEach(item => {
        const product = products[item.ProductID];
        const volume = (product.PackageLengthCM * product.PackageWidthCM * product.PackageHeightCM) / 1000000; // Convert to cubic meters
        const weight = product.WeightKG * item.Quantity;
        
        totalVolume += volume * item.Quantity;
        totalWeight += weight;
        
        for (let i = 0; i < item.Quantity; i++) {
          items.push({
            ...item,
            ...product,
            orderInfo: order,
            customerInfo: customers[order.CustomerID]
          });
        }
      });
    });

    const truckVolume = (truck.LengthCM * truck.WidthCM * truck.HeightCM) / 1000000;
    const truckWeight = truck.Tone * 1000; // Convert to kg

    const volumeUtilization = (totalVolume / truckVolume) * 100;
    const weightUtilization = (totalWeight / truckWeight) * 100;

    return {
      truck,
      trip,
      items,
      totalVolume: totalVolume.toFixed(2),
      totalWeight,
      truckVolume: truckVolume.toFixed(2),
      truckWeight,
      volumeUtilization: volumeUtilization.toFixed(1),
      weightUtilization: weightUtilization.toFixed(1),
      maxUtilization: Math.max(volumeUtilization, weightUtilization).toFixed(1)
    };
  };

  // Optimize loading sequence
  const optimizeLoading = (items) => {
    // Sort by delivery time first (FIFO), then by fragility, then by size
    return items.sort((a, b) => {
      // First by delivery time
      if (a.orderInfo.ScheduledStartDateTime !== b.orderInfo.ScheduledStartDateTime) {
        return new Date(a.orderInfo.ScheduledStartDateTime) - new Date(b.orderInfo.ScheduledStartDateTime);
      }
      // Then by fragility (fragile items on top)
      if (a.FragileFlag !== b.FragileFlag) {
        return b.FragileFlag - a.FragileFlag;
      }
      // Then by NoLieDownFlag (items that can't lie down loaded last)
      if (a.NoLieDownFlag !== b.NoLieDownFlag) {
        return a.NoLieDownFlag - b.NoLieDownFlag;
      }
      // Finally by volume (larger items first)
      const aVolume = a.PackageLengthCM * a.PackageWidthCM * a.PackageHeightCM;
      const bVolume = b.PackageLengthCM * b.PackageWidthCM * b.PackageHeightCM;
      return bVolume - aVolume;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Loading':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Ready for Loading':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Loading in Progress':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Loaded':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'Loading':
        return <RotateCcw className="w-4 h-4" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'Ready for Loading':
        return <Package className="w-4 h-4" />;
      case 'Loading in Progress':
        return <RotateCcw className="w-4 h-4" />;
      case 'Loaded':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const filteredTrips = lorryTrips.filter(trip => {
    const dateMatch = trip.Date === selectedDate;
    const truckMatch = selectedTruck === 'all' || trip.TruckID === selectedTruck;
    return dateMatch && truckMatch;
  });

  const optimizationData = useMemo(() => {
    return filteredTrips.map(trip => calculateTruckOptimization(trip.LorryTripID));
  }, [filteredTrips]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Warehouse Loading Schedule</h1>
              <p className="text-gray-600 mt-1">Optimize truck loading and manage warehouse operations</p>
            </div>
            <div className="flex items-center space-x-4">
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filters and View Toggle */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Truck</label>
              <select
                value={selectedTruck}
                onChange={(e) => setSelectedTruck(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Trucks</option>
                {Object.values(trucks).map(truck => (
                  <option key={truck.TruckID} value={truck.TruckID}>
                    {truck.CarPlate} - {truck.Tone}T
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('schedule')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    viewMode === 'schedule'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Schedule View
                </button>
                <button
                  onClick={() => setViewMode('optimization')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    viewMode === 'optimization'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Optimization View
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'schedule' ? (
          /* Schedule View */
          <div className="space-y-6">
            {filteredTrips.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trips scheduled</h3>
                <p className="text-gray-600">There are no loading trips scheduled for the selected date and truck.</p>
              </div>
            ) : (
              filteredTrips.map(trip => {
                const truck = trucks[trip.TruckID];
                const tripOrders = orders.filter(o => o.LorryTripID === trip.LorryTripID);
                const warehouseTeam = teams[trip.WarehouseTeamID];
                const deliveryTeam = teams[trip.DeliveryTeamID];

                return (
                  <div key={trip.LorryTripID} className="bg-white rounded-lg shadow-sm p-6">
                    {/* Trip Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Truck className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{truck.CarPlate}</h3>
                          <p className="text-gray-600">Trip ID: {trip.LorryTripID}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getStatusColor(trip.Status)}`}>
                        {getStatusIcon(trip.Status)}
                        <span>{trip.Status}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Truck Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Truck className="w-4 h-4 mr-2 text-blue-600" />
                          Truck Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Capacity:</span>
                            <span className="font-medium">{truck.Tone}T</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Dimensions:</span>
                            <span className="font-medium">{truck.LengthCM}×{truck.WidthCM}×{truck.HeightCM} cm</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Volume:</span>
                            <span className="font-medium">{((truck.LengthCM * truck.WidthCM * truck.HeightCM) / 1000000).toFixed(1)} m³</span>
                          </div>
                        </div>
                      </div>

                      {/* Schedule Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-blue-600" />
                          Schedule
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Loading:</span>
                            <span className="font-medium">{trip.LoadingStartTime} - {trip.LoadingEndTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Departure:</span>
                            <span className="font-medium">{trip.DepartureTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* Team Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Users className="w-4 h-4 mr-2 text-blue-600" />
                          Teams
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Warehouse: </span>
                            <span className="font-medium">{warehouseTeam?.TeamType}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Delivery: </span>
                            <span className="font-medium">{deliveryTeam?.TeamType}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Orders */}
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-4">Orders ({tripOrders.length})</h4>
                      <div className="space-y-3">
                        {tripOrders.map(order => {
                          const orderItems = orderProducts.filter(op => op.OrderID === order.OrderID);
                          const customer = customers[order.CustomerID];
                          
                          return (
                            <div key={order.OrderID} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <span className="font-medium text-blue-600">{order.OrderID}</span>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.OrderStatus)}`}>
                                    {order.OrderStatus}
                                  </span>
                                  <span className="text-sm text-gray-600">Priority {order.Priority}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  Seq: {order.LoadingSequence} | {customer?.name} - {customer?.address}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                                {orderItems.map((item, index) => {
                                  const product = products[item.ProductID];
                                  return (
                                    <div key={index} className="bg-gray-50 rounded p-3">
                                      <div className="font-medium text-gray-900 mb-1">{product?.ProductName}</div>
                                      <div className="text-gray-600">
                                        <div>Qty: {item.Quantity}</div>
                                        <div>Pos: {item.LoadingPosition}</div>
                                        <div className="flex items-center space-x-2 mt-1">
                                          {product?.FragileFlag && (
                                            <span className="px-1 py-0.5 bg-red-100 text-red-700 rounded text-xs">Fragile</span>
                                          )}
                                          {product?.NoLieDownFlag && (
                                            <span className="px-1 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">Upright</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Optimization View */
          <div className="space-y-6">
            {optimizationData.map(data => {
              const optimizedItems = optimizeLoading([...data.items]);
              
              return (
                <div key={data.trip.LorryTripID} className="bg-white rounded-lg shadow-sm p-6">
                  {/* Optimization Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <Maximize className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{data.truck.CarPlate} - Optimization</h3>
                        <p className="text-gray-600">Trip ID: {data.trip.LorryTripID}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{data.maxUtilization}%</div>
                      <div className="text-sm text-gray-600">Max Utilization</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Utilization Stats */}
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-4">Utilization Analysis</h4>
                        
                        {/* Volume Utilization */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Volume</span>
                            <span className="text-sm font-medium text-gray-900">{data.volumeUtilization}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(data.volumeUtilization, 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {data.totalVolume} / {data.truckVolume} m³
                          </div>
                        </div>

                        {/* Weight Utilization */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Weight</span>
                            <span className="text-sm font-medium text-gray-900">{data.weightUtilization}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(data.weightUtilization, 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {data.totalWeight} / {data.truckWeight} kg
                          </div>
                        </div>
                      </div>

                      {/* Loading Tips */}
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />
                          Loading Guidelines
                        </h4>
                        <div className="space-y-2 text-sm text-gray-700">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>Load fragile items on top and secure properly</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span>Keep upright items in designated positions</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Load in reverse delivery order (LIFO)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Distribute weight evenly across truck bed</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Optimized Loading Sequence */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Optimized Loading Sequence</h4>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {optimizedItems.map((item, index) => {
                          const volume = ((item.PackageLengthCM * item.PackageWidthCM * item.PackageHeightCM) / 1000000).toFixed(3);
                          const deliveryTime = new Date(item.orderInfo.ScheduledStartDateTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          });
                          
                          return (
                            <div key={index} className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                  </div>
                                  <span className="font-medium text-gray-900">{item.ProductName}</span>
                                </div>
                                <div className="text-xs text-gray-600">
                                  Delivery: {deliveryTime}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                                <div>
                                  <div>Order: {item.OrderID}</div>
                                  <div>Customer: {item.customerInfo?.name}</div>
                                  <div>Position: {item.LoadingPosition || 'Auto-assign'}</div>
                                </div>
                                <div>
                                  <div>Size: {item.PackageLengthCM}×{item.PackageWidthCM}×{item.PackageHeightCM}cm</div>
                                  <div>Weight: {item.WeightKG}kg | Volume: {volume}m³</div>
                                  <div className="flex space-x-1 mt-1">
                                    {item.FragileFlag && (
                                      <span className="px-1 py-0.5 bg-red-100 text-red-600 rounded text-xs">Fragile</span>
                                    )}
                                    {item.NoLieDownFlag && (
                                      <span className="px-1 py-0.5 bg-yellow-100 text-yellow-600 rounded text-xs">Upright</span>
                                    )}
                                    {item.StackableFlag && (
                                      <span className="px-1 py-0.5 bg-green-100 text-green-600 rounded text-xs">Stackable</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Visual Loading Layout */}
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Truck Loading Layout</h4>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="relative">
                        {/* Truck Outline */}
                        <div 
                          className="border-2 border-gray-400 rounded-lg bg-white relative"
                          style={{ 
                            width: '100%', 
                            height: '200px'
                          }}
                        >
                          {/* Truck Cab */}
                          <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 w-6 h-16 bg-blue-600 rounded-l-lg"></div>
                          
                          {/* Loading Areas */}
                          <div className="grid grid-cols-4 gap-2 h-full p-2">
                            {optimizedItems.slice(0, 8).map((item, index) => {
                              const priorityColor = item.orderInfo.Priority === 1 ? 'bg-red-200 border-red-400' : 
                                                   item.orderInfo.Priority === 2 ? 'bg-yellow-200 border-yellow-400' : 
                                                   'bg-blue-200 border-blue-400';
                              
                              return (
                                <div
                                  key={index}
                                  className={`rounded border-2 ${priorityColor} p-1 flex flex-col justify-center items-center text-xs text-center relative`}
                                  title={`${item.ProductName} - ${item.customerInfo?.name}`}
                                >
                                  <div className="font-medium truncate w-full">{item.ProductName.split(' ')[0]}</div>
                                  <div className="text-xs text-gray-600">{item.WeightKG}kg</div>
                                  {item.FragileFlag && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">!</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Legend */}
                          <div className="absolute -bottom-12 left-0 right-0 flex justify-center space-x-4 text-xs">
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 bg-red-200 border border-red-400 rounded"></div>
                              <span>Priority 1</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 bg-yellow-200 border border-yellow-400 rounded"></div>
                              <span>Priority 2</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 bg-blue-200 border border-blue-400 rounded"></div>
                              <span>Priority 3+</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span>Fragile</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {optimizedItems.length > 8 && (
                        <div className="mt-4 text-center text-sm text-gray-600">
                          + {optimizedItems.length - 8} more items (use multiple levels or optimize further)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex justify-end space-x-3">
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                      Export Layout
                    </button>
                    <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium">
                      Re-optimize
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                      Confirm Loading Plan
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Statistics */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredTrips.length}</div>
              <div className="text-sm text-gray-600">Total Trips</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredTrips.filter(t => t.Status === 'Completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => filteredTrips.some(t => t.LorryTripID === o.LorryTripID)).length}
              </div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {optimizationData.reduce((acc, data) => acc + parseFloat(data.maxUtilization), 0) / optimizationData.length || 0}%
              </div>
              <div className="text-sm text-gray-600">Avg Utilization</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseLoadingSchedule;