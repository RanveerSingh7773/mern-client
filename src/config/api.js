// API Base URL - uses environment variable in production, falls back to live Render backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mern-back-a2r1.onrender.com';

export default API_BASE_URL;
