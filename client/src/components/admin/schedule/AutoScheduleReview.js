import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Package,
  MapPin,
  Truck,
  PlayCircle,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Use the scheduler you already have on the server/clientside (the file you posted)
import { scheduleOrders } from "../../../services/scheduler"; // adjust path if needed

/**
 * AutoScheduler (calls your existing scheduleOrders)
 *
 * - UI unchanged from your previous component.
 * - When "Run Scheduler" is clicked it calls scheduleOrders() (your scheduler.js).
 * - Displays the returned schedule and relies on your scheduler to log pending orders to the console.
 * - No local scheduling calculations are done here anymore.
 *
 * Make sure the imported scheduleOrders is the same function you showed earlier and is safe
 * to call from the browser (i.e., does not import firebase-admin). If scheduleOrders runs
 * server-side only, call it via your API instead and replace the import with an API call.
 */

function toISODateString(dt) {
  return dt.toISOString().slice(0, 10);
}

function formatTime(date) {
  if (!date) return "-";
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export default function AutoScheduler() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(null);
  const [scheduledHour, setScheduledHour] = useState("now");
  const [customTime, setCustomTime] = useState("");

  // NOTE: your scheduleOrders() (provided earlier) does its own timeslot generation and scheduling.
  // This component simply calls it and displays the returned schedule array.

  const handleSchedule = async () => {
    setLoading(true);
    setScheduledAt(new Date());
    setSchedule([]);

    try {
      // Optionally compute runAtIso if you later extend scheduleOrders to accept a run time.
      let runAtIso;
      if (scheduledHour === "now") {
        runAtIso = new Date().toISOString();
      } else if (scheduledHour === "custom" && customTime) {
        const [hh, mm] = customTime.split(":").map(Number);
        const now = new Date();
        const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh || 0, mm || 0, 0);
        runAtIso = dt.toISOString();
      } else {
        // default to next midnight
        const n = new Date();
        runAtIso = new Date(n.getFullYear(), n.getMonth(), n.getDate(), 0, 0, 0).toISOString();
      }

      // Call your scheduler function. If your scheduler accepts a runAt parameter, pass runAtIso.
      // For backward compatibility we call without args; if your scheduler supports runAt, change below:
      // const result = await scheduleOrders(runAtIso);
      const result = await scheduleOrders();

      // scheduleOrders (your script) already prints pending orders to console per your requirement.
      // result is expected to be an array of scheduled entries (as in your scheduler.js)
      if (Array.isArray(result)) {
        setSchedule(result);
      } else {
        // If your scheduler returns something else (e.g. { schedule, meta }), handle that shape:
        if (result && Array.isArray(result.schedule)) {
          setSchedule(result.schedule);
        } else {
          // Unknown shape: try to pick reasonable fields
          setSchedule([]);
          console.warn("scheduleOrders returned unexpected shape:", result);
        }
      }
    } catch (error) {
      console.error("Scheduling error:", error);
    } finally {
      setLoading(false);
    }
  };

  const grouped = schedule.reduce((acc, item) => {
    const day = item.SlotDate || toISODateString(item.ScheduledStart ? new Date(item.ScheduledStart) : new Date());
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Calendar className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Auto Scheduler</h1>
              <p className="text-gray-600">Run your scheduler implementation and view results</p>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Time</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setScheduledHour("now")}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    scheduledHour === "now"
                      ? "border-blue-600 bg-blue-50 text-blue-700 font-medium"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  Start Now
                </button>
                <button
                  onClick={() => setScheduledHour("custom")}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    scheduledHour === "custom"
                      ? "border-blue-600 bg-blue-50 text-blue-700 font-medium"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  Custom Time
                </button>
              </div>
            </div>

            {scheduledHour === "custom" && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>
            )}

            <button
              onClick={handleSchedule}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <PlayCircle size={20} />
                  Run Scheduler
                </>
              )}
            </button>
          </div>

          {scheduledAt && (
            <div className="mt-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg">
              <CheckCircle size={16} />
              Last run: {scheduledAt.toLocaleString()}
            </div>
          )}
        </div>

        {/* Results */}
        {schedule.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package size={24} className="text-blue-600" />
                Scheduled Orders ({schedule.length})
              </h2>
              <div className="text-sm text-gray-600">Results come from your scheduler implementation</div>
            </div>

            {Object.entries(grouped).map(([date, items]) => (
              <div key={date} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Calendar size={20} />
                    {formatDate(date)}
                  </h3>
                  <p className="text-blue-100 text-sm mt-1">{items.length} orders scheduled</p>
                </div>

                <div className="p-6 space-y-4">
                  {items.map((item, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-5 border-l-4 border-blue-600 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold text-sm">{item.OrderID}</div>
                            <div className="flex items-center gap-1 text-gray-600 text-sm">
                              <MapPin size={14} />
                              {item.BuildingName || `Building ${item.BuildingID}`}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-white rounded-lg">
                                <Clock size={18} className="text-green-600" />
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 font-medium">Start Time</div>
                                <div className="text-sm font-semibold text-gray-900">{formatTime(item.ScheduledStart)}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-white rounded-lg">
                                <Clock size={18} className="text-red-600" />
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 font-medium">End Time</div>
                                <div className="text-sm font-semibold text-gray-900">{formatTime(item.ScheduledEnd)}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-white rounded-lg">
                                <Truck size={18} className="text-blue-600" />
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 font-medium">Duration</div>
                                <div className="text-sm font-semibold text-gray-900">{item.TotalMinutes} minutes</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <div className="bg-white px-4 py-3 rounded-lg border-2 border-blue-200">
                            <div className="text-xs text-gray-500 font-medium text-center mb-1">Time Slot</div>
                            <div className="text-sm font-bold text-blue-600 whitespace-nowrap">{item.SlotWindow}</div>
                          </div>
                        </div>
                      </div>

                      {/* optional product summary if present */}
                      {item.products && item.products.length > 0 && (
                        <div className="mt-3 text-xs text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-2">
                          {item.products.map((p, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Package size={12} />
                              <div>
                                <div className="font-medium text-sm">{p.ProductName}</div>
                                <div className="text-xs text-gray-500">
                                  Qty: {p.Quantity} {p.DismantleRequired ? "• Dismantle" : ""}
                                  {p.DismantleRequired && ` • Dismantle ${p.DismantleTimeMin}m`}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={40} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Schedule Generated</h3>
                <p className="text-gray-600">Click "Run Scheduler" to run your scheduler and show results</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}