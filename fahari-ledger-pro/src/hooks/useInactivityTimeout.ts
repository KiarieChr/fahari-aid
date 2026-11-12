import { useEffect, useRef } from 'react';

export const useInactivityTimeout = (onTimeout: () => void, timeoutMs: number = 120000) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onTimeout, timeoutMs);
  };

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleEvent = () => resetTimer();

    events.forEach(event => document.addEventListener(event, handleEvent));
    resetTimer();

    return () => {
      events.forEach(event => document.removeEventListener(event, handleEvent));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onTimeout, timeoutMs]);

  return { resetTimer };
};
