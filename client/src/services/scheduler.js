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

// Google Maps API Configuration
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_BASE_URL = "https://maps.googleapis.com/maps/api";

// Depot/warehouse coordinates
const DEPOT_LOCATION = {
  latitude: 3.1390,  // Petaling Jaya
  longitude: 101.6869
};

// Enhanced Google Maps distance calculation
async function calculateTravelTimeGoogle(fromLat, fromLng, toLat, toLng, travelMode = 'driving') {
  try {
    const response = await fetch(
      `${GOOGLE_MAPS_BASE_URL}/directions/json?` +
      `origin=${fromLat},${fromLng}&` +
      `destination=${toLat},${toLng}&` +
      `mode=${travelMode}&` +
      `traffic_model=best_guess&` +
      `departure_time=now&` +
      `key=${GOOGLE_MAPS_API_KEY}`
    );
    
    if (!response.ok) {
      console.warn("⚠️ Google Maps API error, using fallback");
      return calculateHaversineTime(fromLat, fromLng, toLat, toLng);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.routes.length) {
      console.warn("⚠️ No routes found, using fallback");
      return calculateHaversineTime(fromLat, fromLng, toLat, toLng);
    }
    
    const route = data.routes[0].legs[0];
    
    return {
      distanceKm: (route.distance.value / 1000).toFixed(2),
      durationMinutes: Math.ceil(route.duration_in_traffic?.value / 60 || route.duration.value / 60),
      durationInTraffic: route.duration_in_traffic?.text || route.duration.text
    };
  } catch (error) {
    console.warn("⚠️ Google Maps API error:", error.message);
    return calculateHaversineTime(fromLat, fromLng, toLat, toLng);
  }
}

