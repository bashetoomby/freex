import { useEffect, useRef } from 'react';

export function useDebounceAsync(
  callback: (...args: any[]) => Promise<void>,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const pendingPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    let resolvePromise: (() => void) | null = null;
    const newPromise = new Promise<void>(resolve => {
      resolvePromise = resolve;
    });

    pendingPromiseRef.current = newPromise;

    timeoutRef.current = setTimeout(async () => {
      await callback(...args);
      if (resolvePromise) resolvePromise();
    }, delay);

    return newPromise;
  };
}