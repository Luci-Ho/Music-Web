import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export function apiFetch(path, options) {
  const url = path && path.startsWith('/') ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
  return fetch(url, options);
}

export const apiAxios = axios.create({ baseURL: API_BASE });
