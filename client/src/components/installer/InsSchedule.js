import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, Package, Wrench, AlertTriangle, CheckCircle, Phone, Mail } from 'lucide-react';

const InstallationSchedule = () => {
  const [selectedDate, setSelectedDate] = useState('2025-08-28');
  const [selectedTeam, setSelectedTeam] = useState('all');

  // Dummy data following your exact attribute structure
  const installationOrders = [
    {
      OrderID: 'ORD_00025',
      CustomerID: 'yM7cootDpZPe2mW1ang023bIZGB2',
      BuildingID: 'tYsjcUMtShV360EFuylO',
      ProductID: 'PRD_00006',
      TimeSlotID: 'TSL_00006',
      DeliveryTeamID: 'TEM_00005',
      EmployeeID: 'EMP_00018',
      OrderStatus: 'Scheduled',
      ScheduledStartDateTime: new Date('2025-08-28T09:00:00'),
      ScheduledEndDateTime: new Date('2025-08-28T10:30:00'),
      ActualStartDateTime: null,
      ActualEndDateTime: null,
      NumberOfAttempts: 0,
      CustomerRating: null,
      CustomerFeedback: null,
      ProofOfDeliveryURL: null,
      DelayReason: null,
      CreatedAt: new Date('2025-08-25T10:00:00'),
      UpdatedAt: new Date('2025-08-25T10:00:00')
    },
    {
      OrderID: 'ORD_00026',
      CustomerID: 'euEi7hwmGQM6LnajgTn62KQdfpv2',
      BuildingID: 'BLD_00008',
      ProductID: 'PRD_00006',
      TimeSlotID: 'TSL_00007',
      DeliveryTeamID: 'TEM_00005',
      EmployeeID: 'EMP_00018',
      OrderStatus: 'In Progress',
      ScheduledStartDateTime: new Date('2025-08-28T14:00:00'),
      ScheduledEndDateTime: new Date('2025-08-28T15:30:00'),
      ActualStartDateTime: new Date('2025-08-28T14:15:00'),
      ActualEndDateTime: null,
      NumberOfAttempts: 1,
      CustomerRating: null,
      CustomerFeedback: null,
      ProofOfDeliveryURL: null,
      DelayReason: 'Traffic jam',
      CreatedAt: new Date('2025-08-26T11:30:00'),
      UpdatedAt: new Date('2025-08-28T14:15:00')
    },
    {
      OrderID: 'ORD_00027',
      CustomerID: 'yM7cootDpZPe2mW1ang023bIZGB2',
      BuildingID: 'tYsjcUMtShV360EFuylO',
      ProductID: 'PRD_00006',
      TimeSlotID: 'TSL_00008',
      DeliveryTeamID: 'TEM_00006',
      EmployeeID: 'EMP_00020',
      OrderStatus: 'Completed',
      ScheduledStartDateTime: new Date('2025-08-27T16:00:00'),
      ScheduledEndDateTime: new Date('2025-08-27T17:30:00'),
      ActualStartDateTime: new Date('2025-08-27T16:05:00'),
      ActualEndDateTime: new Date('2025-08-27T17:20:00'),
      NumberOfAttempts: 1,
      CustomerRating: 4.8,
      CustomerFeedback: 'Great installation service!',
      ProofOfDeliveryURL: 'https://dummy.pod/ORD_00027.jpg',
      DelayReason: null,
      CreatedAt: new Date('2025-08-24T09:00:00'),
      UpdatedAt: new Date('2025-08-27T17:20:00')
    }
  ];

  const customers = {
    'yM7cootDpZPe2mW1ang023bIZGB2': {
      CustomerID: 'yM7cootDpZPe2mW1ang023bIZGB2',
      name: 'Howard Wong',
      email: 'wongwenhao19@gmail.com',
      phone: '0138505210',
      address: 'Tiara Damansara Jalan 17/1',
      city: 'Petaling Jaya',
      postcode: '50600',
      state: 'Kuala Lumpur',
      notificationsEnabled: true
    },
    'euEi7hwmGQM6LnajgTn62KQdfpv2': {
      CustomerID: 'euEi7hwmGQM6LnajgTn62KQdfpv2',
      name: 'Jia Hui Chew',
      email: 'chewjh0707@gmail.com',
      phone: '+60123456789',
      address: 'OUG Parklane Condominium',
      city: 'Kuala Lumpur',
      postcode: '54069',
      state: 'Kuala Lumpur',
      notificationsEnabled: true
    }
  };

  const buildings = {
    'tYsjcUMtShV360EFuylO': {
      BuildingID: 'tYsjcUMtShV360EFuylO',
      BuildingName: 'Tiara Damansara',
      HousingType: 'condominium',
      PostalCode: '50600',
      ZoneID: 'ZON_00006',
      LoadingBayAvailable: false,
      LiftAvailable: false,
      StairsAvailable: true,
      NarrowDoorways: true,
      AccessTimeWindowStart: '10:00',
      AccessTimeWindowEnd: '17:00',
      PreRegistrationRequired: true,
      ParkingDistance: '100',
      VehicleLengthLimit: '6.0',
      VehicleWidthLimit: '3.0',
      SpecialEquipmentNeeded: ['Trolley with rubber wheels', 'Hard hat & shoes'],
      Notes: ''
    },
    'BLD_00008': {
      BuildingID: 'BLD_00008',
      BuildingName: 'OUG Parklane',
      HousingType: 'Condominium',
      PostalCode: '54069',
      ZoneID: 'ZON_00009',
      LoadingBayAvailable: true,
      LiftAvailable: true,
      AccessTimeWindowStart: '09:00',
      AccessTimeWindowEnd: '17:00',
      PreRegistrationRequired: true,
      VehicleSizeLimit: '1T',
      SpecialEquipmentNeeded: '',
      Notes: ''
    }
  };

  const products = {
    'PRD_00006': {
      ProductID: 'PRD_00006',
      ProductName: 'DAIKIN Air Conditioner',
      PackageLengthCM: 115,
      PackageWidthCM: 83,
      PackageHeightCM: 43,
      EstimatedInstallationTimeMin: 60,
      EstimatedInstallationTimeMax: 90,
      InstallerTeamRequiredFlag: true,
      DismantleRequiredFlag: false,
      DismantleExtraTime: 10,
      NoLieDownFlag: false,
      FragileFlag: false
    }
  };

  const employees = {
    'EMP_00018': {
      EmployeeID: 'EMP_00018',
      name: 'Terry Chong',
      email: 'tbmstaff@tbm.com',
      contact_number: '0125478965',
      role: 'delivery team',
      active_flag: true
    },
    'EMP_00020': {
      EmployeeID: 'EMP_00020',
      name: 'Ahmad Rahman',
      email: 'ahmad@tbm.com',
      contact_number: '0126547891',
      role: 'installation team',
      active_flag: true
    }
  };

  const teams = {
    'TEM_00005': {
      TeamID: 'TEM_00005',
      TeamType: 'Installation Team A'
    },
    'TEM_00006': {
      TeamID: 'TEM_00006',
      TeamType: 'Installation Team B'
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'In Progress':
        return <Clock className="w-4 h-4" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'Cancelled':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const filteredOrders = installationOrders.filter(order => {
    const orderDate = order.ScheduledStartDateTime.toDateString();
    const filterDate = new Date(selectedDate).toDateString();
    const teamMatch = selectedTeam === 'all' || order.DeliveryTeamID === selectedTeam;
    return orderDate === filterDate && teamMatch;
  });

  const formatTime = (dateTime) => {
    return dateTime ? dateTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    }) : 'Not started';
  };

  const formatDate = (dateTime) => {
    return dateTime ? dateTime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : '';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Installation Schedule</h1>
              <p className="text-gray-600 mt-1">Manage and track installation appointments</p>
            </div>
            <div className="flex items-center space-x-4">
              <Wrench className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Teams</option>
                <option value="TEM_00005">Installation Team A</option>
                <option value="TEM_00006">Installation Team B</option>
              </select>
            </div>
          </div>
        </div>

        {/* Schedule Cards */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No installations scheduled</h3>
              <p className="text-gray-600">There are no installations scheduled for the selected date and team.</p>
            </div>
          ) : (
            filteredOrders.map(order => {
              const customer = customers[order.CustomerID];
              const building = buildings[order.BuildingID];
              const product = products[order.ProductID];
              const employee = employees[order.EmployeeID];
              const team = teams[order.DeliveryTeamID];

              return (
                <div key={order.OrderID} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-semibold text-gray-900">{order.OrderID}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getStatusColor(order.OrderStatus)}`}>
                        {getStatusIcon(order.OrderStatus)}
                        <span>{order.OrderStatus}</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Attempt #{order.NumberOfAttempts || 1}</p>
                      {order.CustomerRating && (
                        <div className="flex items-center justify-end mt-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm font-medium ml-1">{order.CustomerRating}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Time Information */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-blue-600" />
                          Schedule
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Scheduled</p>
                            <p className="font-medium">{formatTime(order.ScheduledStartDateTime)} - {formatTime(order.ScheduledEndDateTime)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Actual</p>
                            <p className="font-medium">
                              {order.ActualStartDateTime ? formatTime(order.ActualStartDateTime) : 'Not started'} - 
                              {order.ActualEndDateTime ? formatTime(order.ActualEndDateTime) : 'Ongoing'}
                            </p>
                          </div>
                        </div>
                        {order.DelayReason && (
                          <div className="mt-3 p-2 bg-yellow-100 rounded text-sm">
                            <span className="font-medium text-yellow-800">Delay Reason: </span>
                            <span className="text-yellow-700">{order.DelayReason}</span>
                          </div>
                        )}
                      </div>

                      {/* Customer Information */}
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <User className="w-4 h-4 mr-2 text-blue-600" />
                          Customer
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p className="font-medium">{customer?.name}</p>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{customer?.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span>{customer?.email}</span>
                          </div>
                        </div>
                      </div>

                      {/* Team & Employee */}
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <User className="w-4 h-4 mr-2 text-blue-600" />
                          Assignment
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Team: </span>
                            <span className="font-medium">{team?.TeamType}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Technician: </span>
                            <span className="font-medium">{employee?.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Contact: </span>
                            <span>{employee?.contact_number}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Product Information */}
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Package className="w-4 h-4 mr-2 text-blue-600" />
                          Product
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p className="font-medium text-blue-600">{product?.ProductName}</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-gray-600">Dimensions: </span>
                              <span>{product?.PackageLengthCM} × {product?.PackageWidthCM} × {product?.PackageHeightCM} cm</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Install Time: </span>
                              <span>{product?.EstimatedInstallationTimeMin}-{product?.EstimatedInstallationTimeMax} min</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            {product?.InstallerTeamRequiredFlag && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Installer Required</span>
                            )}
                            {product?.FragileFlag && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Fragile</span>
                            )}
                            {product?.NoLieDownFlag && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Keep Upright</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Location Information */}
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                          Location
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p className="font-medium">{building?.BuildingName}</p>
                          <p>{customer?.address}</p>
                          <p>{customer?.city}, {customer?.state} {building?.PostalCode}</p>
                          
                          <div className="mt-3 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Access Hours:</span>
                              <span>{building?.AccessTimeWindowStart} - {building?.AccessTimeWindowEnd}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Loading Bay:</span>
                              <span className={building?.LoadingBayAvailable ? 'text-green-600' : 'text-red-600'}>
                                {building?.LoadingBayAvailable ? 'Available' : 'Not Available'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Lift Access:</span>
                              <span className={building?.LiftAvailable ? 'text-green-600' : 'text-red-600'}>
                                {building?.LiftAvailable ? 'Available' : 'Not Available'}
                              </span>
                            </div>
                          </div>
                          
                          {building?.SpecialEquipmentNeeded && building.SpecialEquipmentNeeded.length > 0 && (
                            <div className="mt-3 p-2 bg-yellow-50 rounded">
                              <p className="font-medium text-yellow-800 mb-1">Special Equipment Required:</p>
                              <div className="flex flex-wrap gap-1">
                                {building.SpecialEquipmentNeeded.map((equipment, index) => (
                                  <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                                    {equipment}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {building?.NarrowDoorways && (
                            <div className="mt-2 p-2 bg-orange-50 rounded">
                              <p className="text-orange-700 text-xs font-medium">⚠️ Narrow doorways - Take precaution</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Feedback */}
                      {order.CustomerFeedback && (
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Customer Feedback</h4>
                          <p className="text-sm text-gray-600 italic">"{order.CustomerFeedback}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallationSchedule;