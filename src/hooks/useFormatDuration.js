/**
 * Custom hook for formatting duration
 * @returns {function} formatDuration function
 */
const useFormatDuration = () => {
  const formatDuration = (duration) => {
    if (!duration) return '--:--';
    if (duration.includes && duration.includes(':')) return duration;
    
    const seconds = parseInt(duration) || 0;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTotalDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return { formatDuration, formatTotalDuration };
};

export default useFormatDuration;