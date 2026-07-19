import React, { useState, useEffect, useRef } from 'react';

/**
 * A highly optimized, zero-dependency Viewport Virtualization wrapper.
 * Uses IntersectionObserver to prune DOM nodes of off-screen list cards
 * while maintaining scroll integrity.
 */
export function VirtualItemWrapper({ children, height = '120px', className = '' }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        rootMargin: '300px 0px 300px 0px' // Load cards 300px before scrolling into view
      }
    );

    const currentTarget = domRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, []);

  return (
    <div 
      ref={domRef} 
      className={className}
      style={{ 
        minHeight: height,
        contentVisibility: isVisible ? 'visible' : 'auto',
        containIntrinsicSize: `auto ${height}`
      }}
    >
      {isVisible ? children : <div style={{ height }} />}
    </div>
  );
}
