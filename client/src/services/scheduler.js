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
    const dayOfWeek = day.day(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends

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

// Helper to calculate total minutes for an order
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

// Main scheduler
export async function scheduleOrders() {
  console.log("🚚 Starting smart order scheduling...");

  await generateTimeSlots();

  const orders = await getAllOrders();
  const pendingOrders = orders.filter(o => o.OrderStatus === "Pending");
  console.log(`📦 Found ${pendingOrders.length} pending orders to schedule.`);

  if (pendingOrders.length === 0) return [];

  const allSlots = await getAllTimeSlots();

  const schedule = [];

  for (const order of pendingOrders) {
    console.log(`\n🧾 Processing Order ${order.OrderID}...`);

    const building = await getBuildingById(order.BuildingID);
    let accessStart = building?.AccessTimeWindowStart || null;
    let accessEnd = building?.AccessTimeWindowEnd || null;
    console.log(`🏢 Building access window: ${accessStart || "No window"} - ${accessEnd || "No window"}`);

    const totalMinutes = await calculateOrderTime(order);
    console.log(`⏱️ Total work time for ${order.OrderID}: ${totalMinutes} min`);

    let scheduled = false;

    // Sort slots by date + start time ascending
    const sortedSlots = allSlots
      .filter(s => s.AvailableFlag)
      .sort((a, b) => dayjs(a.Date + " " + a.TimeWindowStart).diff(dayjs(b.Date + " " + b.TimeWindowStart)));

    for (const slot of sortedSlots) {
      const slotStart = dayjs(`${slot.Date} ${slot.TimeWindowStart}`);
      const slotEnd = dayjs(`${slot.Date} ${slot.TimeWindowEnd}`);
      const slotDuration = slotEnd.diff(slotStart, "minute");

      // Check building access window if exists
      let windowStart = slotStart;
      let windowEnd = slotEnd;
      if (accessStart && accessEnd) {
        const accessStartDT = dayjs(`${slot.Date} ${accessStart}`);
        const accessEndDT = dayjs(`${slot.Date} ${accessEnd}`);
        windowStart = dayjs.max(slotStart, accessStartDT);
        windowEnd = dayjs.min(slotEnd, accessEndDT);
      }

      // Calculate remaining minutes in this slot (accumulated scheduled orders)
      if (!slot.totalScheduledMinutes) slot.totalScheduledMinutes = 0;
      const slotRemaining = windowEnd.diff(windowStart, "minute") - slot.totalScheduledMinutes;

      if (slotRemaining >= totalMinutes) {
        // Fits in this slot
        const orderStart = windowStart.add(slot.totalScheduledMinutes, "minute");
        const orderEnd = orderStart.add(totalMinutes, "minute");

        // Record in Firestore
        await updateOrder(order.id, {
          ScheduledStartDateTime: orderStart.toDate(),
          ScheduledEndDateTime: orderEnd.toDate(),
          UpdatedAt: new Date(),
          OrderStatus: "Pending"
        });

        // Update slot’s scheduled minutes
        slot.totalScheduledMinutes += totalMinutes;

        console.log(`✅ Scheduled ${order.OrderID} on ${slot.Date} ${slot.TimeWindowStart}-${slot.TimeWindowEnd}`);
        console.log(`   Order time: ${orderStart.format("HH:mm")} → ${orderEnd.format("HH:mm")}`);
        scheduled = true;

        schedule.push({
          OrderID: order.OrderID,
          BuildingID: order.BuildingID,
          ScheduledStart: orderStart.toDate(),
          ScheduledEnd: orderEnd.toDate(),
          TotalMinutes: totalMinutes,
          SlotDate: slot.Date,
          SlotWindow: `${slot.TimeWindowStart} - ${slot.TimeWindowEnd}`
        });

        break; // move to next order
      } else {
        console.log(`⚠️ Slot ${slot.Date} ${slot.TimeWindowStart}-${slot.TimeWindowEnd} too short (${slotRemaining} min left)`);
      }
    }

    if (!scheduled) {
      console.log(`❌ No suitable slot found for ${order.OrderID}. Will try again next day.`);
    }
  }

  console.log("\n🕒 Final Schedule:");
  schedule.forEach(s => {
    console.log(
      `${s.OrderID} | Building: ${s.BuildingID} | ${s.ScheduledStart.toLocaleString()} → ${s.ScheduledEnd.toLocaleString()} (${s.TotalMinutes} min) | Slot: ${s.SlotDate} [${s.SlotWindow}]`
    );
  });

  return schedule;
}
