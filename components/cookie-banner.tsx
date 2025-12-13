'use client';

import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import {
  getCookieConsent,
  saveCookieConsent,
  hasUserMadeChoice,
  defaultConsent,
  type CookieConsent,
} from '@/lib/cookie-consent';

interface CookieSettingsContextType {
  openSettings: () => void;
}

const CookieSettingsContext = createContext<CookieSettingsContextType | null>(null);

export function useCookieSettings() {
  const context = useContext(CookieSettingsContext);
  if (!context) {
    throw new Error('useCookieSettings must be used within CookieBannerProvider');
  }
  return context;
}

export function CookieBannerProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    if (!hasUserMadeChoice()) {
      setShowBanner(true);
    }
  }, []);

  const openSettings = useCallback(() => {
    setShowBanner(true);
    setShowSettings(true);
  }, []);

  const handleAcceptAll = () => {
    const fullConsent: CookieConsent = {
      necessary: true,
      preferences: true,
      analytics: true,
      marketing: true,
    };
    saveCookieConsent(fullConsent);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    saveCookieConsent(defaultConsent);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    saveCookieConsent(consent);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleToggleCategory = (category: keyof CookieConsent) => {
    if (category === 'necessary') return;
    
    setConsent((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <CookieSettingsContext.Provider value={{ openSettings }}>
      {children}
      {isHydrated && showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-6">
          <div className="mx-auto max-w-6xl">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 md:p-8">
              {!showSettings ? (
                <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 md:mb-2 flex items-center gap-2">
                      <Cookie className="w-5 h-5 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                      <span>{t('cookieBanner.title')}</span>
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                      {t('cookieBanner.description')}{' '}
                      <Link href="/cookie-policy" className="text-blue-600 dark:text-blue-400 hover:underline">
                        {t('cookieBanner.learnMore')}
                      </Link>
                    </p>
                  </div>

                  <div className="flex flex-row gap-2 items-center flex-shrink-0">
                    <button
                      onClick={() => setShowSettings(true)}
                      className="px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      {t('cookieBanner.settings')}
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      className="px-3 py-1.5 text-xs md:text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                      {t('cookieBanner.acceptAll')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-h-[70vh] md:max-h-none overflow-y-auto">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {t('cookieBanner.settingsTitle')}
                    </h3>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                      aria-label="Close settings"
                    >
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-3 md:mb-4">
                    {t('cookieBanner.settingsDescription')}
                  </p>

                  <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                    <div className="flex items-start justify-between p-3 md:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm md:text-base font-medium text-gray-900 dark:text-gray-100">{t('cookieBanner.necessary.title')}</h4>
                          <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            {t('cookieBanner.necessary.alwaysActive')}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {t('cookieBanner.necessary.description')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start justify-between p-3 md:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                      <div className="flex-1 pr-2">
                        <h4 className="text-sm md:text-base font-medium text-gray-900 dark:text-gray-100">{t('cookieBanner.preferences.title')}</h4>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {t('cookieBanner.preferences.description')}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-2 md:ml-4 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={consent.preferences}
                          onChange={() => handleToggleCategory('preferences')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-start justify-between p-3 md:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                      <div className="flex-1 pr-2">
                        <h4 className="text-sm md:text-base font-medium text-gray-900 dark:text-gray-100">{t('cookieBanner.analytics.title')}</h4>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {t('cookieBanner.analytics.description')}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-2 md:ml-4 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={consent.analytics}
                          onChange={() => handleToggleCategory('analytics')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-start justify-between p-3 md:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                      <div className="flex-1 pr-2">
                        <h4 className="text-sm md:text-base font-medium text-gray-900 dark:text-gray-100">{t('cookieBanner.marketing.title')}</h4>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {t('cookieBanner.marketing.description')}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-2 md:ml-4 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={consent.marketing}
                          onChange={() => handleToggleCategory('marketing')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                      onClick={handleRejectAll}
                      className="px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      {t('cookieBanner.rejectAll')}
                    </button>
                    <button
                      onClick={handleSavePreferences}
                      className="px-3 py-1.5 text-xs md:text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                      {t('cookieBanner.savePreferences')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </CookieSettingsContext.Provider>
  );
}

export default function CookieBanner() {
  return null;
}
