import axios from 'axios';

//tách riêng cái này ra tất cả request dùng chung, dễ gắn token, refresh sau này
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});


//GẮN ACCESS TOKEN VÀO HEADER (INTERCEPTOR)
//KHÔNG cần tự set Authorization nữa
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

