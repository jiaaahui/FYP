import React, { useState } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';// Update this path to match your file structure
import {
  Home,
  Users,
  Settings,
  BarChart3,
  FileText,
  ShoppingCart,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search,
  User,
  Calendar,
  LogOut
} from 'lucide-react';
import Overview from './admin/dashboard/Overview';
import EmployeeInfo from './admin/info/EmployeeInfo';
import BuildingInfo from './admin/info/BuildingInfo';
import ProductInfo from './admin/info/ProductInfo';
import TruckInfo from './admin/info/TruckInfo';
import TruckZoneInfo from './admin/info/TruckZoneInfo';
import TeamInfo from './admin/info/TeamInfo';
import Report from './admin/Report';
import Schedule from './admin/Schedule';
import Performance from './admin/dashboard/Performance';
import EmployeePerformance from './admin/dashboard/EmployeePerformance';
import OrderPerformance from './admin/dashboard/OrderPerformance';
import RoleAccessControl from './admin/access/accessControl';
import DeliverySchedule from './delivery/DelSchedule';
import DummySchedulerPage from './delivery/Scheduler';
import InstallationSchedule from './installer/InsSchedule';
import WarehouseLoadingSchedule from './warehouse/truckSchedule';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth(); // Get currentUser and logout from AuthContext
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigationData = {
    // dashboard: {
    //   title: 'Dashboard',
    //   icon: Home,
    //   route: '/dashboard',
    //   topNavItems: [
    //     { id: 'overview', label: 'Overview', path: 'overview', component: Overview },
    //     { id: 'employee-performance', label: 'Employee Performance', path: 'employee-performance', component: EmployeePerformance },
    //     { id: 'orders', label: 'Orders', path: 'order', component: OrderPerformance },
    //     // { id: 'overall', label: 'Overall', path: 'overall', component: Performance },
    //   ]
    // },
    // documents: {
    //   title: 'Schedule',
    //   icon: Calendar,
    //   route: '/schedule',
    //   topNavItems: [
    //     { id: 'schedule', label: 'Schedule', path: 'schedule', component: Schedule },
    //   ]
    // },
    products: {
      title: 'Information',
      icon: FileText,
      route: '/info',
      topNavItems: [
        { id: 'employee', label: 'Employee', path: 'employee', component: EmployeeInfo },
        // { id: 'team', label: 'Team', path: 'team', component: TeamInfo },
        // { id: 'building', label: 'Building', path: 'building', component: BuildingInfo },
        // { id: 'product', label: 'Product', path: 'product', component: ProductInfo },
        // { id: 'truck', label: 'Truck', path: 'truck', component: TruckInfo },
        // { id: 'truckzone', label: 'TruckZone', path: 'truckzone', component: TruckZoneInfo },
      ]
    },
    // users: {
    //   title: 'Report',
    //   icon: Users,
    //   route: '/report',
    //   topNavItems: [
    //     { id: 'report', label: 'Report', path: 'report', component: Report },
    //   ]
    // },
    // access: {
    //   title: 'Access Control',
    //   icon: Users,
    //   route: '/access',
    //   topNavItems: [
    //     { id: 'access', label: 'Access Control', path: 'access', component: RoleAccessControl },
    //   ]
    // },
    // delivery: {
    //   title: 'Delivery Schedule',
    //   icon: Users,
    //   route: '/delivery',
    //   topNavItems: [
    //     { id: 'delivery', label: 'Delivery Schedule', path: 'delivery', component: DeliverySchedule },
    //     // { id: 'scheduler', label: 'Auto Scheduler', path: 'scheduler', component: DummySchedulerPage },
    //   ]
    // },
    // installation: {
    //   title: 'Installation Schedule',
    //   icon: Users,
    //   route: '/installation',
    //   topNavItems: [
    //     { id: 'installation', label: 'Installation Schedule', path: 'installation', component: InstallationSchedule },
    //   ]
    // },
    // warehouse: {
    //   title: 'Warehouse Schedule',
    //   icon: Users,
    //   route: '/warehouse',
    //   topNavItems: [
    //     { id: 'warehouse', label: 'Warehouse Schedule', path: 'warehouse', component: WarehouseLoadingSchedule },
    //   ]
    // },
    // settings: {
    //   title: 'Settings',
    //   icon: Settings,
    //   route: '/settings',
    //   topNavItems: [
    //     { id: 'general', label: 'General', path: 'general' },
    //     { id: 'security', label: 'Security', path: 'security' },
    //     { id: 'notifications', label: 'Notifications', path: 'notifications' },
    //     { id: 'integrations', label: 'Integrations', path: 'integrations' }
    //   ]
    // },
  };

  const [topNavActive, setTopNavActive] = useState('overview');

  // Handle logout function
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleSideNavClick = (sectionKey) => {
    setActiveSection(sectionKey);
    const section = navigationData[sectionKey];
    if (section.route) {
      navigate(section.route);
    }
    const firstItem = section.topNavItems[0];
    setTopNavActive(firstItem.id);
  };

  const currentSection = navigationData[activeSection];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Fixed Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 ease-in-out border-r border-gray-200 flex flex-col flex-shrink-0`}>
        {/* Sidebar Header - Fixed */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          {isSidebarOpen && (
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold text-gray-800 truncate">TBMDelivery</span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation Items - Scrollable if needed */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <div className="space-y-2">
            {Object.entries(navigationData).map(([key, item]) => {
              const IconComponent = item.icon;
              const isActive = activeSection === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSideNavClick(key)}
                  className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                >
                  <IconComponent
                    size={20}
                    className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`}
                  />
                  {isSidebarOpen && (
                    <>
                      <span className="ml-3 font-medium truncate">{item.title}</span>
                      <ChevronRight
                        size={16}
                        className={`ml-auto flex-shrink-0 transition-transform ${isActive ? 'rotate-90 text-white' : 'text-gray-400 group-hover:text-blue-600'
                          }`}
                      />
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Fixed Top Navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          {/* Header with Title and User Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-800 truncate min-w-0">{currentSection.title}</h1>
            <div className="flex items-center space-x-4 flex-shrink-0">
              {/* User Profile Button with current user info */}
              <div className="flex items-center space-x-2 p-2 text-gray-700 rounded-lg">
                <User size={20} className="flex-shrink-0" />
                <span className="hidden md:block font-medium">
                  {currentUser?.displayName || currentUser?.email || 'User'}
                </span>
              </div>
              
              {/* Logout Button in Header (Alternative placement) */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 p-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={20} className="flex-shrink-0" />
                <span className="hidden lg:block font-medium">Logout</span>
              </button>
            </div>
          </div>

          {/* Pretty Navigation Tabs */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {currentSection.topNavItems.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setTopNavActive(tab.id);
                        navigate(`${currentSection.route}/${tab.path}`);
                      }}
                      className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${topNavActive === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      {Icon && <Icon className="h-4 w-4 mr-2" />}
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-2">
            <Routes>
              {Object.entries(navigationData).flatMap(([sectionKey, section]) =>
                section.topNavItems.map((item) =>
                  item.component ? (
                    <Route
                      key={`${section.route}/${item.path}`}
                      path={`${section.route}/${item.path}`}
                      element={<item.component />}
                    />
                  ) : null
                )
              )}
              {/* Default fallback routes */}
              <Route path="/" element={<Overview />} />
              <Route path="/dashboard" element={<Overview />} />
              <Route path="/info" element={<EmployeeInfo />} />
              <Route path="/report" element={<Report />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/access" element={<RoleAccessControl />} />
              <Route path="/warehouse" element={<WarehouseLoadingSchedule />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;