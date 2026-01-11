import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

const BrowseRedirect = () => {
  const { type, id } = useParams();
  if (!type || !id) return <Navigate to="/discover" replace />;

  // Map browse types to canonical routes
  const target = type === 'genres' ? `/genre/${id}`
    : type === 'moods' ? `/mood/${id}`
    : type === 'artists' ? `/artist/${id}`
    : `/${type}/${id}`;

  return <Navigate to={target} replace />;
};

export default BrowseRedirect;
