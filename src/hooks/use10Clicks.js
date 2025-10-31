import { useState, useCallback, useEffect } from 'react';
import useDebounce from './useDebounce';

// Hook: returns a click handler that triggers `callback` after `threshold` rapid clicks
export default function use10Clicks(callback, { threshold = 10, resetMs = 800 } = {}) {
  const [count, setCount] = useState(0);

  // enforce a minimum threshold of 10 to avoid accidental smaller thresholds
  const minThreshold = Math.max(10, threshold);

  const handler = useCallback(() => {
    setCount(prev => {
      const next = prev + 1;
      if (next >= minThreshold) {
        // trigger and reset
        if (typeof callback === 'function') callback();
        return 0;
      }
      return next;
    });
  }, [callback, minThreshold]);

  // reset counter after idle using useDebounce
  const debounced = useDebounce(count, resetMs);

  useEffect(() => {
    if (count > 0 && debounced === count) {
      setCount(0);
    }
  }, [debounced, count]);

  return handler;
}
