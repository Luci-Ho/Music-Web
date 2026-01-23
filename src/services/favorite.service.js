import api from './api';

const favoriteService = {
  // Lấy danh sách favorites của user
  getFavorites: () => {
    return api.get('/favorites');
  },

  // Toggle favorite (thêm hoặc bỏ bài hát khỏi favorites)
  toggleFavorite: (songId) => {
    return api.post(`/favorites/${songId}`);
  }
};

export default favoriteService;
