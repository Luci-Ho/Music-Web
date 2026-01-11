// src/services/artist.service.js
import api from './api';

const ArtistService = {
  getAll: async () => {
    const res = await api.get('/artists');
    return Array.isArray(res.data) ? res.data : res.data.data;
  },

  getById: async (id) => {
    const res = await api.get(`/artists/${id}`);
    return res.data;
  },

  search: async (keyword) => {
    const res = await api.get(`/artists/search`, { params: { q: keyword } });
    return res.data;
  },

  // Nếu có thêm chức năng tạo/sửa/xóa
  create: async (artistData) => {
    const res = await api.post('/artists', artistData);
    return res.data;
  },

  update: async (id, artistData) => {
    const res = await api.put(`/artists/${id}`, artistData);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/artists/${id}`);
    return res.data;
  },
};

export default ArtistService;