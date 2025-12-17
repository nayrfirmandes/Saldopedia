'use client';

import { ThemeProvider } from '@/contexts/theme-context';
import { LanguageProvider } from '@/contexts/language-context';
import { AuthProvider } from '@/contexts/auth-context';
import AutoLogout from '@/components/auto-logout';
import { PageTransitionLoadingProvider } from '@/components/page-transition-loading';
import { CookieBannerProvider } from '@/components/cookie-banner';
import { AdsterraCleanup } from '@/components/adsterra-ads';
import { ReactNode } from 'react';

// AOS library disabled - replaced with custom AnimateOnScroll utility to fix hydration mismatch
// import "aos/dist/aos.css";

type Language = 'id' | 'en';

export function Providers({ children, initialLanguage = 'id' }: { children: ReactNode; initialLanguage?: Language }) {
  // AOS initialization commented out - now using custom AnimateOnScroll component
  // useEffect(() => {
  //   const shouldDisableAnimations = () => {
  //     if (typeof window === 'undefined') return false;
  //     
  //     const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  //     if (mediaQuery.matches) return true;
  //     
  //     const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  //     if (connection && connection.saveData) return true;
  //     
  //     return false;
  //   };

  //   const loadAOS = () => {
  //     import("aos")
  //       .then((AOS) => {
  //         AOS.default.init({
  //           once: true,
  //           disable: shouldDisableAnimations(),
  //           duration: 600,
  //           easing: "ease-out-cubic",
  //           offset: 50,
  //           delay: 0,
  //         });
  //         
  //         if (document.readyState !== 'loading') {
  //           AOS.default.refresh();
  //         }
  //       })
  //       .catch((err) => {
  //         console.error("Failed to load AOS library:", err);
  //       });
  //   };

  //   if (document.readyState === 'complete') {
  //     setTimeout(loadAOS, 100);
  //   } else {
  //     window.addEventListener('load', () => {
  //       setTimeout(loadAOS, 100);
  //     });
  //   }
  // }, []);

  return (
    <ThemeProvider>
      <LanguageProvider initialLanguage={initialLanguage}>
        <AuthProvider>
          <PageTransitionLoadingProvider>
            <CookieBannerProvider>
              <AutoLogout />
              <AdsterraCleanup />
              {children}
            </CookieBannerProvider>
          </PageTransitionLoadingProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
