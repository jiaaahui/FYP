// Client-side API helper: generated CRUD functions for all models.
// Usage:
//   import { app_user } from './api/generatedApi';
//   await app_user.list();
//   await app_user.get('some-id');
//   await app_user.create({ user_id: 'x', name: 'A' });
//   await app_user.update('x', { name: 'B' });
//   await app_user.remove('x');
//
// Set REACT_APP_API_BASE_URL to your server root in client .env, e.g.
// REACT_APP_API_BASE_URL=http://localhost:4000/api
const BASE = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, '');

function handleResponse(res) {
  if (res.status === 204) return null;
  if (!res.ok) {
    return res.json().then(body => {
      const err = new Error(body?.error || 'API error');
      err.status = res.status;
      err.body = body;
      throw err;
    }).catch(() => {
      const err = new Error('API error');
      err.status = res.status;
      throw err;
    });
  }
  return res.json();
}

function makeModelApi(modelName, pk) {
  const baseUrl = `${BASE}/${modelName}`;

  return {
    list: async () => {
      const res = await fetch(baseUrl);
      return handleResponse(res);
    },
    get: async (id) => {
      const res = await fetch(`${baseUrl}/${encodeURIComponent(id)}`);
      return handleResponse(res);
    },
    create: async (data) => {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    update: async (id, data) => {
      const res = await fetch(`${baseUrl}/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    remove: async (id) => {
      const res = await fetch(`${baseUrl}/${encodeURIComponent(id)}`, { method: 'DELETE' });
      return handleResponse(res);
    },
    // primary key field name
    pk,
  };
}

// Model -> primary key map (matches generated server routing)
export const app_user = makeModelApi('app_user', 'user_id');
export const building = makeModelApi('building', 'id');
export const chats = makeModelApi('chats', 'id');
export const customer = makeModelApi('customer', 'id');
export const employee = makeModelApi('employee', 'id');
export const employee_team_assignment = makeModelApi('employee_team_assignment', 'id');
export const employeeteamassignment = makeModelApi('employeeteamassignment', 'id');
export const lorry_trip = makeModelApi('lorry_trip', 'lorry_trip_id');
export const lorrytrip = makeModelApi('lorrytrip', 'id');
export const order_product = makeModelApi('order_product', 'id');
export const orderproduct = makeModelApi('orderproduct', 'id');
export const orders = makeModelApi('orders', 'id');
export const orders_rel = makeModelApi('orders_rel', 'order_id');
export const product = makeModelApi('product', 'id');
export const routing_cache = makeModelApi('routing_cache', 'id');
export const routingcache = makeModelApi('routingcache', 'id');
export const team = makeModelApi('team', 'id');
export const timeslot = makeModelApi('timeslot', 'id');
export const timeslot_order = makeModelApi('timeslot_order', 'id');
export const truck = makeModelApi('truck', 'id');
export const truck_zone = makeModelApi('truck_zone', 'id');
export const truckzone = makeModelApi('truckzone', 'id');
export const users = makeModelApi('users', 'id');
export const zone = makeModelApi('zone', 'id');

export default {
  app_user,
  building,
  chats,
  customer,
  employee,
  employee_team_assignment,
  employeeteamassignment,
  lorry_trip,
  lorrytrip,
  order_product,
  orderproduct,
  orders,
  orders_rel,
  product,
  routing_cache,
  routingcache,
  team,
  timeslot,
  timeslot_order,
  truck,
  truck_zone,
  truckzone,
  users,
  zone,
};