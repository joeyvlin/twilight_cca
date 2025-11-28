import { useState, useEffect } from 'react';

interface UseAnimatedNumberOptions {
  targetValue: number;
  duration?: number;
  startValue?: number;
  enabled?: boolean;
}

export function useAnimatedNumber({ 
  targetValue, 
  duration = 2000, 
  startValue = 0,
  enabled = true 
}: UseAnimatedNumberOptions): number {
  const [currentValue, setCurrentValue] = useState(startValue);

  useEffect(() => {
    if (!enabled) {
      setCurrentValue(targetValue);
      return;
    }

    const startTime = Date.now();
    const difference = targetValue - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const newValue = Math.floor(startValue + difference * easeOutCubic);
      
      setCurrentValue(newValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrentValue(targetValue);
      }
    };

    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetValue, duration, startValue, enabled]);

  return currentValue;
}

