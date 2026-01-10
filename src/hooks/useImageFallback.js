/**
 * Custom hook for handling image fallbacks
 * @returns {object} { getImageWithFallback, handleImageError }
 */
const useImageFallback = () => {
  const getImageWithFallback = (item, type = 'album') => {
    // Check if item has a valid image
    if (item.img && typeof item.img === 'string' && item.img.trim() !== '') {
      // Filter out problematic domains
      const problematicDomains = [
        'via.placeholder.com',
        'placeholder.com',
        'example.com',
        'test.com',
        'dummy.com'
      ];
      
      const hasProblematicDomain = problematicDomains.some(domain => 
        item.img.includes(domain)
      );
      
      if (!hasProblematicDomain) {
        return item.img;
      }
    }
    
    // Fallback to UI Avatars service
    const name = item.title || item.name || type;
    const colors = ['ef4444', '10b981', '3b82f6', 'f59e0b', '8b5cf6', 'ec4899'];
    const colorIndex = Math.abs(name.length) % colors.length;
    const backgroundColor = colors[colorIndex];
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=${backgroundColor}&color=ffffff&bold=true`;
  };

  const handleImageError = (e, fallbackName, type = 'general') => {
    const target = e.target;
    
    // First fallback - try UI Avatars with different color
    if (!target.src.includes('ui-avatars.com')) {
      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&size=200&background=10b981&color=ffffff&bold=true`;
    } else {
      // Second fallback - simple colored placeholder
      target.src = `data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="#1f2937"/>
          <text x="50%" y="50%" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dy=".3em">${fallbackName}</text>
        </svg>
      `)}`;
    }
  };

  return {
    getImageWithFallback,
    handleImageError
  };
};

export default useImageFallback;