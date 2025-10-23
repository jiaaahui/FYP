import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import {
  getAllOrders,
  getOrderProductsByOrderId,
  getProductById,
  getBuildingById,
  getAllTimeSlots,
  addTimeSlot,
  updateOrder
} from "../services/informationService";

dayjs.extend(weekday);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// ORS API Configuration
const ORS_API_KEY = process.env.REACT_APP_ORS_API_KEY || "YOUR_ORS_API_KEY";
const ORS_BASE_URL = "https://api.openrouteservice.org/v2";

// Depot/warehouse coordinates (replace with your actual depot location)
const DEPOT_LOCATION = {
  latitude: 3.1390,  // Example: Petaling Jaya
  longitude: 101.6869
};

// Helper to calculate travel time and distance between two points using ORS
async function calculateTravelTime(fromLat, fromLng, toLat, toLng) {
  try {
    const response = await fetch(
      `${ORS_BASE_URL}/directions/driving-car?api_key=${ORS_API_KEY}&start=${fromLng},${fromLat}&end=${toLng},${toLat}`
    );
    
    if (!response.ok) {
      console.warn("⚠️ ORS API error, using fallback calculation");
      return calculateHaversineTime(fromLat, fromLng, toLat, toLng);
    }
    
    const data = await response.json();
    const route = data.features[0].properties.segments[0];
    
    return {
      distanceKm: (route.distance / 1000).toFixed(2),
      durationMinutes: Math.ceil(route.duration / 60)
    };
  } catch (error) {
    console.warn("⚠️ ORS API error, using fallback:", error.message);
    return calculateHaversineTime(fromLat, fromLng, toLat, toLng);
  }
}

// Fallback: Haversine distance + average speed estimation
function calculateHaversineTime(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  
  // Assume average urban speed: 30 km/h
  const durationMinutes = Math.ceil((distanceKm / 30) * 60);
  
  return {
    distanceKm: distanceKm.toFixed(2),
    durationMinutes: durationMinutes
  };
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

// Helper to generate default timeslots for next 7 days
async function generateTimeSlots() {
  console.log("🗓️ Generating default timeslots for next 7 days...");
  const today = dayjs().startOf("day");
  const timeslotTemplate = [
    { start: "08:00", end: "12:00" },
    { start: "13:00", end: "19:00" },
    { start: "19:00", end: "21:00" }
  ];

  let createdCount = 0;

  for (let i = 1; i <= 7; i++) {
    const day = today.add(i, "day");
    const dayOfWeek = day.day();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    for (const t of timeslotTemplate) {
      const existingSlots = await getAllTimeSlots();
      const exists = existingSlots.find(
        s => s.Date === day.format("YYYY-MM-DD") && s.TimeWindowStart === t.start
      );
      if (!exists) {
        await addTimeSlot({
          Date: day.format("YYYY-MM-DD"),
          TimeWindowStart: t.start,
          TimeWindowEnd: t.end,
          AvailableFlag: true
        });
        createdCount++;
        console.log(`➕ Created timeslot ${t.start}-${t.end} on ${day.format("YYYY-MM-DD")}`);
      }
    }
  }
  console.log(`📌 Total new timeslots created: ${createdCount}`);
}

// Helper to calculate total work time for an order
async function calculateOrderTime(order) {
  const orderProducts = await getOrderProductsByOrderId(order.OrderID);
  let totalMinutes = 0;
  for (const op of orderProducts) {
    const product = await getProductById(op.ProductID);
    if (!product) continue;

    if (op.DismantleRequired) {
      totalMinutes += (product.DismantleTimeMin || 0) + (product.DismantleExtraTime || 0);
    } else {
      totalMinutes += product.EstimatedInstallationTimeMin || 0;
    }
  }
  return totalMinutes;
}

// Calculate distance matrix for a set of orders
async function calculateDistanceMatrix(orders, buildings) {
  const n = orders.length;
  const matrix = Array(n).fill(null).map(() => Array(n).fill(null));
  
  console.log("🗺️ Calculating distance matrix...");
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const buildingI = buildings[orders[i].BuildingID];
      const buildingJ = buildings[orders[j].BuildingID];
      
      if (!buildingI || !buildingJ) continue;
      
      const travel = await calculateTravelTime(
        buildingI.Latitude,
        buildingI.Longitude,
        buildingJ.Latitude,
        buildingJ.Longitude
      );
      
      matrix[i][j] = travel;
      matrix[j][i] = travel; // Symmetric
    }
  }
  
  return matrix;
}

