import api from './api'; // axios instance đã có baseURL + interceptor

/**
 * 📌 Lấy danh sách video (song có media.videoUrl)
 * GET /api/videos
 */
export const getAllVideos = () => {
  return api.get('/videos');
};

/**
 * 📌 Lấy chi tiết 1 video
 * GET /api/videos/:id
 */
export const getVideoById = (id) => {
  return api.get(`/videos/${id}`);
};
