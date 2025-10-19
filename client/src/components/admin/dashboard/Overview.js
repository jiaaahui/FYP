import React, { useEffect, useState, useRef } from 'react';
import {
  getAllEmployees, getAllOrders, getAllReports
} from '../../../services/informationService';
import { 
  Users, Star, CheckCircle, AlertCircle, TrendingUp, TrendingDown, 
  Activity, Clock, Package, Calendar, BarChart3, PieChart, DollarSign 
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// Stat card for main metrics
const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle, trend, trendValue }) => (
  <div 
    className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all`}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-3xl font-bold text-${color}-600 mt-2`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        {trend && (
          <div className="flex items-center mt-2">
            {trendValue >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={`text-xs font-medium ${trendValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend}
            </span>
          </div>
        )}
      </div>
      <div className={`p-3 bg-${color}-50 rounded-lg`}>
        <Icon className={`h-8 w-8 text-${color}-600`} />
      </div>
    </div>
  </div>
);

// Activity feed item
const ActivityItem = ({ icon: Icon, title, description, time, status, deliveredDate, priority = 'normal' }) => (
  <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors">
    <div className={`p-2 rounded-lg ${
      priority === 'high' ? 'bg-red-50' : priority === 'medium' ? 'bg-yellow-50' : 'bg-blue-50'
    }`}>
      <Icon className={`h-4 w-4 ${
        priority === 'high' ? 'text-red-600' : priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
      }`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900 text-sm">{title}</p>
      <p className="text-gray-600 text-xs mt-1 truncate">{description}</p>
      <div className="flex items-center justify-between mt-2">
        {deliveredDate &&
          <p className="text-xs text-gray-500">
            Delivered: {deliveredDate}
          </p>
        }
        {status && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            status === 'resolved' || status === 'Completed'
              ? 'bg-green-100 text-green-800'
              : status === 'pending' || status === 'Pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {status}
          </span>
        )}
      </div>
    </div>
  </div>
);

// Chart wrapper component
const ChartCard = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    <div className="h-80">
      {children}
    </div>
  </div>
);

export default function Overview() {
  const [employees, setEmployees] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    getAllEmployees().then(setEmployees);
    getAllOrders().then(setOrders);
    getAllReports().then(setReports);
  }, []);

  // Helpers for flexible field access
  const getOrderId = (order) => order.OrderID || order.id;
  const getOrderRating = (order) => order.CustomerRating ?? order.rating ?? '';
  const getOrderFeedback = (order) => order.CustomerFeedback ?? order.feedback ?? '';
  const getOrderStatus = (order) => order.OrderStatus ?? order.status ?? '';
  const getOrderDate = (order) => {
    if (order.ActualArrivalDateTime) return new Date(order.ActualArrivalDateTime.toDate ? order.ActualArrivalDateTime.toDate() : order.ActualArrivalDateTime);
    if (order.DeliveredDate) return new Date(order.DeliveredDate.toDate ? order.DeliveredDate.toDate() : order.DeliveredDate);
    if (order.OrderDate) return new Date(order.OrderDate.toDate ? order.OrderDate.toDate() : order.OrderDate);
    if (order.createdAt) return new Date(order.createdAt.toDate ? order.createdAt.toDate() : order.createdAt);
    return new Date();
  };
  const getOrderDeliveredDate = (order) => {
    const date = getOrderDate(order);
    return formatDateDisplay(date);
  };
  const getReportId = (report) => report.ReportID || report.id;
  const getReportContent = (report) => report.Content ?? report.content ?? '';
  const getReportStatus = (report) => report.Status ?? report.status ?? '';

  // Defensive date formatter
  function formatDateDisplay(dateInput) {
    if (!dateInput) return '';
    if (typeof dateInput?.toDate === "function") {
      const d = dateInput.toDate();
      return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    if (typeof dateInput === 'number' || (typeof dateInput === 'string' && /^\d+$/.test(dateInput))) {
      const d = new Date(Number(dateInput));
      return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    if (typeof dateInput === 'string') {
      const d = new Date(dateInput);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
      return dateInput;
    }
    if (dateInput instanceof Date) {
      return dateInput.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    return String(dateInput);
  }

  // Current metrics
  const avgRating = orders.filter(o => getOrderRating(o)).length > 0
    ? (orders.reduce((sum, o) => sum + (getOrderRating(o) ? Number(getOrderRating(o)) : 0), 0) / orders.filter(o => getOrderRating(o)).length)
    : 0;
  const completedOrders = orders.filter(order => getOrderStatus(order) === 'Completed').length;
  const pendingOrders = orders.filter(order => getOrderStatus(order) === 'Pending').length;
  const activeEmployees = employees.filter(e => e.ActiveFlag !== false && e.active !== false).length;
  const pendingReports = reports.filter(report => getReportStatus(report) === 'pending').length;
  const totalRevenue = completedOrders * 25;

  // Calculate trends (compare current month with previous month)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const currentMonthOrders = orders.filter(order => {
    const orderDate = getOrderDate(order);
    return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
  });

  const lastMonthOrders = orders.filter(order => {
    const orderDate = getOrderDate(order);
    return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
  });

  const currentMonthCompleted = currentMonthOrders.filter(order => getOrderStatus(order) === 'Completed').length;
  const lastMonthCompleted = lastMonthOrders.filter(order => getOrderStatus(order) === 'Completed').length;

  const currentMonthAvgRating = currentMonthOrders.filter(o => getOrderRating(o)).length > 0
    ? (currentMonthOrders.reduce((sum, o) => sum + (getOrderRating(o) ? Number(getOrderRating(o)) : 0), 0) / currentMonthOrders.filter(o => getOrderRating(o)).length)
    : 0;
  const lastMonthAvgRating = lastMonthOrders.filter(o => getOrderRating(o)).length > 0
    ? (lastMonthOrders.reduce((sum, o) => sum + (getOrderRating(o) ? Number(getOrderRating(o)) : 0), 0) / lastMonthOrders.filter(o => getOrderRating(o)).length)
    : 0;

  // Calculate trend percentages
  const ordersTrend = lastMonthCompleted > 0 ? ((currentMonthCompleted - lastMonthCompleted) / lastMonthCompleted * 100) : (currentMonthCompleted > 0 ? 100 : 0);
  const ratingTrend = lastMonthAvgRating > 0 ? ((currentMonthAvgRating - lastMonthAvgRating) / lastMonthAvgRating * 100) : 0;
  const employeesTrend = 5; // Mock trend, you can calculate based on hire dates
  const reportsTrend = -15; // Mock trend

  // Prepare chart data
  const monthlyOrdersData = [];
  const monthLabels = [];
  const totalOrdersData = [];
  const completedOrdersData = [];
  const pendingOrdersData = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - i, 1);
    const monthOrders = orders.filter(order => {
      const orderDate = getOrderDate(order);
      return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear();
    });
    
    const completed = monthOrders.filter(order => getOrderStatus(order) === 'Completed').length;
    const pending = monthOrders.filter(order => getOrderStatus(order) === 'Pending').length;
    
    monthLabels.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
    totalOrdersData.push(monthOrders.length);
    completedOrdersData.push(completed);
    pendingOrdersData.push(pending);
  }

  // Order status distribution
  const statusData = {
    labels: ['Completed', 'Pending', 'Scheduled'],
    datasets: [{
      data: [
        completedOrders,
        pendingOrders,
        orders.length - completedOrders - pendingOrders
      ],
      backgroundColor: [
        '#10B981',
        '#F59E0B',
        '#6B7280'
      ],
      borderWidth: 0,
    }]
  };

  // Rating distribution
  const ratingLabels = ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'];
  const ratingCounts = [1, 2, 3, 4, 5].map(rating => 
    orders.filter(order => Math.floor(Number(getOrderRating(order))) === rating).length
  );

  const ratingData = {
    labels: ratingLabels,
    datasets: [{
      label: 'Number of Orders',
      data: ratingCounts,
      backgroundColor: '#F59E0B',
      borderColor: '#D97706',
      borderWidth: 1,
      borderRadius: 4,
    }]
  };

  // Revenue trend data
  const revenueData = {
    labels: monthLabels,
    datasets: [{
      label: 'Revenue ($)',
      data: completedOrdersData.map(count => count * 25),
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#10B981',
      pointBorderColor: '#059669',
      pointRadius: 4,
    }]
  };

  // Monthly orders trend data
  const monthlyOrdersTrendData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Completed',
        data: completedOrdersData,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#10B981',
        borderWidth: 1,
      },
      {
        label: 'Pending',
        data: pendingOrdersData,
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: '#F59E0B',
        borderWidth: 1,
      }
    ]
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
  };

  const recentCompletedOrders = orders
    .filter(order => getOrderStatus(order) === 'Completed')
    .sort((a, b) => {
      const da = getOrderDate(a);
      const db = getOrderDate(b);
      return db - da;
    })
    .slice(0, 5);

  const recentReports = [...reports].reverse().slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Completed Orders"
          value={completedOrders}
          icon={CheckCircle}
          color="green"
          subtitle={`${pendingOrders} pending`}
          trend={`${ordersTrend >= 0 ? '+' : ''}${ordersTrend.toFixed(1)}%`}
          trendValue={ordersTrend}
        />
        <StatCard
          title="Average Rating"
          value={avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
          icon={Star}
          color="yellow"
          subtitle="Customer satisfaction"
          trend={`${ratingTrend >= 0 ? '+' : ''}${ratingTrend.toFixed(1)}%`}
          trendValue={ratingTrend}
        />
        <StatCard
          title="Active Employees"
          value={activeEmployees}
          icon={Users}
          color="blue"
          subtitle={`${employees.length - activeEmployees} inactive`}
          trend={`+${employeesTrend}%`}
          trendValue={employeesTrend}
        />
        <StatCard
          title="Pending Reports"
          value={pendingReports}
          icon={AlertCircle}
          color="red"
          subtitle="Requires attention"
          trend={`${reportsTrend}%`}
          trendValue={reportsTrend}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{orders.length}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <Package className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivery Success Rate</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {orders.length > 0 ? Math.round((completedOrders / orders.length) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Successful deliveries rate</p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Est. Revenue</p>
              <p className="text-2xl font-bold text-green-600 mt-1">${totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">From completed orders</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Orders Trend */}
        <ChartCard title="Monthly Orders Trend">
          <Bar data={monthlyOrdersTrendData} options={barChartOptions} />
        </ChartCard>

        {/* Order Status Distribution */}
        <ChartCard title="Order Status Distribution">
          <Doughnut data={statusData} options={pieChartOptions} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <ChartCard title="Revenue Trend">
          <Line data={revenueData} options={lineChartOptions} />
        </ChartCard>

        {/* Customer Rating Distribution */}
        <ChartCard title="Customer Rating Distribution">
          <Bar data={ratingData} options={barChartOptions} />
        </ChartCard>
      </div>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Completed Orders</h3>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              Last 5 delivered
            </div>
          </div>
          
          <div className="space-y-2">
            {recentCompletedOrders.length > 0 ? recentCompletedOrders.map((order) => (
              <ActivityItem
                key={getOrderId(order)}
                icon={Package}
                title={`Order ${getOrderId(order)}`}
                description={getOrderFeedback(order) || 'No feedback provided'}
                status={getOrderStatus(order)}
                deliveredDate={getOrderDeliveredDate(order)}
                priority="normal"
              />
            )) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recent completed orders</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">System Reports</h3>
            <div className="flex items-center text-sm text-gray-500">
              <AlertCircle className="h-4 w-4 mr-1" />
              {pendingReports} pending
            </div>
          </div>
          
          <div className="space-y-2">
            {recentReports.length > 0 ? recentReports.map((report) => (
              <ActivityItem
                key={getReportId(report)}
                icon={AlertCircle}
                title={`Report ${getReportId(report)}`}
                description={getReportContent(report) || 'System report'}
                status={getReportStatus(report)}
                priority={getReportStatus(report) === 'pending' ? 'high' : 'normal'}
              />
            )) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recent reports</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}