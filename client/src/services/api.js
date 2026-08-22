const API_BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('globetrotter_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred while communicating with the server');
  }

  return data;
}

export const api = {
  // Auth
  register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  demoLogin: (role) => request('/auth/demo-login', { method: 'POST', body: { role } }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email } }),
  getMe: () => request('/auth/me'),

  // Trips
  getTrips: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/trips${query ? `?${query}` : ''}`);
  },
  getTrip: (id) => request(`/trips/${id}`),
  createTrip: (tripData) => request('/trips', { method: 'POST', body: tripData }),
  updateTrip: (id, tripData) => request(`/trips/${id}`, { method: 'PUT', body: tripData }),
  deleteTrip: (id) => request(`/trips/${id}`, { method: 'DELETE' }),
  duplicateTrip: (id) => request(`/trips/${id}/duplicate`, { method: 'POST' }),

  // Stops
  addStop: (tripId, stopData) => request(`/trips/${tripId}/stops`, { method: 'POST', body: stopData }),
  updateStop: (stopId, stopData) => request(`/trips/stops/${stopId}`, { method: 'PUT', body: stopData }),
  deleteStop: (stopId) => request(`/trips/stops/${stopId}`, { method: 'DELETE' }),
  reorderStops: (tripId, stopIds) => request(`/trips/${tripId}/stops/reorder`, { method: 'POST', body: { stopIds } }),

  // Activities
  addActivity: (activityData) => request('/trips/activities', { method: 'POST', body: activityData }),
  updateActivity: (activityId, activityData) => request(`/trips/activities/${activityId}`, { method: 'PUT', body: activityData }),
  deleteActivity: (activityId) => request(`/trips/activities/${activityId}`, { method: 'DELETE' }),

  // Cities & Activities Explorer
  getCities: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/cities${query ? `?${query}` : ''}`);
  },
  getCity: (id) => request(`/cities/${id}`),
  getPopularCities: (limit = 6) => request(`/cities/popular?limit=${limit}`),
  getActivities: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/activities${query ? `?${query}` : ''}`);
  },
  getActivity: (id) => request(`/activities/${id}`),

  // Budget
  getTripBudget: (tripId) => request(`/budget/${tripId}`),

  // Sharing
  getPublicTrip: (token) => request(`/share/${token}`),
  clonePublicTrip: (token) => request(`/share/${token}/clone`, { method: 'POST' }),

  // Profile
  getProfile: () => request('/profile'),
  updateProfile: (profileData) => request('/profile', { method: 'PUT', body: profileData }),
  toggleSavedDestination: (city_id) => request('/profile/save-destination', { method: 'POST', body: { city_id } }),
  changePassword: (data) => request('/profile/change-password', { method: 'POST', body: data }),
  deleteAccount: () => request('/profile/delete-account', { method: 'DELETE' }),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: () => request('/admin/users'),
  toggleUserRole: (userId) => request(`/admin/users/${userId}/toggle-role`, { method: 'POST' }),
  deleteAdminUser: (userId) => request(`/admin/users/${userId}`, { method: 'DELETE' }),
};
