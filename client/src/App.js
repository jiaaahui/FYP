// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './contexts/AuthContext';
// import Signup from './components/Signup';
// import Login from './components/Login';
// import InformationDashboard from './components/InformationDashboard';
// import ProtectedRoute from './components/ProtectedRoute';
// import './App.css';

// function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <div className="app-container">
//           <Routes>
//             {/* Auth Routes */}
//             <Route path="/signup" element={<Signup />} />
//             <Route path="/login" element={<Login />} />
            
//             {/* Protected Routes */}
//             <Route element={<ProtectedRoute />}>
//               <Route path="/infoDashboard" element={<InformationDashboard />} />
//               {/* Add more protected routes here */}
//             </Route>
            
//             {/* Default Route */}
//             <Route path="/" element={<Navigate to="/infoDashboard" replace />} />
//           </Routes>
//         </div>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;

import React from 'react';
import CalendarView from './CalendarView';

export default function App() {
  return (
    <div style={{ padding: '1rem', background: '#f0f4f8' }}>
      <h1 style={{ textAlign: 'center', color: '#007bff' }}>FYP Scheduling Calendar</h1>
      <CalendarView />
    </div>
  );
}

