import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const AdminProtectedRoute = ({ children }) => {

  const { isLoggedIn, user } = useAuth(JSON.parse(localStorage.getItem('adminuser')));
  const location = useLocation();
  

  if (!isLoggedIn || user?.level !== 'l1') {
    toast.error('Bạn cần quyền admin để truy cập trang này.');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminProtectedRoute;

/**
 * AdminProtectedRoute
 * Wrap route elements that require admin authentication.
 * If the user is not logged in or not an admin, redirect to /login and preserve the attempted location in state.
 */