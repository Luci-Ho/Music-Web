// src/services/favorite.service.js
import api from "./api";

const favoriteService = {
  getFavorites() {
    return api.get("/favorites");
  },
  toggleFavorite(songId) {
    return api.post(`/favorites/${songId}`);
  },
};

export default favoriteService;
