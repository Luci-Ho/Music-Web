import  api  from './api';

export const authService = {
  signup(data) {
    return api.post('/auth/signup', data);
  },

  login(data) {
    return api.post('/auth/login', data);
  },

  me() {
    return api.get('/auth/me');
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};
