'use client';

import { useEffect, useState, useRef, createContext, useContext, useCallback, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface LoadingContextType {
  showLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export function usePageLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('usePageLoading must be used within PageTransitionLoading');
  }
  return context;
}

export function PageTransitionLoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  const triggerLoading = useCallback(() => {
    setLoading(true);
    setFadeOut(false);
    
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 700);
    
    const hideTimer = setTimeout(() => {
      setLoading(false);
    }, 900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    return triggerLoading();
  }, [pathname, triggerLoading]);

  const showLoading = useCallback(() => {
    triggerLoading();
  }, [triggerLoading]);

  return (
    <LoadingContext.Provider value={{ showLoading }}>
      {loading && (
        <div 
          className="fixed inset-0 z-[9999] bg-gray-50 dark:bg-gray-900 flex items-center justify-center"
          style={{
            opacity: fadeOut ? 0 : 1,
            transition: 'opacity 0.15s ease-out'
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 border-[2.5px] border-blue-100 dark:border-gray-700 rounded-full"></div>
              <div className="absolute inset-0 border-[2.5px] border-transparent border-t-blue-500 dark:border-t-blue-400 border-r-blue-500 dark:border-r-blue-400 rounded-full animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Loading...
            </p>
          </div>
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
}

export default function PageTransitionLoading() {
  const [loading, setLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    setLoading(true);
    setFadeOut(false);
    
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 700);
    
    const hideTimer = setTimeout(() => {
      setLoading(false);
    }, 900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [pathname]);

  if (!loading) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-gray-50 dark:bg-gray-900 flex items-center justify-center"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.15s ease-out'
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-[2.5px] border-blue-100 dark:border-gray-700 rounded-full"></div>
          <div className="absolute inset-0 border-[2.5px] border-transparent border-t-blue-500 dark:border-t-blue-400 border-r-blue-500 dark:border-r-blue-400 rounded-full animate-spin"></div>
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Loading...
        </p>
      </div>
    </div>
  );
}
