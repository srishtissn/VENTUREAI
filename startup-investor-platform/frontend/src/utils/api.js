import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('ventureai_user') || '{}');
  if (user.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});
api.interceptors.response.use((res) => res, (err) => {
  if (err.response?.status === 401) { localStorage.removeItem('ventureai_user'); window.location.href = '/login'; }
  return Promise.reject(err);
});
export default api;
export const authAPI = {
  register: (d) => api.post('/auth/register', d),
  login: (d) => api.post('/auth/login', d),
  getMe: () => api.get('/auth/me'),
  updateProfile: (d) => api.put('/auth/profile', d),
  mentalHealthCheckin: (d) => api.post('/auth/mental-health', d),
};
export const startupAPI = {
  list: (p) => api.get('/startups', { params: p }),
  create: (d) => api.post('/startups', d),
  get: (id) => api.get(`/startups/${id}`),
  update: (id, d) => api.put(`/startups/${id}`, d),
  myStartups: () => api.get('/startups/my/startups'),
  getCompetition: (id) => api.get(`/startups/${id}/competition`),
  analyzePitch: (id, d) => api.post(`/startups/${id}/analyze-video`, d),
};
export const investorAPI = {
  list: (p) => api.get('/investors', { params: p }),
  get: (id) => api.get(`/investors/${id}`),
  myProfile: () => api.get('/investors/my/profile'),
  updateProfile: (d) => api.put('/investors/my/profile', d),
};
export const matchAPI = {
  getStartupInvestors: (id) => api.get(`/matching/startup/${id}/investors`),
  getInvestorStartups: () => api.get('/matching/investor/startups'),
  swipe: (d) => api.post('/matching/swipe', d),
  startupLike: (d) => api.post('/matching/startup-like', d),
  myMatches: () => api.get('/matching/my-matches'),
  cofounders: (id) => api.get(`/matching/cofounders/${id}`),
};
export const analyticsAPI = {
  sectors: () => api.get('/analytics/sectors'),
  overview: () => api.get('/analytics/overview'),
  sectorDetail: (s) => api.get(`/analytics/sector/${s}`),
  simulation: (p) => api.get('/analytics/simulation', { params: p }),
};
export const comparisonAPI = { compare: (ids) => api.post('/comparison/startups', { startupIds: ids }) };
export const chatAPI = {
  getRoom: (id) => api.get(`/chat/${id}`),
  createRoom: (d) => api.post('/chat/create', d),
  myRooms: () => api.get('/chat/my/rooms'),
  updateDeal: (id, d) => api.post(`/chat/${id}/deal`, d),
};
export const learningAPI = { list: (p) => api.get('/learning', { params: p }), like: (id) => api.post(`/learning/${id}/like`) };
