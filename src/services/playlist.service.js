// src/services/playlist.service.js
import api from './api.js'; // axios instance với baseURL: http://localhost:5000

// Lấy playlist của user hiện tại
export const getUserPlaylists = () => {
  return api.get('/playlists/me');
};

// Lấy playlist theo id
export const getPlaylist = (id) => {
  return api.get(`/playlists/${id}`);
};

// Tạo playlist mới
export const createPlaylist = (data) => {
  return api.post('/playlists', data);
};

// Cập nhật playlist
export const updatePlaylist = (id, data) => {
  return api.patch(`/playlists/${id}`, data);
};

// Xóa playlist
export const deletePlaylist = (id) => {
  return api.delete(`/playlists/${id}`);
};

// Thêm bài hát vào playlist
export const addSongToPlaylist = (id, songId) => {
  return api.post(`/playlists/${id}/songs`, { songId });
};

// Xóa bài hát khỏi playlist
export const removeSongFromPlaylist = (id, songId) => {
  return api.delete(`/playlists/${id}/songs/${songId}`);
};
