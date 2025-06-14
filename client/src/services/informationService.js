  import { db } from "../firebase";
  import {
    collection, getDocs, doc, updateDoc, deleteDoc, setDoc, addDoc, query, where
  } from "firebase/firestore";

  // ========== GENERIC HELPERS ==========

  async function getAllDocs(collectionName) {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
  }

  /**
   * Get next sequential ID for collections using custom IDs.
   * @param {string} collectionName Firestore collection name
   * @param {string} idField Field name in the data (e.g. EmployeeID)
   * @param {string} prefix Prefix for the ID (e.g. EMP_)
   */
  async function getNextCustomID(collectionName, idField, prefix) {
    const querySnapshot = await getDocs(collection(db, collectionName));
    let maxNumber = 0;
    querySnapshot.forEach(docSnap => {
      const customId = docSnap.data()[idField];
      if (customId && new RegExp(`^${prefix}\\d{5}$`).test(customId)) {
        const num = parseInt(customId.substring(prefix.length), 10);
        if (num > maxNumber) maxNumber = num;
      }
    });
    const nextNum = maxNumber + 1;
    return `${prefix}${nextNum.toString().padStart(5, "0")}`;
  }

  /**
   * Add document, with custom or random ID.
   * @param {string} collectionName
   * @param {object} data
   * @param {object} [custom] - { idField, prefix }
   */
  async function addDocGeneric(collectionName, data, custom) {
    if (custom && custom.idField && custom.prefix) {
      const customId = await getNextCustomID(collectionName, custom.idField, custom.prefix);
      const newData = { ...data, [custom.idField]: customId };
      const docRef = doc(db, collectionName, customId);
      await setDoc(docRef, newData);
      return { id: customId, ...newData };
    } else {
      const docRef = await addDoc(collection(db, collectionName), data);
      return { id: docRef.id, ...data };
    }
  }

  /**
   * Update document by ID.
   */
  async function updateDocGeneric(collectionName, id, data) {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
  }

  /**
   * Delete document by ID.
   */
  async function deleteDocGeneric(collectionName, id) {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  }

  // ========== COLLECTION-SPECIFIC EXPORTS ==========

  // -- Employee (custom ID: EmployeeID) --
  export const getAllEmployees = () => getAllDocs("Employee");
  export const addEmployee = (data) => addDocGeneric("Employee", data, { idField: "EmployeeID", prefix: "EMP_" });
  export const updateEmployee = (id, data) => updateDocGeneric("Employee", id, data);
  export const deleteEmployee = (id) => deleteDocGeneric("Employee", id);

  // -- Truck (custom ID: truck_id) --
  export const getAllTrucks = () => getAllDocs("Truck");
  export const addTruck = (data) => addDocGeneric("Truck", data, { idField: "truck_id", prefix: "TRK_" });
  export const updateTruck = (id, data) => updateDocGeneric("Truck", id, data);
  export const deleteTruck = (id) => deleteDocGeneric("Truck", id);

  // -- Zone (custom ID: zone_id) --
  export const getAllZones = () => getAllDocs("Zone");
  export const addZone = (data) => addDocGeneric("Zone", data, { idField: "zone_id", prefix: "ZON_" });
  export const updateZone = (id, data) => updateDocGeneric("Zone", id, data);
  export const deleteZone = (id) => deleteDocGeneric("Zone", id);

  // -- TruckZone (random ID) --
  export const getAllTruckZone = () => getAllDocs("TruckZone");
  export const addTruckZone = (data) => addDocGeneric("TruckZone", data);
  export const updateTruckZone = (id, data) => updateDocGeneric("TruckZone", id, data);
  export const deleteTruckZone = (id) => deleteDocGeneric("TruckZone", id);

  // -- Building (custom ID: building_id) --
  export const getAllBuildings = () => getAllDocs("Building");
  export const addBuilding = (data) => addDocGeneric("Building", data, { idField: "building_id", prefix: "BLD_" });
  export const updateBuilding = (id, data) => updateDocGeneric("Building", id, data);
  export const deleteBuilding = (id) => deleteDocGeneric("Building", id);

  // -- Product (custom ID: product_id) --
  export const getAllProducts = () => getAllDocs("Product");
  export const addProduct = (data) => addDocGeneric("Product", data, { idField: "product_id", prefix: "PRD_" });
  export const updateProduct = (id, data) => updateDocGeneric("Product", id, data);
  export const deleteProduct = (id) => deleteDocGeneric("Product", id);

  // -- Team (custom ID: TeamID) --
  export const getAllTeams = () => getAllDocs("Team");
  export const addTeam = (data) => addDocGeneric("Team", data, { idField: "TeamID", prefix: "TEM_" });
  export const updateTeam = (id, data) => updateDocGeneric("Team", id, data);
  export const deleteTeam = (id) => deleteDocGeneric("Team", id);

  // -- EmployeeTeamAssignment (random ID, standard CRUD) --
  export const getAllEmployeeTeamAssignments = () => getAllDocs("EmployeeTeamAssignment");
  export const deleteEmployeeTeamAssignment = (id) => deleteDocGeneric("EmployeeTeamAssignment", id);

  export async function assignOrUpdateEmployeeTeam(employeeId, teamId) {
    const assignmentsRef = collection(db, "EmployeeTeamAssignment");
    const q = query(assignmentsRef, where("EmployeeID", "==", employeeId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Update the first found
      const docId = querySnapshot.docs[0].id;
      await updateDocGeneric("EmployeeTeamAssignment", docId, { TeamID: teamId });
      return { id: docId, EmployeeID: employeeId, TeamID: teamId };
    } else {
      // Add new
      const result = await addDocGeneric("EmployeeTeamAssignment", { EmployeeID: employeeId, TeamID: teamId });
      return result;
    }
  }

  // -- Report (random ID) --
  export const getAllReports = () => getAllDocs("Report");
  export const addReport = (data) => addDocGeneric("Report", data);
  export const updateReport = (id, data) => updateDocGeneric("Report", id, data);
  export const deleteReport = (id) => deleteDocGeneric("Report", id);

  // -- Customer (custom ID: CustomerID) --
  export const getAllCustomers = () => getAllDocs("Customer");
  export const addCustomer = (data) => addDocGeneric("Customer", data, { idField: "CustomerID", prefix: "CUS_" });
  export const updateCustomer = (id, data) => updateDocGeneric("Customer", id, data);
  export const deleteCustomer = (id) => deleteDocGeneric("Customer", id);

  // -- Order (custom ID: OrderID) --
  export const getAllOrders = () => getAllDocs("Order");
  export const addOrder = (data) => addDocGeneric("Order", data, { idField: "OrderID", prefix: "ORD_" });
  export const updateOrder = (id, data) => updateDocGeneric("Order", id, data);
  export const deleteOrder = (id) => deleteDocGeneric("Order", id);

  // -- OrderProduct (random ID) --
  export const getAllOrderProducts = () => getAllDocs("OrderProduct");
  export const addOrderProduct = (data) => addDocGeneric("OrderProduct", data);
  export const updateOrderProduct = (id, data) => updateDocGeneric("OrderProduct", id, data);
  export const deleteOrderProduct = (id) => deleteDocGeneric("OrderProduct", id);

  // -- TimeSlot (custom ID: TimeSlotID) --
  export const getAllTimeSlots = () => getAllDocs("TimeSlot");
  export const addTimeSlot = (data) => addDocGeneric("TimeSlot", data, { idField: "TimeSlotID", prefix: "TSL_" });
  export const updateTimeSlot = (id, data) => updateDocGeneric("TimeSlot", id, data);
  export const deleteTimeSlot = (id) => deleteDocGeneric("TimeSlot", id);

  // -- LorryTrip (custom ID: LorryTripID) --
  export const getAllLorryTrips = () => getAllDocs("LorryTrip");
  export const addLorryTrip = (data) => addDocGeneric("LorryTrip", data, { idField: "LorryTripID", prefix: "TRP_" });
  export const updateLorryTrip = (id, data) => updateDocGeneric("LorryTrip", id, data);
  export const deleteLorryTrip = (id) => deleteDocGeneric("LorryTrip", id);

  // ========== COMMON HELPERS ==========

  // Get employee objects for a team (by TeamID)
  export async function getEmployeesForTeam(teamId) {
    const assignmentsCol = collection(db, 'EmployeeTeamAssignment');
    const q = query(assignmentsCol, where('TeamID', '==', teamId));
    const assignmentsSnap = await getDocs(q);
    const employeeIds = assignmentsSnap.docs.map(doc => doc.data().EmployeeID);
    if (employeeIds.length === 0) return [];
    const employeesCol = collection(db, 'Employee');
    const employeesSnap = await getDocs(employeesCol);
    return employeesSnap.docs
      .map(doc => doc.data())
      .filter(emp => employeeIds.includes(emp.EmployeeID));
  }
