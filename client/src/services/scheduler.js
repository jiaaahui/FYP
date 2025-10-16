// ===== Dummy Data (simulate Firestore) =====

// Order collection
const orders = [
  {
    OrderID: "O001",
    BuildingID: "B001",
    Status: "Pending",
    ScheduledTimeSlot: null
  },
  {
    OrderID: "O002",
    BuildingID: "B002",
    Status: "Pending",
    ScheduledTimeSlot: null
  },
  {
    OrderID: "O003",
    BuildingID: "B001",
    Status: "Scheduled", // already scheduled
    ScheduledTimeSlot: "T001"
  }
];

// Product collection
const products = {
  P001: { ProductID: "P001", EstimatedInstallationTimeMin: 30, EstimatedInstallationTimeMax: 45 },
  P002: { ProductID: "P002", EstimatedInstallationTimeMin: 60, EstimatedInstallationTimeMax: 90 }
};

// OrderProduct collection
const orderProducts = [
  { OrderID: "O001", ProductID: "P001", Quantity: 2 },
  { OrderID: "O001", ProductID: "P002", Quantity: 1 },
  { OrderID: "O002", ProductID: "P002", Quantity: 3 }
];

// Building collection
const buildings = {
  B001: { BuildingID: "B001", AccessTimeWindowStart: "09:00", AccessTimeWindowEnd: "17:00" },
  B002: { BuildingID: "B002", AccessTimeWindowStart: "10:00", AccessTimeWindowEnd: "18:00" }
};

// Truck collection
const trucks = [
  { TruckID: "TRK001", Zone: "North", VolumeCapacity: 100 },
  { TruckID: "TRK002", Zone: "South", VolumeCapacity: 80 }
];

// TimeSlot collection
const timeSlots = [
  { TimeSlotID: "T001", TimeWindowStart: "09:00", TimeWindowEnd: "12:00" },
  { TimeSlotID: "T002", TimeWindowStart: "13:00", TimeWindowEnd: "16:00" },
  { TimeSlotID: "T003", TimeWindowStart: "16:00", TimeWindowEnd: "18:00" }
];

// ===== Scheduling Functions =====

// Calculate installation time
function calculateTotalInstallationTime(orderId) {
  const ops = orderProducts.filter(op => op.OrderID === orderId);
  let totalMin = 0, totalMax = 0;

  for (const op of ops) {
    const prod = products[op.ProductID];
    if (prod) {
      totalMin += prod.EstimatedInstallationTimeMin * op.Quantity;
      totalMax += prod.EstimatedInstallationTimeMax * op.Quantity;
    }
  }
  return { min: totalMin, max: totalMax };
}

// Schedule order
function scheduleOrder(order) {
  const building = buildings[order.BuildingID];
  const installTime = calculateTotalInstallationTime(order.OrderID);

  // filter valid slots
  const validSlots = timeSlots.filter(ts =>
    building.AccessTimeWindowStart <= ts.TimeWindowStart &&
    ts.TimeWindowEnd <= building.AccessTimeWindowEnd
  );

  if (validSlots.length === 0) {
    console.log(`❌ No valid slot for order ${order.OrderID}`);
    return null;
  }

  // pick earliest available slot
  const bestSlot = validSlots.sort((a, b) =>
    a.TimeWindowStart.localeCompare(b.TimeWindowStart))[0];

  // pick first truck (naive)
  const assignedTruck = trucks[0].TruckID;

  // update order (simulate Firestore update)
  order.ScheduledTimeSlot = bestSlot.TimeSlotID;
  order.Status = "Scheduled";
  order.AssignedTruck = assignedTruck;
  order.EstimatedInstallTimeMin = installTime.min;
  order.EstimatedInstallTimeMax = installTime.max;

  console.log(`✅ Scheduled ${order.OrderID} at slot ${bestSlot.TimeSlotID} with truck ${assignedTruck}`);
  return order;
}

// ===== Main Auto-Scheduler =====

function autoScheduler() {
  console.log("🚚 Auto Scheduler running at 12:00 AM...");

  for (const order of orders) {
    if (order.Status === "Pending" && !order.ScheduledTimeSlot) {
      scheduleOrder(order);
    }
  }

  console.log("\n=== Final Orders ===");
  console.log(JSON.stringify(orders, null, 2));
}

// Export for use elsewhere
export { orders, products, orderProducts, buildings, trucks, timeSlots, autoScheduler };