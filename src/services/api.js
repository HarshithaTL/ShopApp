import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const PORT = 3000;

// On a phone, `localhost` is the phone itself, so the json-server running on
// the dev machine is unreachable. Expo exposes the machine hosting Metro as
// `hostUri` (e.g. "192.168.0.114:8081"); reuse that host with the API port.
const resolveBaseUrl = () => {
  if (Platform.OS === 'web') return `http://localhost:${PORT}`;

  const hostUri =
    Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost ?? '';
  const host = hostUri.split(':')[0];

  return host ? `http://${host}:${PORT}` : `http://localhost:${PORT}`;
};

const BASE_URL = resolveBaseUrl();

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const getProductsByCategory = async (category) => {
  const response = await api.get(`/products?category=${encodeURIComponent(category)}`);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const searchProducts = async (query) => {
  const response = await api.get(`/products?name_like=${encodeURIComponent(query)}`);
  return response.data;
};

export const placeOrder = async (orderData) => {
  const response = await api.post('/orders', {
    ...orderData,
    createdAt: new Date().toISOString(),
    status: 'confirmed',
    transactionId: 'TXN' + Math.random().toString(36).substring(2, 10).toUpperCase(),
  });
  return response.data;
};

export default api;
