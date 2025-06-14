import React, { useState } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
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
  User
} from 'lucide-react';
import Dashboard from './Dashboard';
import EmployeeInfo from './admin/info/EmployeeInfo';
import Test1 from './Test1';
import Test2 from './Test2';
import BuildingInfo from './admin/info/BuildingInfo';
import ProductInfo from './admin/info/ProductInfo'; 
import TruckInfo from './admin/info/TruckInfo';
import TruckZoneInfo from './admin/info/TruckZoneInfo';
import TeamInfo from './admin/info/TeamInfo';
import Report from './admin/Report';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigationData = {
    dashboard: {
      title: 'Dashboard',
      icon: Home,
      route: '/dashboard',
      topNavItems: [
        { id: 'overview', label: 'Overview', path: 'overview', component: Dashboard },
        { id: 'analytics', label: 'Analytics', path: 'analytics', component: Test2 },
        { id: 'reports', label: 'Reports', path: 'reports', component: Test1 }
      ]
    },
    products: {
      title: 'Information',
      icon: ShoppingCart,
      route: '/info',
      topNavItems: [
        { id: 'employee', label: 'Employee', path: 'employee', component: EmployeeInfo },
        { id: 'team', label: 'Team', path: 'team', component: TeamInfo },
        { id: 'building', label: 'Building', path: 'building', component: BuildingInfo },
        { id: 'product', label: 'Product', path: 'product', component: ProductInfo },
        { id: 'truck', label: 'Truck', path: 'truck', component: TruckInfo },
        { id: 'truckzone', label: 'TruckZone', path: 'truckzone', component: TruckZoneInfo },
      ]
    },
    users: {
      title: 'Report',
      icon: Users,
      route: '/report',
      topNavItems: [
        { id: 'report', label: 'Report', path: 'report', component: Report },
      ]
    },
    documents: {
      title: 'Documents',
      icon: FileText,
      route: '/documents',
      topNavItems: [
        { id: 'all-docs', label: 'All Documents', path: 'all-docs' },
        { id: 'templates', label: 'Templates', path: 'templates' },
        { id: 'shared', label: 'Shared', path: 'shared' },
        { id: 'archive', label: 'Archive', path: 'archive' }
      ]
    },
    settings: {
      title: 'Settings',
      icon: Settings,
      route: '/settings',
      topNavItems: [
        { id: 'general', label: 'General', path: 'general' },
        { id: 'security', label: 'Security', path: 'security' },
        { id: 'notifications', label: 'Notifications', path: 'notifications' },
        { id: 'integrations', label: 'Integrations', path: 'integrations' }
      ]
    },
    testing: {
      title: 'Testing',
      icon: BarChart3,
      route: '/testing',
      topNavItems: [
        { id: 'test1', label: 'Test 1', path: 'test1', component: Test1 },
        { id: 'test2', label: 'Test 2', path: 'test2', component: Test2 }
      ]
    }
  };

  const [topNavActive, setTopNavActive] = useState('overview');

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
                  className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
                    isActive 
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
                        className={`ml-auto flex-shrink-0 transition-transform ${
                          isActive ? 'rotate-90 text-white' : 'text-gray-400 group-hover:text-blue-600'
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
              {/* Notification Button */}
              <button className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              {/* User Profile Button */}
              <button className="flex items-center space-x-2 p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <User size={20} className="flex-shrink-0" />
                <span className="hidden md:block font-medium">John Doe</span>
              </button>
            </div>
          </div>

          {/* Top Navigation Buttons - Scrollable horizontally if needed */}
          <div className="px-4 py-2 overflow-x-auto">
            <nav className="flex space-x-1 min-w-max">
              {currentSection.topNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setTopNavActive(item.id);
                    navigate(`${currentSection.route}/${item.path}`);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                    topNavActive === item.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
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
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/info" element={<EmployeeInfo />} />
              <Route path="/report" element={<Report />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;