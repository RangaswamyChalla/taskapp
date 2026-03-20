import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001'
});

API.interceptors.request.use(c => {
  const t = localStorage.getItem('token');
  if (t) c.headers.Authorization = 'Bearer ' + t;
  return c;
});

API.interceptors.response.use(r => r, e => {
  if (e.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.reload();
  }
  return Promise.reject(e);
});

export default API;
