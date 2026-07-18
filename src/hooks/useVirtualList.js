import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * Reusable hook for virtualized list rendering.
 * Renders only the visible subset of items to optimize memory and CPU for large lists (200+).
 */
export function useVirtualList({ items = [], itemHeight = 60, viewportHeight = 500, overscan = 5 }) {
  const [scrollTop, setScrollTop] = useState(0);

  const onScroll = useCallback((e) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = items.length * itemHeight;

  // Calculate visible range
  const { visibleItems, startIndex, offset } = useMemo(() => {
    const startIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(viewportHeight / itemHeight) + 2 * overscan;
    const endIdx = Math.min(items.length, startIdx + visibleCount);

    const sliced = items.slice(startIdx, endIdx).map((item, idx) => ({
      item,
      index: startIdx + idx,
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: `${itemHeight}px`,
        transform: `translateY(${(startIdx + idx) * itemHeight}px)`,
      }
    }));

    return {
      visibleItems: sliced,
      startIndex: startIdx,
      offset: startIdx * itemHeight
    };
  }, [items, itemHeight, scrollTop, viewportHeight, overscan]);

  return {
    visibleItems,
    totalHeight,
    onScroll,
    containerStyle: {
      position: 'relative',
      height: `${totalHeight}px`,
      width: '100%',
      overflow: 'hidden'
    }
  };
}
