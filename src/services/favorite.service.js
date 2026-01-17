import api from './api';

export const favoriteService = {
  toggle(songId) {
    return api.post(`/favorites/toggle`, { songId });
  }
};