// Greedy nearest neighbor algorithm for route optimization
function optimizeOrderSequence(orders, distanceMatrix, slotStartTime, slotEndTime, depot) {
  if (orders.length <= 1) return orders;
  
  const optimized = [];
  const unvisited = new Set(orders.map((_, i) => i));
  let currentIdx = 0; // Start with first order
  let currentTime = slotStartTime.clone();
  
  optimized.push(orders[currentIdx]);
  unvisited.delete(currentIdx);
  
  while (unvisited.size > 0) {
    let nearestIdx = -1;
    let minTime = Infinity;
    
    for (const idx of unvisited) {
      const travel = distanceMatrix[currentIdx][idx];
      if (travel && travel.durationMinutes < minTime) {
        minTime = travel.durationMinutes;
        nearestIdx = idx;
      }
    }
    
    if (nearestIdx === -1) break; // No more reachable orders
    
    const travelTime = distanceMatrix[currentIdx][nearestIdx].durationMinutes;
    const nextOrder = orders[nearestIdx];
    
    currentTime = currentTime.add(travelTime, "minute");
    
    // Check if we have time for travel + work
    if (currentTime.add(nextOrder.workMinutes, "minute").isAfter(slotEndTime)) {
      break; // Can't fit this order in current slot
    }
    
    optimized.push(nextOrder);
    unvisited.delete(nearestIdx);
    currentIdx = nearestIdx;
    currentTime = currentTime.add(nextOrder.workMinutes, "minute");
  }
  
  return optimized;
}

