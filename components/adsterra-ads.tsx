'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const ADSTERRA_BANNER_ID = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_ID;
const ADSTERRA_BANNER_URL = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_URL;
const ADSTERRA_SOCIALBAR_ID = process.env.NEXT_PUBLIC_ADSTERRA_SOCIALBAR_ID;
const ADSTERRA_SOCIALBAR_URL = process.env.NEXT_PUBLIC_ADSTERRA_SOCIALBAR_URL;
const ADSTERRA_POPUNDER_ID = process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_ID;
const ADSTERRA_POPUNDER_URL = process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_URL;

interface AdsterraAdProps {
  className?: string;
}

export function AdsterraBanner({ className = '' }: AdsterraAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [adKey, setAdKey] = useState(0);
  
  const isBlogPage = pathname?.startsWith('/blog');

  useEffect(() => {
    setAdKey(prev => prev + 1);
  }, [pathname]);

  useEffect(() => {
    if (!containerRef.current || !isBlogPage || !ADSTERRA_BANNER_ID || !ADSTERRA_BANNER_URL) return;
    
    containerRef.current.innerHTML = '';
    
    const adContainer = document.createElement('div');
    adContainer.id = `container-${ADSTERRA_BANNER_ID}-${adKey}`;
    containerRef.current.appendChild(adContainer);

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = ADSTERRA_BANNER_URL;
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [adKey, isBlogPage]);

  if (!isBlogPage) return null;

  return (
    <div className={className}>
      <div ref={containerRef} key={adKey}></div>
    </div>
  );
}

function cleanupAdsterraElements() {
  const selectors = [
    'script[src*="effectivegatecpm"]',
    ADSTERRA_SOCIALBAR_ID ? `script[src*="${ADSTERRA_SOCIALBAR_ID}"]` : null,
    ADSTERRA_POPUNDER_ID ? `script[src*="${ADSTERRA_POPUNDER_ID}"]` : null,
    ADSTERRA_SOCIALBAR_ID ? `div[id*="container-${ADSTERRA_SOCIALBAR_ID}"]` : null,
    ADSTERRA_POPUNDER_ID ? `div[id*="container-${ADSTERRA_POPUNDER_ID}"]` : null,
    'iframe[src*="effectivegatecpm"]',
    'iframe[src*="adsterra"]',
    '.adsterra',
    '[class*="adsterra"]',
    '[id*="adsterra"]',
    'div[style*="z-index: 2147483647"]',
    'div[style*="position: fixed"][style*="bottom: 0"]',
  ].filter(Boolean) as string[];
  
  selectors.forEach(selector => {
    try {
      document.querySelectorAll(selector).forEach(el => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    } catch (e) {
    }
  });
}

export function AdsterraSocialBar() {
  const pathname = usePathname();
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const isBlogPage = pathname?.startsWith('/blog');

  useEffect(() => {
    if (!isBlogPage) {
      cleanupAdsterraElements();
      return;
    }

    if (!ADSTERRA_SOCIALBAR_ID || !ADSTERRA_SOCIALBAR_URL) return;

    const existingScript = document.querySelector(`script[src*="${ADSTERRA_SOCIALBAR_ID}"]`);
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = ADSTERRA_SOCIALBAR_URL;
    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      cleanupAdsterraElements();
    };
  }, [pathname, isBlogPage]);

  useEffect(() => {
    return () => {
      cleanupAdsterraElements();
    };
  }, []);

  if (!isBlogPage) return null;

  return null;
}

export function AdsterraPopunder() {
  const pathname = usePathname();
  const isBlogPage = pathname?.startsWith('/blog');

  useEffect(() => {
    if (!isBlogPage || !ADSTERRA_POPUNDER_ID || !ADSTERRA_POPUNDER_URL) {
      return;
    }

    const existingScript = document.querySelector(`script[src*="${ADSTERRA_POPUNDER_ID}"]`);
    if (existingScript) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = ADSTERRA_POPUNDER_URL;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [pathname, isBlogPage]);

  if (!isBlogPage) return null;

  return null;
}

export function AdsterraCleanup() {
  const pathname = usePathname();
  const isBlogPage = pathname?.startsWith('/blog');
  const previousIsBlogRef = useRef(isBlogPage);

  useEffect(() => {
    if (previousIsBlogRef.current && !isBlogPage) {
      cleanupAdsterraElements();
    }
    previousIsBlogRef.current = isBlogPage;
  }, [pathname, isBlogPage]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanupAdsterraElements();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return null;
}
