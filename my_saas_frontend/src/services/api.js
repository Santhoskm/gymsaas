
// src/services/api.js
// ─────────────────────────────────────────────────────────────────────────────
// Central API service — all backend calls go through here.
// Base URL is read from .env so you never hardcode an IP again.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Attach JWT token to every request automatically
function getHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

// Generic request handler — handles errors in one place
async function request(method, path, body = null) {
    const options = {
        method,
        headers: getHeaders(),
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${BASE_URL}${path}`, options);

    // Token expired — force logout
    if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
    }

    if (response.status === 204) return null; // DELETE success

    const data = await response.json();

    if (!response.ok) {
        // Extract error message from DRF error format
        const message =
            data?.detail ||
            data?.message ||
            Object.values(data || {}).flat().join(', ') ||
            'Something went wrong';
        throw new Error(message);
    }

    return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
    login: (username, password) =>
        request('POST', '/api/login/', { username, password }),
    logout: (refresh) =>
        request('POST', '/api/logout/', { refresh }),
    me: () =>
        request('GET', '/api/me/'),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardAPI = {
    getStats: () => request('GET', '/api/dashboard/'),
};

// ── Clients ───────────────────────────────────────────────────────────────────
export const clientsAPI = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request('GET', `/api/clients/${query ? '?' + query : ''}`);
    },
    get: (id) => request('GET', `/api/clients/${id}/`),
    create: (data) => request('POST', '/api/clients/', data),
    update: (id, data) => request('PUT', `/api/clients/${id}/`, data),
    delete: (id) => request('DELETE', `/api/clients/${id}/`),
    addPayment: (clientId, data) =>
        request('POST', `/api/clients/${clientId}/payments/`, data),
};

// ── Packages ──────────────────────────────────────────────────────────────────
export const packagesAPI = {
    list: () => request('GET', '/api/clients/packages/'),
    create: (data) => request('POST', '/api/clients/packages/', data),
    update: (id, data) => request('PUT', `/api/clients/packages/${id}/`, data),
    delete: (id) => request('DELETE', `/api/clients/packages/${id}/`),
};

// ── Trainers ──────────────────────────────────────────────────────────────────
export const trainersAPI = {
    list: () => request('GET', '/api/trainers/'),
    get: (id) => request('GET', `/api/trainers/${id}/`),
    create: (data) => request('POST', '/api/trainers/', data),
    update: (id, data) => request('PUT', `/api/trainers/${id}/`, data),
    delete: (id) => request('DELETE', `/api/trainers/${id}/`),
};

// ── Activities ────────────────────────────────────────────────────────────────
export const activitiesAPI = {
    list: () => request('GET', '/api/activities/'),
    create: (data) => request('POST', '/api/activities/', data),
    update: (id, data) => request('PUT', `/api/activities/${id}/`, data),
    delete: (id) => request('DELETE', `/api/activities/${id}/`),
};

// ── Expenses ──────────────────────────────────────────────────────────────────
export const expensesAPI = {
    list: (month = null) =>
        request('GET', `/api/expenses/${month ? '?month=' + month : ''}`),
    create: (data) => request('POST', '/api/expenses/', data),
    delete: (id) => request('DELETE', `/api/expenses/${id}/`),
};