// Main scheduler with route optimization
export async function scheduleOrders() {
  console.log("🚚 Starting smart order scheduling with route optimization...");

  await generateTimeSlots();

  const orders = await getAllOrders();
  const pendingOrders = orders.filter(o => o.OrderStatus === "Pending");
  console.log(`📦 Found ${pendingOrders.length} pending orders to schedule.`);

  if (pendingOrders.length === 0) return [];

  // Fetch all buildings and create lookup
  const buildingCache = {};
  for (const order of pendingOrders) {
    if (!buildingCache[order.BuildingID]) {
      const building = await getBuildingById(order.BuildingID);
      buildingCache[order.BuildingID] = building;
    }
  }

  // Calculate work time for each order
  for (const order of pendingOrders) {
    order.workMinutes = await calculateOrderTime(order);
  }

  const allSlots = await getAllTimeSlots();
  const sortedSlots = allSlots
    .filter(s => s.AvailableFlag)
    .sort((a, b) => dayjs(a.Date + " " + a.TimeWindowStart).diff(dayjs(b.Date + " " + b.TimeWindowStart)));

  const schedule = [];
  const unscheduledOrders = [...pendingOrders];

  for (const slot of sortedSlots) {
    if (unscheduledOrders.length === 0) break;

    console.log(`\n📅 Processing slot: ${slot.Date} ${slot.TimeWindowStart}-${slot.TimeWindowEnd}`);
    
    const slotStart = dayjs(`${slot.Date} ${slot.TimeWindowStart}`);
    const slotEnd = dayjs(`${slot.Date} ${slot.TimeWindowEnd}`);
    const slotDurationMin = slotEnd.diff(slotStart, "minute");

    // Try to fit multiple orders in this slot
    const candidateOrders = [];
    
    for (const order of unscheduledOrders) {
      const building = buildingCache[order.BuildingID];
      
      // Check building access window
      let windowStart = slotStart;
      let windowEnd = slotEnd;
      
      if (building?.AccessTimeWindowStart && building?.AccessTimeWindowEnd) {
        const accessStartDT = dayjs(`${slot.Date} ${building.AccessTimeWindowStart}`);
        const accessEndDT = dayjs(`${slot.Date} ${building.AccessTimeWindowEnd}`);
        windowStart = dayjs.max(slotStart, accessStartDT);
        windowEnd = dayjs.min(slotEnd, accessEndDT);
      }
      
      const availableTime = windowEnd.diff(windowStart, "minute");
      
      if (availableTime >= order.workMinutes + 30) { // +30 min buffer for travel
        candidateOrders.push({
          ...order,
          windowStart,
          windowEnd
        });
      }
    }

    if (candidateOrders.length === 0) continue;

    console.log(`🎯 ${candidateOrders.length} candidate orders for this slot`);

    // Calculate distance matrix for candidates
    const distanceMatrix = await calculateDistanceMatrix(candidateOrders, buildingCache);

    // Optimize order sequence within slot
    const optimizedOrders = optimizeOrderSequence(
      candidateOrders,
      distanceMatrix,
      slotStart,
      slotEnd,
      DEPOT_LOCATION
    );

    console.log(`✅ Optimized sequence: ${optimizedOrders.length} orders`);

    // Schedule optimized orders
    let currentTime = slotStart.clone();
    let prevBuilding = DEPOT_LOCATION;

    for (let i = 0; i < optimizedOrders.length; i++) {
      const order = optimizedOrders[i];
      const building = buildingCache[order.BuildingID];

      // Calculate travel time from previous location
      const travel = await calculateTravelTime(
        prevBuilding.Latitude || prevBuilding.latitude,
        prevBuilding.Longitude || prevBuilding.longitude,
        building.Latitude,
        building.Longitude
      );

      // Add travel time
      currentTime = currentTime.add(travel.durationMinutes, "minute");
      
      const orderStart = currentTime.clone();
      const orderEnd = currentTime.add(order.workMinutes, "minute");

      // Check if still within slot
      if (orderEnd.isAfter(slotEnd)) {
        console.log(`⚠️ Order ${order.OrderID} exceeds slot time, moving to next slot`);
        break;
      }

      // Update order in database
      await updateOrder(order.id, {
        ScheduledStartDateTime: orderStart.toDate(),
        ScheduledEndDateTime: orderEnd.toDate(),
        TravelTimeMinutes: travel.durationMinutes,
        TravelDistanceKm: parseFloat(travel.distanceKm),
        UpdatedAt: new Date(),
        OrderStatus: "Scheduled"
      });

      schedule.push({
        OrderID: order.OrderID,
        BuildingID: order.BuildingID,
        ScheduledStart: orderStart.toDate(),
        ScheduledEnd: orderEnd.toDate(),
        WorkMinutes: order.workMinutes,
        TravelMinutes: travel.durationMinutes,
        TravelDistanceKm: travel.distanceKm,
        SlotDate: slot.Date,
        SlotWindow: `${slot.TimeWindowStart} - ${slot.TimeWindowEnd}`,
        SequenceInSlot: i + 1
      });

      console.log(
        `✅ ${order.OrderID}: ${orderStart.format("HH:mm")} → ${orderEnd.format("HH:mm")} ` +
        `(Work: ${order.workMinutes}min, Travel: ${travel.durationMinutes}min, ${travel.distanceKm}km)`
      );

      // Remove from unscheduled
      const idx = unscheduledOrders.findIndex(o => o.OrderID === order.OrderID);
      if (idx !== -1) unscheduledOrders.splice(idx, 1);

      currentTime = orderEnd.clone();
      prevBuilding = building;
    }
  }

  console.log("\n🕒 Final Optimized Schedule:");
  console.log(`✅ Scheduled: ${schedule.length} orders`);
  console.log(`⏳ Unscheduled: ${unscheduledOrders.length} orders`);
  
  const totalTravel = schedule.reduce((sum, s) => sum + s.TravelMinutes, 0);
  const totalWork = schedule.reduce((sum, s) => sum + s.WorkMinutes, 0);
  const totalDistance = schedule.reduce((sum, s) => sum + parseFloat(s.TravelDistanceKm), 0);
  
  console.log(`🚗 Total travel time: ${totalTravel} minutes`);
  console.log(`🔧 Total work time: ${totalWork} minutes`);
  console.log(`📍 Total distance: ${totalDistance.toFixed(2)} km`);

  return schedule;
}