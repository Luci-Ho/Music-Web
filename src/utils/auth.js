export const isLoggedIn = () => {
  const user = localStorage.getItem('user');
  return !!user;
};

export const getUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};
