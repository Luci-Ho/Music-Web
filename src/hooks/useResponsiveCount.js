import { useEffect, useState } from 'react';

// Returns how many cards fit in the available width based on a card width + gap.
// Supports measuring real elements via selectors or falling back to given cardWidth.
export default function useResponsiveCount({ cardWidth = 230, gap = 16, containerSelector = null, cardSelector = null, min = 1, max = null } = {}) {
  const [count, setCount] = useState(() => {
    if (typeof window === 'undefined') return min;
    const containerWidth = (() => {
      if (containerSelector) {
        const el = document.querySelector(containerSelector);
        if (el && el.clientWidth) return el.clientWidth;
      }
      return window.innerWidth;
    })();

    const effectiveGap = Math.max(20, Number(gap) || 0);
    const items = Math.max(min, Math.floor((containerWidth + effectiveGap) / (cardWidth + effectiveGap)));
    return max ? Math.min(items, max) : items;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const measure = () => {
      let containerWidth = window.innerWidth;
      let containerEl = null;
      if (containerSelector) {
        containerEl = document.querySelector(containerSelector);
        if (containerEl && containerEl.clientWidth) containerWidth = containerEl.clientWidth;
      }

      let measuredCardWidth = cardWidth;
      try {
        let cardEl = null;
        if (cardSelector) {
          if (containerEl) cardEl = containerEl.querySelector(cardSelector) || document.querySelector(cardSelector);
          else cardEl = document.querySelector(cardSelector);
        }
        if (cardEl) {
          const rect = cardEl.getBoundingClientRect();
          if (rect && rect.width) measuredCardWidth = rect.width;
        }
      } catch (e) {
        // ignore and fallback to provided cardWidth
      }

      const effectiveGap = Math.max(20, Number(gap) || 0);
      const items = Math.max(min, Math.floor((containerWidth + effectiveGap) / (measuredCardWidth + effectiveGap)));
      const final = max ? Math.min(items, max) : items;
      setCount(final);
    };

    let resizeObserver;
    try {
      const RO = window.ResizeObserver;
      if (RO) {
        resizeObserver = new RO(() => measure());
        if (containerSelector) {
          const el = document.querySelector(containerSelector);
          if (el) resizeObserver.observe(el);
        }
        if (cardSelector) {
          const cel = document.querySelector(cardSelector);
          if (cel) resizeObserver.observe(cel);
        }
      }
    } catch (e) {
      resizeObserver = null;
    }

    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    const t = setTimeout(measure, 120);
    measure();

    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('load', measure);
      clearTimeout(t);
      if (resizeObserver) {
        try { resizeObserver.disconnect(); } catch (e) {}
      }
    };
  }, [cardWidth, gap, containerSelector, cardSelector, min, max]);

  return count;
}
