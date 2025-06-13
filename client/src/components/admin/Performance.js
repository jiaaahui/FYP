import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie, Radar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
  ArcElement,
);

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// --- MOCK DATA ---
const employees = [
  { id: 'EMP_00001', name: 'Ahmad', role: 'delivery team', contact: '0129224708', teamId: 'TEAM_00002' },
  { id: 'EMP_00002', name: 'Siti', role: 'delivery team', contact: '0188367783', teamId: 'TEAM_00003' },
  { id: 'EMP_00003', name: 'Lee', role: 'installer', contact: '0125687815', teamId: 'TEAM_00002' },
  { id: 'EMP_00004', name: 'Raj', role: 'installer', contact: '0194005717', teamId: 'TEAM_00003' },
  { id: 'EMP_00005', name: 'Tan', role: 'warehouse loader team', contact: '0116752443', teamId: 'TEAM_00001' },
  { id: 'EMP_00006', name: 'Chan', role: 'warehouse loader team', contact: '0157130809', teamId: 'TEAM_00001' },
  { id: 'EMP_00007', name: 'Muthu', role: 'delivery team', contact: '0158261264', teamId: 'TEAM_00001' },
  { id: 'EMP_00008', name: 'Nur', role: 'installer', contact: '0120293379', teamId: 'TEAM_00002' },
  { id: 'EMP_00009', name: 'Kumar', role: 'warehouse loader team', contact: '0147422349', teamId: 'TEAM_00001' },
  { id: 'EMP_00010', name: 'Aisyah', role: 'delivery team', contact: '0121604508', teamId: 'TEAM_00002' }
];

const performanceData = {
  'EMP_00001': { tasksCompleted: 45, punctualityScore: 92, avgDeliveryTime: 25, customerRating: 4.7, delaysThisMonth: 2 },
  'EMP_00002': { tasksCompleted: 38, punctualityScore: 88, avgDeliveryTime: 30, customerRating: 4.5, delaysThisMonth: 3 },
  'EMP_00003': { tasksCompleted: 52, punctualityScore: 95, avgDeliveryTime: 40, customerRating: 4.8, delaysThisMonth: 1 },
  'EMP_00004': { tasksCompleted: 41, punctualityScore: 85, avgDeliveryTime: 45, customerRating: 4.4, delaysThisMonth: 4 },
  'EMP_00005': { tasksCompleted: 67, punctualityScore: 90, avgDeliveryTime: 15, customerRating: 4.6, delaysThisMonth: 2 },
  'EMP_00006': { tasksCompleted: 59, punctualityScore: 87, avgDeliveryTime: 18, customerRating: 4.3, delaysThisMonth: 3 },
  'EMP_00007': { tasksCompleted: 43, punctualityScore: 83, avgDeliveryTime: 28, customerRating: 4.2, delaysThisMonth: 5 },
  'EMP_00008': { tasksCompleted: 48, punctualityScore: 93, avgDeliveryTime: 42, customerRating: 4.9, delaysThisMonth: 1 },
  'EMP_00009': { tasksCompleted: 62, punctualityScore: 89, avgDeliveryTime: 16, customerRating: 4.4, delaysThisMonth: 2 },
  'EMP_00010': { tasksCompleted: 39, punctualityScore: 91, avgDeliveryTime: 26, customerRating: 4.6, delaysThisMonth: 2 }
};

const weeklyTrends = [
  { week: 'Week 1', deliveryTeam: 85, installer: 90, warehouse: 88 },
  { week: 'Week 2', deliveryTeam: 88, installer: 87, warehouse: 92 },
  { week: 'Week 3', deliveryTeam: 90, installer: 93, warehouse: 89 },
  { week: 'Week 4', deliveryTeam: 87, installer: 91, warehouse: 94 }
];

