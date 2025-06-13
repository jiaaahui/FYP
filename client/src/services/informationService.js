import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc, addDoc } from "firebase/firestore";

// -------- Employee --------
export async function getAllEmployees() {
  const querySnapshot = await getDocs(collection(db, "Employee"));
  const docs = [];
  querySnapshot.forEach((docSnap) => {
    docs.push({ id: docSnap.id, ...docSnap.data() });
  });
  return docs;
}

async function getNextEmployeeID() {
  const querySnapshot = await getDocs(collection(db, "Employee"));
  let maxNumber = 0;
  querySnapshot.forEach(docSnap => {
    const eid = docSnap.data().EmployeeID;
    if (eid && /^EMP_\d{5}$/.test(eid)) {
      const num = parseInt(eid.substring(4), 10);
      if (num > maxNumber) maxNumber = num;
    }
  });
  const nextNum = maxNumber + 1;
  return `EMP_${nextNum.toString().padStart(5, "0")}`;
}

// Add new employee: document ID == EmployeeID
export async function addEmployee(data) {
  const EmployeeID = await getNextEmployeeID();
  const newData = { ...data, EmployeeID };
  const docRef = doc(db, "Employee", EmployeeID); // <- set doc ID!
  await setDoc(docRef, newData);
  return { id: EmployeeID, ...newData };
}

// Update employee (id, data)
export async function updateEmployee(id, data) {
  const docRef = doc(db, "Employee", id);
  await updateDoc(docRef, data);
}

// Delete employee (id)
export async function deleteEmployee(id) {
  await deleteDoc(doc(db, "Employee", id));
}

// -------- Truck --------

export async function getAllTrucks() {
  const querySnapshot = await getDocs(collection(db, "Truck"));
  return querySnapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
}

export async function getNextTruckID() {
  const querySnapshot = await getDocs(collection(db, "Truck"));
  let maxNumber = 0;
  querySnapshot.forEach(docSnap => {
    const tid = docSnap.data().truck_id;
    if (tid && /^TRK_\d{5}$/.test(tid)) {
      const num = parseInt(tid.substring(4), 10);
      if (num > maxNumber) maxNumber = num;
    }
  });
  const nextNum = maxNumber + 1;
  return `TRK_${nextNum.toString().padStart(5, "0")}`;
}

export async function addTruck(data) {
  const truck_id = await getNextTruckID();
  const newData = { ...data, truck_id };
  const docRef = doc(db, "Truck", truck_id);
  await setDoc(docRef, newData);
  return { id: truck_id, ...newData };
}

export async function updateTruck(id, data) {
  const docRef = doc(db, "Truck", id);
  await updateDoc(docRef, data);
}

export async function deleteTruck(id) {
  const docRef = doc(db, "Truck", id);
  await deleteDoc(docRef);
}

// -------- Zone --------

export async function getAllZones() {
  const querySnapshot = await getDocs(collection(db, "Zone"));
  return querySnapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
}

export async function getNextZoneID() {
  const querySnapshot = await getDocs(collection(db, "Zone"));
  let maxNumber = 0;
  querySnapshot.forEach(docSnap => {
    const zid = docSnap.data().zone_id;
    if (zid && /^ZON_\d{5}$/.test(zid)) {
      const num = parseInt(zid.substring(4), 10);
      if (num > maxNumber) maxNumber = num;
    }
  });
  const nextNum = maxNumber + 1;
  return `ZON_${nextNum.toString().padStart(5, "0")}`;
}

export async function addZone(data) {
  const zone_id = await getNextZoneID();
  const newData = { ...data, zone_id };
  const docRef = doc(db, "Zone", zone_id);
  await setDoc(docRef, newData);
  return { id: zone_id, ...newData };
}

export async function updateZone(id, data) {
  const docRef = doc(db, "Zone", id);
  await updateDoc(docRef, data);
}

export async function deleteZone(id) {
  const docRef = doc(db, "Zone", id);
  await deleteDoc(docRef);
}

// -------- TruckZoneAssignment --------

export async function getAllTruckZone() {
  const querySnapshot = await getDocs(collection(db, "TruckZone"));
  return querySnapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
}

// Add a new truck-zone assignment (auto-generated document ID)
export async function addTruckZone(data) {
  const docRef = await addDoc(collection(db, "TruckZone"), data);
  return { id: docRef.id, ...data };
}

// Update an existing truck-zone assignment
export async function updateTruckZone(id, data) {
  const docRef = doc(db, "TruckZone", id);
  await updateDoc(docRef, data);
}

// Delete a truck-zone assignment
export async function deleteTruckZone(id) {
  const docRef = doc(db, "TruckZone", id);
  await deleteDoc(docRef);
}


// -------- Building --------

export async function getAllBuildings() {
  const querySnapshot = await getDocs(collection(db, "Building"));
  return querySnapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
}

export async function getNextBuildingID() {
  const querySnapshot = await getDocs(collection(db, "Building"));
  let maxNumber = 0;
  querySnapshot.forEach(docSnap => {
    const bid = docSnap.data().building_id;
    if (bid && /^BLD_\d{5}$/.test(bid)) {
      const num = parseInt(bid.substring(4), 10);
      if (num > maxNumber) maxNumber = num;
    }
  });
  const nextNum = maxNumber + 1;
  return `BLD_${nextNum.toString().padStart(5, "0")}`;
}

export async function addBuilding(data) {
  const building_id = await getNextBuildingID();
  const newData = { ...data, building_id };
  const docRef = doc(db, "Building", building_id);
  await setDoc(docRef, newData);
  return { id: building_id, ...newData };
}

export async function updateBuilding(id, data) {
  const docRef = doc(db, "Building", id);
  await updateDoc(docRef, data);
}

export async function deleteBuilding(id) {
  const docRef = doc(db, "Building", id);
  await deleteDoc(docRef);
}

// -------- Product --------

export async function getAllProducts() {
  const querySnapshot = await getDocs(collection(db, "Product"));
  return querySnapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
}

export async function getNextProductID() {
  const querySnapshot = await getDocs(collection(db, "Product"));
  let maxNumber = 0;
  querySnapshot.forEach(docSnap => {
    const pid = docSnap.data().product_id;
    if (pid && /^PRD_\d{5}$/.test(pid)) {
      const num = parseInt(pid.substring(4), 10);
      if (num > maxNumber) maxNumber = num;
    }
  });
  const nextNum = maxNumber + 1;
  return `PRD_${nextNum.toString().padStart(5, "0")}`;
}

export async function addProduct(data) {
  const product_id = await getNextProductID();
  const newData = { ...data, product_id };
  const docRef = doc(db, "Product", product_id);
  await setDoc(docRef, newData);
  return { id: product_id, ...newData };
}

export async function updateProduct(id, data) {
  const docRef = doc(db, "Product", id);
  await updateDoc(docRef, data);
}

export async function deleteProduct(id) {
  const docRef = doc(db, "Product", id);
  await deleteDoc(docRef);
}

