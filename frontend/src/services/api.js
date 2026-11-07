import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 mins for large model inference
});

export const summarizeText = async (payload) => {
  const response = await api.post('/summarize', payload);
  return response.data;
};

export const summarizeExtractive = async (payload) => {
  const response = await api.post('/extractive', payload);
  return response.data;
};

export const uploadPdf = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload-pdf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const extractKeywords = async (payload) => {
  const response = await api.post('/keywords', payload);
  return response.data;
};

export const detectEntities = async (payload) => {
  const response = await api.post('/entities', payload);
  return response.data;
};

export const evaluateSummary = async (payload) => {
  const response = await api.post('/evaluate', payload);
  return response.data;
};

export const fetchHistory = async () => {
  const response = await api.get('/history');
  return response.data;
};

export const deleteHistoryItem = async (id) => {
  const response = await api.delete(`/history/${id}`);
  return response.data;
};

export const askDocument = async (question) => {
  const response = await api.post('/chat', { question });
  return response.data;
};

export const getChatStatus = async () => {
  const response = await api.get('/chat/status');
  return response.data;
};

export const resetChatSession = async () => {
  const response = await api.post('/chat/reset');
  return response.data;
};

export default api;
