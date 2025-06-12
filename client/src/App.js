import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Create placeholder components for other sections (you can replace these with your actual components)
const Users = () => <div className="bg-white rounded-lg shadow-sm p-6"><h2 className="text-2xl font-bold">Users Page</h2><p>Your users content here</p></div>;
const Products = () => <div className="bg-white rounded-lg shadow-sm p-6"><h2 className="text-2xl font-bold">Products Page</h2><p>Your products content here</p></div>;
const Analytics = () => <div className="bg-white rounded-lg shadow-sm p-6"><h2 className="text-2xl font-bold">Analytics Page</h2><p>Your analytics content here</p></div>;
const Documents = () => <div className="bg-white rounded-lg shadow-sm p-6"><h2 className="text-2xl font-bold">Documents Page</h2><p>Your documents content here</p></div>;
const Settings = () => <div className="bg-white rounded-lg shadow-sm p-6"><h2 className="text-2xl font-bold">Settings Page</h2><p>Your settings content here</p></div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-container">
          <Routes>
            {/* Auth Routes */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes with Navigation Layout */}
            {/* <Route element={<ProtectedRoute />}> */}
            <Route>
              <Route path="/dashboard" element={
                <Layout>
                  <Dashboard />
                </Layout>
              } />
              <Route path="/users" element={
                <Layout>
                  <Users />
                </Layout>
              } />
              <Route path="/products" element={
                <Layout>
                  <Products />
                </Layout>
              } />
              <Route path="/analytics" element={
                <Layout>
                  <Analytics />
                </Layout>
              } />
              <Route path="/documents" element={
                <Layout>
                  <Documents />
                </Layout>
              } />
              <Route path="/settings" element={
                <Layout>
                  <Settings />
                </Layout>
              } />
            </Route>
            
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;