import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/admin/dashboard/Overview';
// import InstallerDashboard from './components/InstallerDashboard';
// import DeliveryDashboard from './components/DeliveryDashboard';
// import WarehouseDashboard from './components/WarehouseDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* <Route 
            path="/installer-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['installer']}>
                <InstallerDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/delivery-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['delivery team']}>
                <DeliveryDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/warehouse-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['warehouse loader team']}>
                <WarehouseDashboard />
              </ProtectedRoute>
            } 
          /> */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
