import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Navigation structure with routes
  const navigationData = {
    dashboard: {
      title: 'Dashboard',
      icon: Home,
      route: '/dashboard',
      topNavItems: [
        { id: 'overview', label: 'Overview', active: true },
        { id: 'analytics', label: 'Analytics' },
        { id: 'reports', label: 'Reports' }
      ]
    },
    users: {
      title: 'Users',
      icon: Users,
      route: '/users',
      topNavItems: [
        { id: 'all-users', label: 'All Users', active: true },
        { id: 'active-users', label: 'Active Users' },
        { id: 'user-roles', label: 'User Roles' },
        { id: 'permissions', label: 'Permissions' }
      ]
    },
    products: {
      title: 'Products',
      icon: ShoppingCart,
      route: '/products',
      topNavItems: [
        { id: 'inventory', label: 'Inventory', active: true },
        { id: 'categories', label: 'Categories' },
        { id: 'pricing', label: 'Pricing' },
        { id: 'suppliers', label: 'Suppliers' }
      ]
    },
    analytics: {
      title: 'Analytics',
      icon: BarChart3,
      route: '/analytics',
      topNavItems: [
        { id: 'performance', label: 'Performance', active: true },
        { id: 'traffic', label: 'Traffic' },
        { id: 'conversions', label: 'Conversions' },
        { id: 'revenue', label: 'Revenue' }
      ]
    },
    documents: {
      title: 'Documents',
      icon: FileText,
      route: '/documents',
      topNavItems: [
        { id: 'all-docs', label: 'All Documents', active: true },
        { id: 'templates', label: 'Templates' },
        { id: 'shared', label: 'Shared' },
        { id: 'archive', label: 'Archive' }
      ]
    },
    settings: {
      title: 'Settings',
      icon: Settings,
      route: '/settings',
      topNavItems: [
        { id: 'general', label: 'General', active: true },
        { id: 'security', label: 'Security' },
        { id: 'notifications', label: 'Notifications' },
        { id: 'integrations', label: 'Integrations' }
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
    // Set the first item as active when switching sections
    const firstItem = section.topNavItems[0];
    setTopNavActive(firstItem.id);
  };

  const currentSection = navigationData[activeSection];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 ease-in-out border-r border-gray-200`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {isSidebarOpen && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-gray-800">Project</span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 px-3">
          {Object.entries(navigationData).map(([key, item]) => {
            const IconComponent = item.icon;
            const isActive = activeSection === key;
            
            return (
              <button
                key={key}
                onClick={() => handleSideNavClick(key)}
                className={`w-full flex items-center px-3 py-3 mb-2 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <IconComponent 
                  size={20} 
                  className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`}
                />
                {isSidebarOpen && (
                  <>
                    <span className="ml-3 font-medium">{item.title}</span>
                    <ChevronRight 
                      size={16} 
                      className={`ml-auto transition-transform ${
                        isActive ? 'rotate-90 text-white' : 'text-gray-400 group-hover:text-blue-600'
                      }`}
                    />
                  </>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          {/* Top Bar with Search and User Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-800">{currentSection.title}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              {/* User Profile */}
              <button className="flex items-center space-x-2 p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <User size={20} />
                <span className="hidden md:block font-medium">John Doe</span>
              </button>
            </div>
          </div>

          {/* Dynamic Sub Navigation */}
          <div className="px-6 py-3">
            <nav className="flex space-x-1">
              {currentSection.topNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTopNavActive(item.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
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

        {/* Content Area */}
        <div className="flex-1 p-6 bg-gray-50">
          {children || (
            <div className="bg-white rounded-lg shadow-sm p-6 h-full">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">
                  {React.createElement(currentSection.icon, { 
                    size: 64, 
                    className: "mx-auto text-blue-600" 
                  })}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {currentSection.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  Currently viewing: {currentSection.topNavItems.find(item => item.id === topNavActive)?.label}
                </p>
                <div className="text-sm text-gray-500">
                  Your content for this section would go here
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Layout;