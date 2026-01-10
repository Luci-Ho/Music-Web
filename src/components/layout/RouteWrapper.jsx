import React from 'react';
import { Outlet } from 'react-router-dom';

// Simple wrapper used as a parent route element to enable nested child routes
const RouteWrapper = () => {
  return <Outlet />;
};

export default RouteWrapper;
