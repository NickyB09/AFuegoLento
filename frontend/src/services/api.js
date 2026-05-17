const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

async function parseResponse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.message || 'Request failed');
    error.status = response.status;
    error.details = body.errors || null;
    throw error;
  }
  return body;
}

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  return parseResponse(response);
}

export const api = {
  getContent: () => apiFetch('/content'),
  getMenu: () => apiFetch('/menu'),
  getTableTypes: () => apiFetch('/reservations/table-types'),

  register: (payload) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  forgotPassword: (payload) => apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify(payload) }),
  resetPassword: (payload) => apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),
  refresh: (payload) => apiFetch('/auth/refresh', { method: 'POST', body: JSON.stringify(payload) }),
  logout: (payload) => apiFetch('/auth/logout', { method: 'POST', body: JSON.stringify(payload) }),
  me: (token) => apiFetch('/auth/me', { token }),
  updateMe: (token, payload) => apiFetch('/users/me', { method: 'PATCH', token, body: JSON.stringify(payload) }),

  createReservation: (token, payload) => apiFetch('/reservations', { method: 'POST', token, body: JSON.stringify(payload) }),
  updateReservation: (token, id, payload) => apiFetch(`/reservations/${id}`, { method: 'PATCH', token, body: JSON.stringify(payload) }),
  updateReservationStatus: (token, id, payload) => apiFetch(`/reservations/${id}/status`, { method: 'PATCH', token, body: JSON.stringify(payload) }),
  myReservations: (token) => apiFetch('/reservations/mine', { token }),
  cancelReservation: (token, id) => apiFetch(`/reservations/${id}/cancel`, { method: 'PATCH', token }),
  adminReservations: (token) => apiFetch('/reservations/admin', { token }),

  adminMenu: (token) => apiFetch('/menu/admin', { token }),
  createCategory: (token, payload) => apiFetch('/menu/categories', { method: 'POST', token, body: JSON.stringify(payload) }),
  updateCategory: (token, id, payload) => apiFetch(`/menu/categories/${id}`, { method: 'PATCH', token, body: JSON.stringify(payload) }),
  deleteCategory: (token, id) => apiFetch(`/menu/categories/${id}`, { method: 'DELETE', token }),
  createExperience: (token, payload) => apiFetch('/menu/experiences', { method: 'POST', token, body: JSON.stringify(payload) }),
  updateExperience: (token, id, payload) => apiFetch(`/menu/experiences/${id}`, { method: 'PATCH', token, body: JSON.stringify(payload) }),
  deleteExperience: (token, id) => apiFetch(`/menu/experiences/${id}`, { method: 'DELETE', token }),
  createItem: (token, payload) => apiFetch('/menu/items', { method: 'POST', token, body: JSON.stringify(payload) }),
  updateItem: (token, id, payload) => apiFetch(`/menu/items/${id}`, { method: 'PATCH', token, body: JSON.stringify(payload) }),
  deleteItem: (token, id) => apiFetch(`/menu/items/${id}`, { method: 'DELETE', token }),
};
