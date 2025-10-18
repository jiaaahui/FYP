import { useAuth } from '../contexts/AuthContext';

// 🌐 Base API URL (use environment variable for flexibility)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// =======================
// 🔒 useApi() Hook
// =======================
export function useApi() {
  const { getIdToken } = useAuth();

  // --- Helper: fetch with optional auth ---
  const fetchWithAuth = async (endpoint, options = {}) => {
    const token = await getIdToken?.();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('Content-Type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(data?.error || response.statusText || 'API request failed');
    }

    return data;
  };

  // --- Generic methods ---
  const get = (endpoint) => fetchWithAuth(endpoint, { method: 'GET' });
  const post = (endpoint, body) =>
    fetchWithAuth(endpoint, { method: 'POST', body: JSON.stringify(body) });
  const put = (endpoint, body) =>
    fetchWithAuth(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  const remove = (endpoint) => fetchWithAuth(endpoint, { method: 'DELETE' });

  // --- User endpoints (example) ---
  const getUserProfile = () => get('/user/profile');
  const updateUserProfile = (profileData) => post('/user/profile', profileData);

  // --- Public or protected data examples ---
  const getPublicData = () => get('/public');
  const getProtectedData = () => get('/protected');

  return {
    get,
    post,
    put,
    remove,
    getUserProfile,
    updateUserProfile,
    getPublicData,
    getProtectedData,
  };
}

// =======================
// Entity CRUD Helpers
// =======================

const apiHelper = {
  list: (path) => fetch(`${API_BASE_URL}/${path}`).then((r) => r.json()),
  create: (path, data) =>
    fetch(`${API_BASE_URL}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  update: (path, id, data) =>
    fetch(`${API_BASE_URL}/${path}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  remove: (path, id) =>
    fetch(`${API_BASE_URL}/${path}/${id}`, {
      method: 'DELETE',
    }).then((r) => r.json()),
};

// =======================
// Prisma-backed Models
// =======================

export const building = {
  list: () => apiHelper.list('building'),
  create: (data) => apiHelper.create('building', data),
  update: (id, data) => apiHelper.update('building', id, data),
  remove: (id) => apiHelper.remove('building', id),
};

export const zone = {
  list: () => apiHelper.list('zone'),
  create: (data) => apiHelper.create('zone', data),
  update: (id, data) => apiHelper.update('zone', id, data),
  remove: (id) => apiHelper.remove('zone', id),
};

export const employee = {
  list: () => apiHelper.list('employee'),
  create: (data) => apiHelper.create('employee', data),
  update: (id, data) => apiHelper.update('employee', id, data),
  remove: (id) => apiHelper.remove('employee', id),
};

export const team = {
  list: () => apiHelper.list('team'),
  create: (data) => apiHelper.create('team', data),
  update: (id, data) => apiHelper.update('team', id, data),
  remove: (id) => apiHelper.remove('team', id),
};

export const truck = {
  list: () => apiHelper.list('truck'),
  create: (data) => apiHelper.create('truck', data),
  update: (id, data) => apiHelper.update('truck', id, data),
  remove: (id) => apiHelper.remove('truck', id),
};

export const customer = {
  list: () => apiHelper.list('customer'),
  create: (data) => apiHelper.create('customer', data),
  update: (id, data) => apiHelper.update('customer', id, data),
  remove: (id) => apiHelper.remove('customer', id),
};

export const product = {
  list: () => apiHelper.list('product'),
  create: (data) => apiHelper.create('product', data),
  update: (id, data) => apiHelper.update('product', id, data),
  remove: (id) => apiHelper.remove('product', id),
};

export const orders = {
  list: () => apiHelper.list('orders'),
  create: (data) => apiHelper.create('orders', data),
  update: (id, data) => apiHelper.update('orders', id, data),
  remove: (id) => apiHelper.remove('orders', id),
};

export const lorrytrip = {
  list: () => apiHelper.list('lorrytrip'),
  create: (data) => apiHelper.create('lorrytrip', data),
  update: (id, data) => apiHelper.update('lorrytrip', id, data),
  remove: (id) => apiHelper.remove('lorrytrip', id),
};

export const routingcache = {
  list: () => apiHelper.list('routingcache'),
  create: (data) => apiHelper.create('routingcache', data),
  update: (id, data) => apiHelper.update('routingcache', id, data),
  remove: (id) => apiHelper.remove('routingcache', id),
};

export const timeslot = {
  list: () => apiHelper.list('timeslot'),
  create: (data) => apiHelper.create('timeslot', data),
  update: (id, data) => apiHelper.update('timeslot', id, data),
  remove: (id) => apiHelper.remove('timeslot', id),
};

// =======================
// Default export
// =======================
export default {
  useApi,
  building,
  zone,
  employee,
  team,
  truck,
  customer,
  product,
  orders,
  lorrytrip,
  routingcache,
  timeslot,
};
