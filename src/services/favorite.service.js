import api from "./api";

const favoriteService = {
  // GET /api/favorites
  getFavorites() {
    return api.get("/favorites");
  },

  // POST /api/favorites/:songId
  toggleFavorite(songId) {
    return api.post(`/favorites/${songId}`);
  },
};

export default favoriteService;
