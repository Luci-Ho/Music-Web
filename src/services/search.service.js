import api from './api'; // axios instance

const SearchService = {
  searchSongs: async (keyword) => {
    const res = await api.get('/songs/search', {
      params: { q: keyword }
    });
    return res.data;
  }
};

export default SearchService;
