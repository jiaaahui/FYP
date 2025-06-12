import { db } from '../firebase';
import { 
  collection, doc, setDoc, updateDoc, 
  deleteDoc, query, where, getDocs
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export function useInformationService() {
  const { currentUser } = useAuth();

  // Zones Management - Collection: 'zones'
  const getZones = async () => {
    try {
      const zonesRef = collection(db, 'Zone');
      const snapshot = await getDocs(zonesRef);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ZoneID: doc.data().ZoneID,
        ZoneName: doc.data().ZoneName
      }));
    } catch (error) {
      console.error('Error getting zones:', error);
      throw error;
    }
  };

  const createZone = async (zoneData) => {
    try {
      const zoneRef = doc(db, 'zones', zoneData.ZoneID);
      await setDoc(zoneRef, {
        ZoneID: zoneData.ZoneID,
        ZoneName: zoneData.ZoneName,
        createdBy: currentUser.uid,
        createdAt: new Date()
      });
      return zoneData.ZoneID;
    } catch (error) {
      console.error('Error creating zone:', error);
      throw error;
    }
  };

  const updateZone = async (zoneId, zoneData) => {
    try {
      const zoneRef = doc(db, 'zones', zoneId);
      await updateDoc(zoneRef, {
        ZoneID: zoneData.ZoneID,
        ZoneName: zoneData.ZoneName,
        updatedBy: currentUser.uid,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating zone:', error);
      throw error;
    }
  };

  const deleteZone = async (zoneId) => {
    try {
      const zoneRef = doc(db, 'zones', zoneId);
      await deleteDoc(zoneRef);
    } catch (error) {
      console.error('Error deleting zone:', error);
      throw error;
    }
  };

  // Trucks Management - Collection: 'trucks'
  const getTrucks = async () => {
    try {
      const trucksRef = collection(db, 'trucks');
      const snapshot = await getDocs(trucksRef);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        TruckID: doc.data().TruckID,
        TruckName: doc.data().TruckName,
        Volume: doc.data().Volume
      }));
    } catch (error) {
      console.error('Error getting trucks:', error);
      throw error;
    }
  };

  const createTruck = async (truckData) => {
    try {
      const truckRef = doc(db, 'trucks', truckData.TruckID);
      await setDoc(truckRef, {
        TruckID: truckData.TruckID,
        TruckName: truckData.TruckName,
        Volume: truckData.Volume,
        createdBy: currentUser.uid,
        createdAt: new Date()
      });
      return truckData.TruckID;
    } catch (error) {
      console.error('Error creating truck:', error);
      throw error;
    }
  };

  const updateTruck = async (truckId, truckData) => {
    try {
      const truckRef = doc(db, 'trucks', truckId);
      await updateDoc(truckRef, {
        TruckID: truckData.TruckID,
        TruckName: truckData.TruckName,
        Volume: truckData.Volume,
        updatedBy: currentUser.uid,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating truck:', error);
      throw error;
    }
  };

  const deleteTruck = async (truckId) => {
    try {
      const truckRef = doc(db, 'trucks', truckId);
      await deleteDoc(truckRef);
    } catch (error) {
      console.error('Error deleting truck:', error);
      throw error;
    }
  };

  // Truck Zone Assignments - Collection: 'truckZones'
  const getTruckZones = async () => {
    try {
      const truckZonesRef = collection(db, 'truckZones');
      const snapshot = await getDocs(truckZonesRef);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        TruckID: doc.data().TruckID,
        ZoneID: doc.data().ZoneID,
        IsPrimaryZone: doc.data().IsPrimaryZone
      }));
    } catch (error) {
      console.error('Error getting truck zones:', error);
      throw error;
    }
  };

  const updateTruckZoneAssignments = async (truckId, assignments) => {
    try {
      // Delete existing assignments for this truck
      const truckZonesRef = collection(db, 'truckZones');
      const q = query(truckZonesRef, where('TruckID', '==', truckId));
      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Create new assignments
      const createPromises = assignments.map(assignment => {
        const assignmentRef = doc(collection(db, 'truckZones'));
        return setDoc(assignmentRef, {
          TruckID: assignment.TruckID,
          ZoneID: assignment.ZoneID,
          IsPrimaryZone: assignment.IsPrimaryZone,
          updatedBy: currentUser.uid,
          updatedAt: new Date()
        });
      });

      await Promise.all(createPromises);
    } catch (error) {
      console.error('Error updating truck zone assignments:', error);
      throw error;
    }
  };

  // Buildings Management - Collection: 'buildings'
  const getBuildings = async () => {
    try {
      const buildingsRef = collection(db, 'buildings');
      const snapshot = await getDocs(buildingsRef);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        BuildingID: doc.data().BuildingID,
        BuildingName: doc.data().BuildingName,
        HousingType: doc.data().HousingType,
        PostalCode: doc.data().PostalCode,
        ZoneID: doc.data().ZoneID,
        AccessTimeWindowStart: doc.data().AccessTimeWindowStart,
        AccessTimeWindowEnd: doc.data().AccessTimeWindowEnd,
        LiftAvailable: doc.data().LiftAvailable,
        LoadingBayAvailable: doc.data().LoadingBayAvailable,
        PreRegistrationRequired: doc.data().PreRegistrationRequired,
        VehicleSizeLimit: doc.data().VehicleSizeLimit,
        SpecialEquipmentNeeded: doc.data().SpecialEquipmentNeeded,
        Notes: doc.data().Notes
      }));
    } catch (error) {
      console.error('Error getting buildings:', error);
      throw error;
    }
  };

  const createBuilding = async (buildingData) => {
    try {
      const buildingRef = doc(db, 'buildings', buildingData.BuildingID);
      await setDoc(buildingRef, {
        ...buildingData,
        createdBy: currentUser.uid,
        createdAt: new Date()
      });
      return buildingData.BuildingID;
    } catch (error) {
      console.error('Error creating building:', error);
      throw error;
    }
  };

  const updateBuilding = async (buildingId, buildingData) => {
    try {
      const buildingRef = doc(db, 'buildings', buildingId);
      await updateDoc(buildingRef, {
        ...buildingData,
        updatedBy: currentUser.uid,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating building:', error);
      throw error;
    }
  };

  const deleteBuilding = async (buildingId) => {
    try {
      const buildingRef = doc(db, 'buildings', buildingId);
      await deleteDoc(buildingRef);
    } catch (error) {
      console.error('Error deleting building:', error);
      throw error;
    }
  };

  // Products Management - Collection: 'products'
  const getProducts = async () => {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ProductID: doc.data().ProductID,
        ProductName: doc.data().ProductName,
        Category: doc.data().Category,
        PackageLengthCM: doc.data().PackageLengthCM,
        PackageWidthCM: doc.data().PackageWidthCM,
        PackageHeightCM: doc.data().PackageHeightCM,
        EstimatedInstallationTimeMin: doc.data().EstimatedInstallationTimeMin,
        EstimatedInstallationTimeMax: doc.data().EstimatedInstallationTimeMax,
        InstallationTypeName: doc.data().InstallationTypeName,
        InstallerTeamRequiredFlag: doc.data().InstallerTeamRequiredFlag,
        FragileFlag: doc.data().FragileFlag,
        NoLieDownFlag: doc.data().NoLieDownFlag,
        DismantleRequiredFlag: doc.data().DismantleRequiredFlag,
        DismantleExtraTime: doc.data().DismantleExtraTime
      }));
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  };

  const createProduct = async (productData) => {
    try {
      const productRef = doc(db, 'products', productData.ProductID);
      await setDoc(productRef, {
        ...productData,
        createdBy: currentUser.uid,
        createdAt: new Date()
      });
      return productData.ProductID;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        ...productData,
        updatedBy: currentUser.uid,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const productRef = doc(db, 'products', productId);
      await deleteDoc(productRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  // Employees Management - Collection: 'employees'
  const getEmployees = async () => {
    try {
      const employeesRef = collection(db, 'employees');
      const snapshot = await getDocs(employeesRef);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        EmployeeID: doc.data().EmployeeID,
        name: doc.data().name,
        role: doc.data().role,
        contact_number: doc.data().contact_number,
        active_flag: doc.data().active_flag
      }));
    } catch (error) {
      console.error('Error getting employees:', error);
      throw error;
    }
  };

  const createEmployee = async (employeeData) => {
    try {
      const employeeRef = doc(db, 'employees', employeeData.EmployeeID);
      await setDoc(employeeRef, {
        EmployeeID: employeeData.EmployeeID,
        name: employeeData.name,
        role: employeeData.role,
        contact_number: employeeData.contact_number,
        active_flag: employeeData.active_flag,
        createdBy: currentUser.uid,
        createdAt: new Date()
      });
      return employeeData.EmployeeID;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  };

  const updateEmployee = async (employeeId, employeeData) => {
    try {
      const employeeRef = doc(db, 'employees', employeeId);
      await updateDoc(employeeRef, {
        EmployeeID: employeeData.EmployeeID,
        name: employeeData.name,
        role: employeeData.role,
        contact_number: employeeData.contact_number,
        active_flag: employeeData.active_flag,
        updatedBy: currentUser.uid,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  };

  const deleteEmployee = async (employeeId) => {
    try {
      const employeeRef = doc(db, 'employees', employeeId);
      await deleteDoc(employeeRef);
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  };

  // Teams Management - Collection: 'teams'
  const getTeams = async () => {
    try {
      const teamsRef = collection(db, 'teams');
      const snapshot = await getDocs(teamsRef);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        TeamID: doc.data().TeamID,
        TeamType: doc.data().TeamType
      }));
    } catch (error) {
      console.error('Error getting teams:', error);
      throw error;
    }
  };

  // Employee Team Assignments - Collection: 'employeeTeamAssignments'
  const getEmployeeTeamAssignments = async () => {
    try {
      const assignmentsRef = collection(db, 'employeeTeamAssignments');
      const snapshot = await getDocs(assignmentsRef);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        EmployeeID: doc.data().EmployeeID,
        TeamID: doc.data().TeamID
      }));
    } catch (error) {
      console.error('Error getting employee team assignments:', error);
      throw error;
    }
  };

  const updateEmployeeTeamAssignment = async (employeeId, teamId) => {
    try {
      // Delete existing assignment for this employee
      const assignmentsRef = collection(db, 'employeeTeamAssignments');
      const q = query(assignmentsRef, where('EmployeeID', '==', employeeId));
      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Create new assignment if teamId is provided
      if (teamId) {
        const assignmentRef = doc(collection(db, 'employeeTeamAssignments'));
        await setDoc(assignmentRef, {
          EmployeeID: employeeId,
          TeamID: teamId,
          updatedBy: currentUser.uid,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating employee team assignment:', error);
      throw error;
    }
  };

  // Customers Management - Collection: 'customers'
  const getCustomers = async () => {
    try {
      const customersRef = collection(db, 'customers');
      const snapshot = await getDocs(customersRef);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        CustomerID: doc.data().CustomerID,
        FullName: doc.data().FullName,
        Email: doc.data().Email,
        PhoneNumber: doc.data().PhoneNumber,
        Address: doc.data().Address
      }));
    } catch (error) {
      console.error('Error getting customers:', error);
      throw error;
    }
  };

  // Orders Management - Collection: 'orders'
  const getOrders = async () => {
    try {
      const ordersRef = collection(db, 'orders');
      const snapshot = await getDocs(ordersRef);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        OrderID: doc.data().OrderID,
        CustomerID: doc.data().CustomerID,
        BuildingID: doc.data().BuildingID,
        Address: doc.data().Address,
        OrderStatus: doc.data().OrderStatus,
        CustomerResponse: doc.data().CustomerResponse,
        PreferredDateTimeStart: doc.data().PreferredDateTimeStart,
        PreferredDateTimeEnd: doc.data().PreferredDateTimeEnd,
        TimeSlotID: doc.data().TimeSlotID,
        SpecialInstructions: doc.data().SpecialInstructions,
        DeliveryNotes: doc.data().DeliveryNotes,
        Priority: doc.data().Priority
      }));
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  };

  const createOrder = async (orderData) => {
    try {
      const orderRef = doc(db, 'orders', orderData.OrderID);
      await setDoc(orderRef, {
        ...orderData,
        createdBy: currentUser.uid,
        createdAt: new Date()
      });

      // Create order products
      if (orderData.orderProducts && orderData.orderProducts.length > 0) {
        const orderProductPromises = orderData.orderProducts.map(product => {
          const orderProductRef = doc(collection(db, 'orderProducts'));
          return setDoc(orderProductRef, {
            OrderID: orderData.OrderID,
            ProductID: product.ProductID,
            Quantity: product.Quantity,
            createdBy: currentUser.uid,
            createdAt: new Date()
          });
        });
        await Promise.all(orderProductPromises);
      }

      return orderData.OrderID;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const updateOrder = async (orderId, orderData) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        ...orderData,
        updatedBy: currentUser.uid,
        updatedAt: new Date()
      });

      // Update order products
      if (orderData.orderProducts) {
        // Delete existing order products
        const orderProductsRef = collection(db, 'orderProducts');
        const q = query(orderProductsRef, where('OrderID', '==', orderId));
        const snapshot = await getDocs(q);
        
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        // Create new order products
        const createPromises = orderData.orderProducts.map(product => {
          const orderProductRef = doc(collection(db, 'orderProducts'));
          return setDoc(orderProductRef, {
            OrderID: orderId,
            ProductID: product.ProductID,
            Quantity: product.Quantity,
            updatedBy: currentUser.uid,
            updatedAt: new Date()
          });
        });
        await Promise.all(createPromises);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      // Delete order products first
      const orderProductsRef = collection(db, 'orderProducts');
      const q = query(orderProductsRef, where('OrderID', '==', orderId));
      const snapshot = await getDocs(q);
      
      const deleteProductPromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteProductPromises);

      // Delete the order
      const orderRef = doc(db, 'orders', orderId);
      await deleteDoc(orderRef);
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  };

  // Order Products - Collection: 'orderProducts'
  const getOrderProducts = async () => {
    try {
      const orderProductsRef = collection(db, 'orderProducts');
      const snapshot = await getDocs(orderProductsRef);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        OrderID: doc.data().OrderID,
        ProductID: doc.data().ProductID,
        Quantity: doc.data().Quantity
      }));
    } catch (error) {
      console.error('Error getting order products:', error);
      throw error;
    }
  };

  // Time Slots - Collection: 'timeSlots'
  const getTimeSlots = async () => {
    try {
      const timeSlotsRef = collection(db, 'timeSlots');
      const snapshot = await getDocs(timeSlotsRef);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        TimeSlotID: doc.data().TimeSlotID,
        Date: doc.data().Date,
        TimeWindowStart: doc.data().TimeWindowStart,
        TimeWindowEnd: doc.data().TimeWindowEnd,
        LorryTripID: doc.data().LorryTripID,
        AvailableFlag: doc.data().AvailableFlag
      }));
    } catch (error) {
      console.error('Error getting time slots:', error);
      throw error;
    }
  };

  // Lorry Trips - Collection: 'lorryTrips'
  const getLorryTrips = async () => {
    try {
      const lorryTripsRef = collection(db, 'lorryTrips');
      const snapshot = await getDocs(lorryTripsRef);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        LorryTripID: doc.data().LorryTripID,
        TruckID: doc.data().TruckID,
        DeliveryTeamID: doc.data().DeliveryTeamID,
        WarehouseTeamID: doc.data().WarehouseTeamID
      }));
    } catch (error) {
      console.error('Error getting lorry trips:', error);
      throw error;
    }
  };

  // Reports Management - Collection: 'reports'
  const getReports = async () => {
    try {
      const reportsRef = collection(db, 'reports');
      const snapshot = await getDocs(reportsRef);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ReportID: doc.data().ReportID,
        EmployeeID: doc.data().EmployeeID,
        OrderID: doc.data().OrderID,
        ReportType: doc.data().ReportType,
        Priority: doc.data().Priority,
        Title: doc.data().Title,
        Content: doc.data().Content,
        Status: doc.data().Status,
        ReportedDate: doc.data().ReportedDate,
        ResolvedDate: doc.data().ResolvedDate,
        Resolution: doc.data().Resolution,
        createdAt: doc.data().createdAt || new Date()
      }));
    } catch (error) {
      console.error('Error getting reports:', error);
      throw error;
    }
  };

  const createReport = async (reportData) => {
    try {
      const reportRef = doc(db, 'reports', reportData.ReportID);
      await setDoc(reportRef, {
        ReportID: reportData.ReportID,
        EmployeeID: reportData.EmployeeID,
        OrderID: reportData.OrderID || '',
        ReportType: reportData.ReportType,
        Priority: reportData.Priority,
        Title: reportData.Title,
        Content: reportData.Content,
        Status: reportData.Status,
        ReportedDate: reportData.ReportedDate,
        ResolvedDate: reportData.ResolvedDate,
        Resolution: reportData.Resolution || '',
        createdBy: currentUser.uid,
        createdAt: new Date()
      });
      return reportData.ReportID;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  };

  const updateReport = async (reportId, reportData) => {
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        ReportID: reportData.ReportID,
        EmployeeID: reportData.EmployeeID,
        OrderID: reportData.OrderID || '',
        ReportType: reportData.ReportType,
        Priority: reportData.Priority,
        Title: reportData.Title,
        Content: reportData.Content,
        Status: reportData.Status,
        ReportedDate: reportData.ReportedDate,
        ResolvedDate: reportData.ResolvedDate,
        Resolution: reportData.Resolution || '',
        updatedBy: currentUser.uid,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  };

  const deleteReport = async (reportId) => {
    try {
      const reportRef = doc(db, 'reports', reportId);
      await deleteDoc(reportRef);
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  };

  return {
    // Zones
    getZones,
    createZone,
    updateZone,
    deleteZone,

    // Trucks
    getTrucks,
    createTruck,
    updateTruck,
    deleteTruck,
    getTruckZones,
    updateTruckZoneAssignments,

    // Buildings
    getBuildings,
    createBuilding,
    updateBuilding,
    deleteBuilding,

    // Products
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,

    // Employees
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,

    // Teams
    getTeams,
    getEmployeeTeamAssignments,
    updateEmployeeTeamAssignment,

    // Customers
    getCustomers,

    // Orders
    getOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrderProducts,

    // Time Slots & Lorry Trips
    getTimeSlots,
    getLorryTrips,

    // Reports
    getReports,
    createReport,
    updateReport,
    deleteReport
  };
}