'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

interface AdsterraAdProps {
  className?: string;
}

export function AdsterraBanner({ className = '' }: AdsterraAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [adKey, setAdKey] = useState(0);

  useEffect(() => {
    setAdKey(prev => prev + 1);
  }, [pathname]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    containerRef.current.innerHTML = '';
    
    const adContainer = document.createElement('div');
    adContainer.id = `container-529af12d02adb9db6e94621e312ae8aa-${adKey}`;
    containerRef.current.appendChild(adContainer);

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://pl26518765.effectivegatecpm.com/529af12d02adb9db6e94621e312ae8aa/invoke.js';
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [adKey]);

  return (
    <div className={className}>
      <div ref={containerRef} key={adKey}></div>
    </div>
  );
}

export function AdsterraSocialBar() {
  const pathname = usePathname();

  useEffect(() => {
    const existingScript = document.querySelector('script[src*="357cd0fa4cec043e603c368bf96de678"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://pl26518839.effectivegatecpm.com/35/7c/d0/357cd0fa4cec043e603c368bf96de678.js';
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [pathname]);

  return null;
}

export function AdsterraPopunder() {
  const pathname = usePathname();

  useEffect(() => {
    const existingScript = document.querySelector('script[src*="26ff720d464c07e143ac8dc9519b72c0"]');
    if (existingScript) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://pl26518960.effectivegatecpm.com/26/ff/72/26ff720d464c07e143ac8dc9519b72c0.js';
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [pathname]);

  return null;
}
