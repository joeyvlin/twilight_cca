import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { useRef, useEffect } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  enabled?: boolean;
  formatter?: (value: number) => string;
}

export function AnimatedNumber({ 
  value, 
  duration = 2000, 
  enabled = true,
  formatter = (v) => v.toLocaleString()
}: AnimatedNumberProps) {
  const animatedValue = useAnimatedNumber({ 
    targetValue: value, 
    duration,
    enabled
  });
  
  const prevValueRef = useRef(value);
  const stablePartRef = useRef<string>('');
  
  useEffect(() => {
    if (prevValueRef.current !== value) {
      const prevFormatted = formatter(prevValueRef.current);
      const newFormatted = formatter(value);
      
      // Find the longest common prefix (unchanged part from left)
      let commonPrefixEnd = 0;
      const minLength = Math.min(prevFormatted.length, newFormatted.length);
      
      for (let i = 0; i < minLength; i++) {
        if (prevFormatted[i] === newFormatted[i]) {
          commonPrefixEnd = i + 1;
        } else {
          break;
        }
      }
      
      // Store the stable part (everything before the first changing digit)
      stablePartRef.current = newFormatted.substring(0, commonPrefixEnd);
      prevValueRef.current = value;
    }
  }, [value, formatter]);

  const formattedValue = formatter(animatedValue);
  const formattedTarget = formatter(value);
  
  // Extract prefix (like $) and suffix
  const prefixMatch = formattedTarget.match(/^[^\d]*/);
  const suffixMatch = formattedTarget.match(/[^\d]*$/);
  const prefix = prefixMatch ? prefixMatch[0] : '';
  const suffix = suffixMatch ? suffixMatch[0] : '';
  
  // Extract numeric parts
  const numericValue = formattedValue.replace(/^[^\d]*/, '').replace(/[^\d]*$/, '');
  const numericTarget = formattedTarget.replace(/^[^\d]*/, '').replace(/[^\d]*$/, '');
  
  // Find where the stable part ends in the numeric portion
  const numericPrefix = stablePartRef.current.replace(/^[^\d]*/, '').replace(/[^\d]*$/, '');
  const stableNumericLength = numericPrefix.length;
  
  // Split into stable and changing parts
  const stablePart = numericValue.substring(0, stableNumericLength);
  const changingPart = numericValue.substring(stableNumericLength);
  
  // Only show changing part if it's different from target
  if (changingPart === numericTarget.substring(stableNumericLength) && animatedValue === value) {
    return <span>{formattedValue}</span>;
  }
  
  return (
    <span>
      {prefix}
      {stablePart}
      <span key={`changing-${value}`} className="inline-block">{changingPart}</span>
      {suffix}
    </span>
  );
}

