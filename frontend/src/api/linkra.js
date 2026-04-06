import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000',
});

// Automatically attach JWT token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getLinks = () => API.get('/links/');
export const createLink = (data) => API.post('/links/', data);
export const deleteLink = (id) => API.delete(`/links/${id}`);
export const loginUser = (credentials) => {
    return API.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
    });
};
export const registerUser = (data) => API.post('/auth/register', data);

export const getAnalyticsOverview = () => API.get('/analytics/overview');

export const getLinkAnalytics = (id) => API.get(`/analytics/${id}`);