function Performance() {
  // All the calculation logic is same as previous example, just using the constants above
  const employeeChartData = useMemo(() => employees.map(emp => ({
    name: emp.name,
    role: emp.role,
    tasks: performanceData[emp.id]?.tasksCompleted ?? 0,
    punctuality: performanceData[emp.id]?.punctualityScore ?? 0,
    rating: performanceData[emp.id]?.customerRating ?? 0,
    delays: performanceData[emp.id]?.delaysThisMonth ?? 0,
  })), []);

  const summaryStats = useMemo(() => {
    if (!employees.length) return { totalTasks: 0, avgPunctuality: 0, totalDelays: 0, avgRating: 0 };
    const totalTasks = employeeChartData.reduce((sum, emp) => sum + emp.tasks, 0);
    const avgPunctuality = Math.round(employeeChartData.reduce((sum, emp) => sum + emp.punctuality, 0) / employees.length);
    const totalDelays = employeeChartData.reduce((sum, emp) => sum + emp.delays, 0);
    const avgRating = (employeeChartData.reduce((sum, emp) => sum + emp.rating, 0) / employees.length).toFixed(1);
    return { totalTasks, avgPunctuality, totalDelays, avgRating };
  }, [employeeChartData, employees.length]);

  const teamPerformanceData = useMemo(() => {
    const build = role => {
      const filtered = employeeChartData.filter(e => e.role === role);
      return {
        avgTasks: filtered.reduce((sum, e) => sum + e.tasks, 0) / (filtered.length || 1),
        avgPunctuality: filtered.reduce((sum, e) => sum + e.punctuality, 0) / (filtered.length || 1),
        avgRating: filtered.reduce((sum, e) => sum + e.rating, 0) / (filtered.length || 1),
      };
    };
    return [
      { team: 'Delivery', ...build('delivery team') },
      { team: 'Installation', ...build('installer') },
      { team: 'Warehouse', ...build('warehouse loader team') },
    ];
  }, [employeeChartData]);

  const performanceDistribution = useMemo(() => [
    { name: 'Excellent (90-100%)', value: employeeChartData.filter(e => e.punctuality >= 90).length },
    { name: 'Good (80-89%)', value: employeeChartData.filter(e => e.punctuality >= 80 && e.punctuality < 90).length },
    { name: 'Fair (70-79%)', value: employeeChartData.filter(e => e.punctuality >= 70 && e.punctuality < 80).length },
    { name: 'Poor (<70%)', value: employeeChartData.filter(e => e.punctuality < 70).length }
  ], [employeeChartData]);

  const topPerformers = useMemo(() => {
    return [...employeeChartData]
      .sort((a, b) => (b.punctuality + b.rating * 20 + b.tasks * 0.5) - (a.punctuality + a.rating * 20 + a.tasks * 0.5))
      .slice(0, 5);
  }, [employeeChartData]);

  // --- Chart.js data/configs ---
  const barTasksData = {
    labels: employeeChartData.map(e => e.name),
    datasets: [
      {
        label: 'Tasks Completed',
        data: employeeChartData.map(e => e.tasks),
        backgroundColor: COLORS[0],
      },
    ],
  };
  const barPunctualityData = {
    labels: employeeChartData.map(e => e.name),
    datasets: [
      {
        label: 'Punctuality (%)',
        data: employeeChartData.map(e => e.punctuality),
        backgroundColor: COLORS[1],
      },
    ],
  };
  const radarData = {
    labels: teamPerformanceData.map(t => t.team),
    datasets: [
      {
        label: 'Avg Tasks',
        data: teamPerformanceData.map(t => t.avgTasks),
        backgroundColor: 'rgba(59,130,246,0.3)',
        borderColor: COLORS[0],
        borderWidth: 2,
      },
      {
        label: 'Avg Punctuality',
        data: teamPerformanceData.map(t => t.avgPunctuality),
        backgroundColor: 'rgba(16,185,129,0.3)',
        borderColor: COLORS[1],
        borderWidth: 2,
      },
    ],
  };
  const pieData = {
    labels: performanceDistribution.map(p => p.name),
    datasets: [
      {
        label: 'Performance Distribution',
        data: performanceDistribution.map(p => p.value),
        backgroundColor: COLORS,
      },
    ],
  };
  const lineData = {
    labels: weeklyTrends.map(w => w.week),
    datasets: [
      {
        label: 'Delivery Team',
        data: weeklyTrends.map(w => w.deliveryTeam),
        fill: false,
        borderColor: COLORS[0],
        backgroundColor: COLORS[0],
        tension: 0.4,
      },
      {
        label: 'Installation Team',
        data: weeklyTrends.map(w => w.installer),
        fill: false,
        borderColor: COLORS[1],
        backgroundColor: COLORS[1],
        tension: 0.4,
      },
      {
        label: 'Warehouse Team',
        data: weeklyTrends.map(w => w.warehouse),
        fill: false,
        borderColor: COLORS[2],
        backgroundColor: COLORS[2],
        tension: 0.4,
      },
    ],
  };

  // --- UI ---
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Employee Performance Dashboard</h1>
          <p className="text-gray-600">Comprehensive analytics and monitoring for team performance</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard title="Total Tasks Completed" value={summaryStats.totalTasks} color="blue" trend="+12%" />
          <SummaryCard title="Average Punctuality" value={summaryStats.avgPunctuality + '%'} color="green" trend="+3%" />
          <SummaryCard title="Total Delays" value={summaryStats.totalDelays} color="red" trend="+2" />
          <SummaryCard title="Avg Customer Rating" value={summaryStats.avgRating} color="yellow" trend="+0.2" />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Employee Tasks Performance */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks Completed by Employee</h3>
            <Bar data={barTasksData} options={{responsive: true, plugins:{legend:{display:false}}, scales:{x:{ticks:{autoSkip:false}}}}} height={300} />
          </div>
          {/* Punctuality Scores */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Punctuality Scores</h3>
            <Bar data={barPunctualityData} options={{responsive: true, plugins:{legend:{display:false}}, scales:{x:{ticks:{autoSkip:false}}}}} height={300} />
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Team Performance Comparison */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance Comparison</h3>
            <Radar data={radarData} options={{responsive:true}} height={300} />
          </div>
          {/* Performance Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Distribution</h3>
            <Pie data={pieData} options={{responsive:true}} height={300} />
          </div>
        </div>

        {/* Weekly Trends */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance Trends</h3>
          <Line data={lineData} options={{responsive:true}} height={300} />
        </div>

        {/* Top Performers and Detailed Table */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Top Performers */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-5 h-5 mr-2 text-yellow-500">⭐</span>
              Top Performers
            </h3>
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={performer.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600 mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{performer.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{performer.role.replace(' team', '')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{performer.punctuality}%</p>
                    <p className="text-xs text-gray-500">{performer.tasks} tasks</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Detailed Employee Table */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Performance Metrics</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-medium text-gray-900">Employee</th>
                    <th className="text-left p-3 font-medium text-gray-900">Role</th>
                    <th className="text-center p-3 font-medium text-gray-900">Tasks</th>
                    <th className="text-center p-3 font-medium text-gray-900">Punctuality</th>
                    <th className="text-center p-3 font-medium text-gray-900">Rating</th>
                    <th className="text-center p-3 font-medium text-gray-900">Delays</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeChartData.map((emp, index) => (
                    <tr key={emp.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 font-medium text-gray-900">{emp.name}</td>
                      <td className="p-3 text-gray-600 capitalize">{emp.role.replace(' team', '')}</td>
                      <td className="p-3 text-center text-gray-900">{emp.tasks}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          emp.punctuality >= 90 ? 'bg-green-100 text-green-800' :
                          emp.punctuality >= 80 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {emp.punctuality}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center">
                          <span className="w-4 h-4 text-yellow-400 mr-1">⭐</span>
                          {emp.rating}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          emp.delays <= 2 ? 'bg-green-100 text-green-800' :
                          emp.delays <= 4 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {emp.delays}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Performance;

function SummaryCard({ title, value, color, trend }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className={`text-sm flex items-center mt-1 ${colorMap[color]}`}>
            <span className="w-4 h-4 mr-1">⬆️</span>
            {trend} from last month
          </p>
        </div>
        <div className={`p-3 rounded-lg ${colorMap[color]}`}>
          <span className="text-2xl">{color === 'blue' ? '📦' : color === 'green' ? '⏰' : color === 'red' ? '⚠️' : '⭐'}</span>
        </div>
      </div>
    </div>
  );
}