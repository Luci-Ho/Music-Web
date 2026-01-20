// src/services/artist.service.js
import api from './api';

// ===== CACHE =====
let artistCache = null;
let artistByIdCache = {};

// ===== HELPER =====
const normalizeList = (res) =>
  Array.isArray(res.data) ? res.data : res.data.data || [];

// ===== SERVICE =====
const ArtistService = {
  // ======================
  // GET ALL (CACHED)
  // ======================
  getAll: async (force = false) => {
    if (artistCache && !force) return artistCache;

    const res = await api.get('/artists');
    const data = normalizeList(res);

    artistCache = data;

    // build id cache
    data.forEach((a) => {
      if (a._id) artistByIdCache[a._id] = a;
      if (a.legacyId) artistByIdCache[a.legacyId] = a;
    });

    return data;
  },

  // ======================
  // GET BY ID (CACHED)
  // ======================
  getById: async (id) => {
    if (artistByIdCache[id]) return artistByIdCache[id];

    const res = await api.get(`/artists/${id}`);
    const data = res.data;

    if (data?._id) artistByIdCache[data._id] = data;
    if (data?.legacyId) artistByIdCache[data.legacyId] = data;

    return data;
  },

  // ======================
  // SEARCH (NO CACHE)
  // ======================
  search: async (keyword) => {
    const res = await api.get('/artists/search', {
      params: { q: keyword },
    });
    return normalizeList(res);
  },

  // ======================
  // CREATE (CLEAR CACHE)
  // ======================
  create: async (artistData) => {
    const res = await api.post('/artists', artistData);

    artistCache = null;
    artistByIdCache = {};

    return res.data;
  },

  // ======================
  // UPDATE (CLEAR CACHE)
  // ======================
  update: async (id, artistData) => {
    const res = await api.put(`/artists/${id}`, artistData);

    artistCache = null;
    artistByIdCache = {};

    return res.data;
  },

  // ======================
  // DELETE (CLEAR CACHE)
  // ======================
  delete: async (id) => {
    const res = await api.delete(`/artists/${id}`);

    artistCache = null;
    artistByIdCache = {};

    return res.data;
  },

  // ======================
  // MANUAL CLEAR (OPTIONAL)
  // ======================
  clearCache: () => {
    artistCache = null;
    artistByIdCache = {};
  },
};

export default ArtistService;
