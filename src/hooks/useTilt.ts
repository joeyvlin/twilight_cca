import { useEffect, useRef } from 'react';

interface UseTiltOptions {
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  transition?: string;
}

export function useTilt<T extends HTMLElement = HTMLDivElement>(options: UseTiltOptions = {}) {
  const {
    maxTilt = 5,
    perspective = 1000,
    scale = 1.02,
    transition = 'transform 0.3s ease-out',
  } = options;

  const ref = useRef<T>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    // UI Improvement: Disable tilt on touch devices or small screens
    const isTouchDevice = 
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 || 
      window.matchMedia('(pointer: coarse)').matches;

    const element = ref.current;
    if (!element || isTouchDevice) return;

    let rect = element.getBoundingClientRect();

    const handleMouseMove = (e: MouseEvent) => {
      // Cancel any pending animation frame
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      // Use requestAnimationFrame to throttle updates
      rafIdRef.current = requestAnimationFrame(() => {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        
        const rotateX = (mouseY / rect.height) * -maxTilt;
        const rotateY = (mouseX / rect.width) * maxTilt;
        
        element.style.transform = `
          perspective(${perspective}px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          scale(${scale})
        `;
      });
    };

    const handleMouseLeave = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (element) {
        element.style.transform = `
          perspective(${perspective}px)
          rotateX(0deg)
          rotateY(0deg)
          scale(1)
        `;
      }
    };

    const handleMouseEnter = () => {
      if (element) {
        element.style.transition = transition;
        // Update rect on enter to account for any layout changes
        rect = element.getBoundingClientRect();
      }
    };

    element.addEventListener('mousemove', handleMouseMove, { passive: true });
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [maxTilt, perspective, scale, transition]);

  return ref;
}
