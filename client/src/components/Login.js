import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);

      const employeesRef = collection(db, 'Employee');
      const q = query(employeesRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('No employee found with this email address');
        setLoading(false);
        return;
      }

      const employeeDoc = querySnapshot.docs[0];
      const employeeData = employeeDoc.data();

      if (!employeeData.active_flag) {
        setError('This employee account has been deactivated');
        setLoading(false);
        return;
      }

      if (employeeData.password !== password) {
        setError('Invalid password');
        setLoading(false);
        return;
      }

      sessionStorage.setItem('employeeData', JSON.stringify(employeeData));
      sessionStorage.setItem('employeeRole', employeeData.role);
      sessionStorage.setItem('employeeId', employeeData.EmployeeID);
      sessionStorage.setItem('employeeName', employeeData.name);
      sessionStorage.setItem('employeeEmail', employeeData.email);
      sessionStorage.setItem('isAuthenticated', 'true');

      const role = employeeData.role.toLowerCase().trim();
      if (role === 'admin') navigate('/dashboard');
      else if (role === 'installer') navigate('/installer-dashboard');
      else if (role === 'delivery team') navigate('/delivery-dashboard');
      else if (role === 'warehouse loader team') navigate('/warehouse-dashboard');
      else navigate('/employee-dashboard');

    } catch (err) {
      setError('Failed to sign in: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Employee Login
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your employee email"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="text-center mt-4 text-gray-500 text-sm">
          For employee access only
        </div>
      </div>
    </div>
  );
}

export default Login;
