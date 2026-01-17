import api from './api';

const AlbumService = {
  getAll: async () => {
    const res = await api.get('/albums');
    return Array.isArray(res.data) ? res.data : res.data.data;
  },

  getById: async (id) => {
    const res = await api.get(`/albums/${id}`);
    return res.data;
  },

  search: async (keyword) => {
    const res = await api.get(`/albums/search`, { params: { q: keyword } });
    return res.data;
  },

  // Nếu có thêm chức năng tạo/sửa/xóa
  create: async (albumData) => {
    const res = await api.post('/albums', albumData);
    return res.data;
  },

  update: async (id, albumData) => {
    const res = await api.put(`/albums/${id}`, albumData);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/albums/${id}`);
    return res.data;
  },
};

export default AlbumService;