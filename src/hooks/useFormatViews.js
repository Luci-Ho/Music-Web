import formatNumber from './formatNumber';

/**
 * Custom hook for formatting views/plays count
 * @returns {function} formatViews function
 */
const useFormatViews = () => {
  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views?.toString() || '0';
  };

  // Alternative using existing formatNumber utility
  const formatViewsAlt = (views) => {
    return formatNumber(views || 0);
  };

  return { formatViews, formatViewsAlt };
};

export default useFormatViews;