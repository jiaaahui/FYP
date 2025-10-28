import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home, Users, FileText, Menu, X, ChevronRight, User, Calendar, LogOut
} from 'lucide-react';
import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';


// Admin pages
import Overview from './admin/dashboard/Overview';
import EmployeeInfo from './admin/info/EmployeeInfo';
import BuildingInfo from './admin/info/BuildingInfo';
import ProductInfo from './admin/info/ProductInfo';
import TruckInfo from './admin/info/TruckInfo';
import TruckZoneInfo from './admin/info/TruckZoneInfo';
import TeamInfo from './admin/info/TeamInfo';
import Cases from './admin/Cases';
import Schedule from './admin/Schedule';
import EmployeePerformance from './admin/dashboard/EmployeePerformance';
import OrderPerformance from './admin/dashboard/OrderPerformance';
import RoleAccessControl from './admin/access/accessControl';
import AutoScheduleReview from './admin/schedule/AutoScheduleReview';


// Other roles
import DeliverySchedule from './delivery/DelSchedule';
import InstallationSchedule from './installer/InsSchedule';
import WarehouseLoadingSchedule from './warehouse/truckSchedule';
import { signOut } from 'firebase/auth';


// ===============================
// Helper: Fetch permissions for role
// ===============================
async function fetchRolePermissions(roleName) {
  if (!roleName) return [];
  try {
    const rolesRef = collection(db, 'Roles');
    // try to match name (some documents use generated id, some use name field)
    const q = query(rolesRef, where('name', '==', roleName.trim().toLowerCase()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];
    const data = snapshot.docs[0].data();
    return data.permissions || [];
  } catch (err) {
    console.error('Error fetching role permissions:', err);
    return [];
  }
}


const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const [activeSection, setActiveSection] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  const [topNavActive, setTopNavActive] = useState('');

  // ===============================
  // Navigation structure
  // ===============================
  const navigationData = {
    dashboard: {
      title: 'Dashboard',
      icon: Home,
      route: '/dashboard',
      topNavItems: [
        { id: 'overview', label: 'Overview', path: 'overview', component: Overview },
        { id: 'employee-performance', label: 'Employee Performance', path: 'employee-performance', component: EmployeePerformance },
        { id: 'orders', label: 'Orders', path: 'order', component: OrderPerformance },
      ],
    },
    schedule: {
      title: 'Schedule',
      icon: Calendar,
      route: '/schedule',
      topNavItems: [
        { id: 'schedule', label: 'Schedule', path: 'schedule', component: Schedule },
        { id: 'auto-scheduler', label: 'Auto Scheduler', path: 'auto-scheduler', component: AutoScheduleReview },
      ],
    },
    info: {
      title: 'Information',
      icon: FileText,
      route: '/info',
      topNavItems: [
        { id: 'employee', label: 'Employee', path: 'employee', component: EmployeeInfo },
        { id: 'team', label: 'Team', path: 'team', component: TeamInfo },
        { id: 'building', label: 'Building', path: 'building', component: BuildingInfo },
        { id: 'product', label: 'Product', path: 'product', component: ProductInfo },
        { id: 'truck', label: 'Truck', path: 'truck', component: TruckInfo },
        { id: 'truckzone', label: 'TruckZone', path: 'truckzone', component: TruckZoneInfo },
      ],
    },
    cases: {
      title: 'Cases',
      icon: Users,
      route: '/cases',
      topNavItems: [
        { id: 'cases', label: 'Cases', path: 'cases', component: Cases },
      ],
    },
    access: {
      title: 'Access Control',
      icon: Users,
      route: '/access',
      topNavItems: [
        { id: 'access', label: 'Access Control', path: 'access', component: RoleAccessControl },
      ],
    },
    delivery: {
      title: 'Delivery Schedule',
      icon: Users,
      route: '/delivery',
      topNavItems: [
        { id: 'delivery', label: 'Delivery Schedule', path: 'delivery', component: DeliverySchedule },
      ],
    },
    installation: {
      title: 'Installation Schedule',
      icon: Users,
      route: '/installation',
      topNavItems: [
        { id: 'installation', label: 'Installation Schedule', path: 'installation', component: InstallationSchedule },
      ],
    },
    warehouse: {
      title: 'Warehouse Schedule',
      icon: Users,
      route: '/warehouse',
      topNavItems: [
        { id: 'warehouse', label: 'Warehouse Schedule', path: 'warehouse', component: WarehouseLoadingSchedule },
      ],
    },
  };


  // ===============================
  // Load permissions for current user
  // ===============================
  useEffect(() => {
    const loadPermissions = async () => {
      if (!currentUser) {
        setPermissions([]);
        setLoadingPermissions(false);
        return;
      }
      try {
        setLoadingPermissions(true);
        // Fetch employee record by email
        const empRef = collection(db, 'Employee');
        const q = query(empRef, where('email', '==', currentUser.email));
        const snap = await getDocs(q);

        if (snap.empty) {
          console.warn('No matching employee record found');
          setPermissions([]);
          return;
        }

        const empData = snap.docs[0].data();
        const roleName = (empData.role || '').trim().toLowerCase();

          const rolePermissions = await fetchRolePermissions(roleName);
          // normalize keys: if your Roles.permissions contain human labels, map them to navigation keys here as needed.
          setPermissions(rolePermissions.map(p => p));
      } catch (err) {
        console.error('Failed to load permissions:', err);
        setPermissions([]);
      } finally {
        setLoadingPermissions(false);
      }
    };
    loadPermissions();
  }, [currentUser]);


  // ===============================
  // Filter visible navigation
  // ===============================
  const filteredNavigation = useMemo(() => {
    // guard
    if (!Array.isArray(permissions) || permissions.length === 0) return [];
    // keep only navigation entries whose key is present in permissions
    return Object.entries(navigationData).filter(([key]) =>
      permissions.includes(key)
    );
  }, [permissions]);


  // ===============================
  // Navigation actions
  // ===============================
  const handleSideNavClick = (sectionKey) => {
    setActiveSection(sectionKey);
    const section = navigationData[sectionKey];
    if (section?.route) {
      // navigate to section base; Layout now provides a redirect route that will forward to the first top tab
      navigate(section.route);
    }
  };


  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };


  useEffect(() => {
    // auto-select first accessible tab after loading
    if (!loadingPermissions && filteredNavigation.length > 0 && !activeSection) {
      const [firstKey, firstSection] = filteredNavigation[0];
      setActiveSection(firstKey);
      navigate(firstSection.route);
    }
  }, [loadingPermissions, filteredNavigation, navigate, activeSection]);


  // ===============================
  // Loading screen
  // ===============================
  if (loadingPermissions) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading permissions...</div>
      </div>
    );
  }


  // ===============================
  // Layout rendering
  // ===============================
  const currentSection = navigationData[activeSection] || {};


  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 ease-in-out border-r border-gray-200 flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {isSidebarOpen && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold text-gray-800 truncate">TBMDelivery</span>
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <div className="space-y-2">
            {filteredNavigation.map(([key, item]) => {
              const Icon = item.icon;
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
                  <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`} />
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-800 truncate">{currentSection.title}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 p-2 text-gray-700 rounded-lg">
                <User size={20} />
                <span className="hidden md:block font-medium">{currentUser?.displayName || currentUser?.email || 'User'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 p-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={20} />
                <span className="hidden lg:block font-medium">Logout</span>
              </button>
            </div>
          </div>

          {/* Top Tabs */}
          {currentSection?.topNavItems && (
            <div className="max-w-7xl px-4 sm:px-6 lg:px-8 mt-2">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {currentSection.topNavItems.map((tab) => (
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
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}
        </div>

        {/* Main body routes */}
        <div className="flex-1 overflow-auto p-2">
          <Routes>
            {/*
              Add a redirect Route for each section base path -> first topNavItems child.
              This prevents "No routes matched location '/dashboard'" when navigating to the base path.
            */}
            {Object.entries(navigationData).map(([sectionKey, section]) => {
              const firstTop = section.topNavItems && section.topNavItems[0];
              const target = firstTop ? `${section.route}/${firstTop.path}` : section.route;
              return (
                <Route
                  key={`redirect-${section.route}`}
                  path={section.route}
                  element={<Navigate to={target} replace />}
                />
              );
            })}

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
            {/* Optionally add a root redirect to first allowed section */}
            {filteredNavigation.length > 0 && (
              <Route
                path="/"
                element={<Navigate to={filteredNavigation[0][1].route + '/' + (filteredNavigation[0][1].topNavItems?.[0]?.path || '')} replace />}
              />
            )}
          </Routes>
        </div>
      </div>
    </div>
  );
};


export default Layout;