// Fallback calculation (unchanged)
function calculateHaversineTime(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  
  const durationMinutes = Math.ceil((distanceKm / 25) * 60); // Reduced to 25 km/h for Malaysian urban traffic
  
  return {
    distanceKm: distanceKm.toFixed(2),
    durationMinutes: durationMinutes
  };
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

// NEW: Identify partially filled timeslots and nearby orders
async function identifyPartiallyFilledSlots(allOrders, buildings) {
  console.log("🔍 Identifying partially filled timeslots...");
  
  const scheduledOrders = allOrders.filter(o => o.OrderStatus === "Scheduled");
  const slotOccupancy = {};
  
  // Map scheduled orders to their timeslots
  for (const order of scheduledOrders) {
    const slotKey = `${order.TimeSlotID}_${dayjs(order.ScheduledStartDateTime).format('YYYY-MM-DD')}`;
    
    if (!slotOccupancy[slotKey]) {
      const timeSlot = await getAllTimeSlots().then(slots => 
        slots.find(s => s.id === order.TimeSlotID)
      );
      
      slotOccupancy[slotKey] = {
        timeSlot,
        orders: [],
        totalDuration: 0,
        availableMinutes: 0,
        lastOrderEndTime: null
      };
    }
    
    slotOccupancy[slotKey].orders.push(order);
    const workTime = await calculateOrderTime(order);
    slotOccupancy[slotKey].totalDuration += workTime + (order.TravelTimeMinutes || 0);
  }
  
  // Calculate available time in each slot
  for (const [slotKey, slotData] of Object.entries(slotOccupancy)) {
    const slotStart = dayjs(`${slotData.timeSlot.Date} ${slotData.timeSlot.TimeWindowStart}`);
    const slotEnd = dayjs(`${slotData.timeSlot.Date} ${slotData.timeSlot.TimeWindowEnd}`);
    const totalSlotMinutes = slotEnd.diff(slotStart, 'minute');
    
    slotData.availableMinutes = totalSlotMinutes - slotData.totalDuration;
    
    // Find the last scheduled order's end time
    const lastOrder = slotData.orders
      .sort((a, b) => dayjs(a.ScheduledEndDateTime).diff(dayjs(b.ScheduledEndDateTime)))
      .pop();
    
    slotData.lastOrderEndTime = lastOrder ? dayjs(lastOrder.ScheduledEndDateTime) : slotStart;
  }
  
  return slotOccupancy;
}

// NEW: Find nearby orders for partially filled slots
async function findNearbyOrdersForSlot(partialSlot, pendingOrders, buildings, maxTravelTime = 45) {
  const candidateOrders = [];
  const lastBuilding = await getBuildingById(
    partialSlot.orders[partialSlot.orders.length - 1]?.BuildingID
  ) || DEPOT_LOCATION;
  
  for (const order of pendingOrders) {
    const building = buildings[order.BuildingID];
    if (!building) continue;
    
    // Check if order can fit in remaining time
    const orderWorkTime = await calculateOrderTime(order);
    const travel = await calculateTravelTimeGoogle(
      lastBuilding.Latitude || lastBuilding.latitude,
      lastBuilding.Longitude || lastBuilding.longitude,
      building.Latitude,
      building.Longitude
    );
    
    const totalTimeNeeded = orderWorkTime + travel.durationMinutes + 15; // 15 min buffer
    
    if (totalTimeNeeded <= partialSlot.availableMinutes && travel.durationMinutes <= maxTravelTime) {
      candidateOrders.push({
        ...order,
        workMinutes: orderWorkTime,
        travelTime: travel.durationMinutes,
        travelDistance: travel.distanceKm,
        totalTimeNeeded
      });
    }
  }
  
  // Sort by travel time (nearest first)
  return candidateOrders.sort((a, b) => a.travelTime - b.travelTime);
}

// Enhanced distance matrix with Google Maps
async function calculateDistanceMatrixGoogle(orders, buildings) {
  const n = orders.length;
  const matrix = Array(n).fill(null).map(() => Array(n).fill(null));
  
  console.log("🗺️ Calculating Google Maps distance matrix...");
  
  // Batch API calls to optimize requests
  const batchSize = 10; // Google Maps allows up to 25 origins/destinations per request
  
  for (let i = 0; i < n; i += batchSize) {
    for (let j = i; j < n; j += batchSize) {
      const origins = orders.slice(i, Math.min(i + batchSize, n))
        .map(order => {
          const building = buildings[order.BuildingID];
          return `${building.Latitude},${building.Longitude}`;
        });
      
      const destinations = orders.slice(j, Math.min(j + batchSize, n))
        .map(order => {
          const building = buildings[order.BuildingID];
          return `${building.Latitude},${building.Longitude}`;
        });
      
      try {
        const response = await fetch(
          `${GOOGLE_MAPS_BASE_URL}/distancematrix/json?` +
          `origins=${origins.join('|')}&` +
          `destinations=${destinations.join('|')}&` +
          `mode=driving&` +
          `traffic_model=best_guess&` +
          `departure_time=now&` +
          `key=${GOOGLE_MAPS_API_KEY}`
        );
        
        const data = await response.json();
        
        if (data.status === 'OK') {
          for (let oi = 0; oi < data.rows.length; oi++) {
            for (let di = 0; di < data.rows[oi].elements.length; di++) {
              const element = data.rows[oi].elements[di];
              if (element.status === 'OK') {
                const actualI = i + oi;
                const actualJ = j + di;
                
                const travelData = {
                  distanceKm: (element.distance.value / 1000).toFixed(2),
                  durationMinutes: Math.ceil(
                    (element.duration_in_traffic?.value || element.duration.value) / 60
                  )
                };
                
                matrix[actualI][actualJ] = travelData;
                if (actualI !== actualJ) {
                  matrix[actualJ][actualI] = travelData; // Symmetric
                }
              }
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️ Batch matrix calculation failed for batch ${i}-${j}:`, error.message);
        // Fall back to individual calculations for this batch
        for (let oi = i; oi < Math.min(i + batchSize, n); oi++) {
          for (let di = j; di < Math.min(j + batchSize, n); di++) {
            if (!matrix[oi][di] && oi !== di) {
              const buildingI = buildings[orders[oi].BuildingID];
              const buildingJ = buildings[orders[di].BuildingID];
              
              const travel = await calculateTravelTimeGoogle(
                buildingI.Latitude, buildingI.Longitude,
                buildingJ.Latitude, buildingJ.Longitude
              );
              
              matrix[oi][di] = travel;
              matrix[di][oi] = travel;
            }
          }
        }
      }
      
      // Rate limiting - Google allows 50 requests per second
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return matrix;
}

// Enhanced main scheduler
export async function scheduleOrders() {
  console.log("🚚 Starting enhanced smart order scheduling with Google Maps...");
  
  await generateTimeSlots();
  
  const allOrders = await getAllOrders();
  const pendingOrders = allOrders.filter(o => o.OrderStatus === "Pending");
  console.log(`📦 Found ${pendingOrders.length} pending orders to schedule.`);
  
  if (pendingOrders.length === 0) return [];
  
  // Build cache
  const buildingCache = {};
  for (const order of [...pendingOrders, ...allOrders.filter(o => o.OrderStatus === "Scheduled")]) {
    if (!buildingCache[order.BuildingID]) {
      const building = await getBuildingById(order.BuildingID);
      buildingCache[order.BuildingID] = building;
    }
  }
  
  // Calculate work time for pending orders
  for (const order of pendingOrders) {
    order.workMinutes = await calculateOrderTime(order);
  }
  
  // NEW: Check for partially filled slots first
  const partialSlots = await identifyPartiallyFilledSlots(allOrders, buildingCache);
  const schedule = [];
  let remainingOrders = [...pendingOrders];
  
  console.log(`\n🔍 Found ${Object.keys(partialSlots).length} existing scheduled slots`);
  
  // Try to fill partially filled slots with nearby orders
  for (const [slotKey, slotData] of Object.entries(partialSlots)) {
    if (slotData.availableMinutes > 60 && remainingOrders.length > 0) { // Only if >60 min available
      console.log(`\n🎯 Attempting to fill partial slot: ${slotKey} (${slotData.availableMinutes} min available)`);
      
      const nearbyOrders = await findNearbyOrdersForSlot(slotData, remainingOrders, buildingCache);
      
      if (nearbyOrders.length > 0) {
        const bestOrder = nearbyOrders[0]; // Nearest order
        console.log(`✅ Adding order ${bestOrder.OrderID} to existing slot (${bestOrder.travelTime} min travel)`);
        
        const startTime = slotData.lastOrderEndTime.add(bestOrder.travelTime, 'minute');
        const endTime = startTime.add(bestOrder.workMinutes, 'minute');
        
        await updateOrder(bestOrder.id, {
          ScheduledStartDateTime: startTime.toDate(),
          ScheduledEndDateTime: endTime.toDate(),
          TravelTimeMinutes: bestOrder.travelTime,
          TravelDistanceKm: parseFloat(bestOrder.travelDistance),
          TimeSlotID: slotData.timeSlot.id,
          OrderStatus: "Scheduled",
          UpdatedAt: new Date()
        });
        
        schedule.push({
          OrderID: bestOrder.OrderID,
          BuildingID: bestOrder.BuildingID,
          ScheduledStart: startTime.toDate(),
          ScheduledEnd: endTime.toDate(),
          WorkMinutes: bestOrder.workMinutes,
          TravelMinutes: bestOrder.travelTime,
          TravelDistanceKm: bestOrder.travelDistance,
          SlotDate: slotData.timeSlot.Date,
          SlotWindow: `${slotData.timeSlot.TimeWindowStart} - ${slotData.timeSlot.TimeWindowEnd}`,
          FilledPartialSlot: true
        });
        
        remainingOrders = remainingOrders.filter(o => o.OrderID !== bestOrder.OrderID);
      }
    }
  }
  
  // Continue with regular scheduling for remaining orders
  const allSlots = await getAllTimeSlots();
  const availableSlots = allSlots
    .filter(s => s.AvailableFlag && !Object.keys(partialSlots).includes(`${s.id}_${s.Date}`))
    .sort((a, b) => dayjs(a.Date + " " + a.TimeWindowStart).diff(dayjs(b.Date + " " + b.TimeWindowStart)));
  
  // Rest of the scheduling logic remains the same but uses Google Maps matrix
  for (const slot of availableSlots) {
    if (remainingOrders.length === 0) break;
    
    console.log(`\n📅 Processing new slot: ${slot.Date} ${slot.TimeWindowStart}-${slot.TimeWindowEnd}`);
    
    const slotStart = dayjs(`${slot.Date} ${slot.TimeWindowStart}`);
    const slotEnd = dayjs(`${slot.Date} ${slot.TimeWindowEnd}`);
    
    // Find candidate orders for this slot
    const candidateOrders = [];
    for (const order of remainingOrders) {
      const building = buildingCache[order.BuildingID];
      
      let windowStart = slotStart;
      let windowEnd = slotEnd;
      
      if (building?.AccessTimeWindowStart && building?.AccessTimeWindowEnd) {
        const accessStartDT = dayjs(`${slot.Date} ${building.AccessTimeWindowStart}`);
        const accessEndDT = dayjs(`${slot.Date} ${building.AccessTimeWindowEnd}`);
        windowStart = dayjs.max(slotStart, accessStartDT);
        windowEnd = dayjs.min(slotEnd, accessEndDT);
      }
      
      const availableTime = windowEnd.diff(windowStart, 'minute');
      
      if (availableTime >= order.workMinutes + 30) {
        candidateOrders.push({
          ...order,
          windowStart,
          windowEnd
        });
      }
    }
    
    if (candidateOrders.length === 0) continue;
    
    console.log(`🎯 ${candidateOrders.length} candidate orders for this slot`);
    
    // Use Google Maps for distance matrix
    const distanceMatrix = await calculateDistanceMatrixGoogle(candidateOrders, buildingCache);
    
    // Optimize and schedule orders (rest of logic unchanged)
    const optimizedOrders = optimizeOrderSequence(candidateOrders, distanceMatrix, slotStart, slotEnd, DEPOT_LOCATION);
    
    let currentTime = slotStart.clone();
    let prevBuilding = DEPOT_LOCATION;
    
    for (let i = 0; i < optimizedOrders.length; i++) {
      const order = optimizedOrders[i];
      const building = buildingCache[order.BuildingID];
      
      const travel = await calculateTravelTimeGoogle(
        prevBuilding.Latitude || prevBuilding.latitude,
        prevBuilding.Longitude || prevBuilding.longitude,
        building.Latitude,
        building.Longitude
      );
      
      currentTime = currentTime.add(travel.durationMinutes, 'minute');
      const orderStart = currentTime.clone();
      const orderEnd = currentTime.add(order.workMinutes, 'minute');
      
      if (orderEnd.isAfter(slotEnd)) {
        console.log(`⚠️ Order ${order.OrderID} exceeds slot time, moving to next slot`);
        break;
      }
      
      await updateOrder(order.id, {
        ScheduledStartDateTime: orderStart.toDate(),
        ScheduledEndDateTime: orderEnd.toDate(),
        TravelTimeMinutes: travel.durationMinutes,
        TravelDistanceKm: parseFloat(travel.distanceKm),
        TimeSlotID: slot.id,
        OrderStatus: "Scheduled",
        UpdatedAt: new Date()
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
      
      const idx = remainingOrders.findIndex(o => o.OrderID === order.OrderID);
      if (idx !== -1) remainingOrders.splice(idx, 1);
      
      currentTime = orderEnd.clone();
      prevBuilding = building;
    }
  }
  
  console.log("\n🕒 Final Enhanced Schedule Summary:");
  console.log(`✅ Scheduled: ${schedule.length} orders`);
  console.log(`⏳ Unscheduled: ${remainingOrders.length} orders`);
  console.log(`🔄 Partial slots filled: ${schedule.filter(s => s.FilledPartialSlot).length}`);
  
  return schedule;
}

// Helper function remains the same
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

// Generate time slots function remains the same
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

// Optimized sequence function remains the same
function optimizeOrderSequence(orders, distanceMatrix, slotStartTime, slotEndTime, depot) {
  if (orders.length <= 1) return orders;
  
  const optimized = [];
  const unvisited = new Set(orders.map((_, i) => i));
  let currentIdx = 0;
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
    
    if (nearestIdx === -1) break;
    
    const travelTime = distanceMatrix[currentIdx][nearestIdx].durationMinutes;
    const nextOrder = orders[nearestIdx];
    
    currentTime = currentTime.add(travelTime, "minute");
    
    if (currentTime.add(nextOrder.workMinutes, "minute").isAfter(slotEndTime)) {
      break;
    }
    
    optimized.push(nextOrder);
    unvisited.delete(nearestIdx);
    currentIdx = nearestIdx;
    currentTime = currentTime.add(nextOrder.workMinutes, "minute");
  }
  
  return optimized;
}
