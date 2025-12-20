"use client";

import { useRef, useState, useEffect, Fragment } from "react";
import Image from "next/image";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useLanguage } from "@/contexts/language-context";
import { LayoutGrid, Bitcoin, CreditCard, Wallet, LucideIcon } from "lucide-react";

type LogoSize = "sm" | "md" | "lg";

interface LogoItemProps {
  src: string;
  alt: string;
  size: LogoSize;
  position: string;
  delay: number;
  isVisible: boolean;
  variant?: "default" | "faded";
}

interface TabConfig {
  icon: LucideIcon;
  labelKey: string;
}

interface LogoConfig {
  src: string;
  alt: string;
  size: LogoSize;
  position: string;
  delay: number;
  variant?: "default" | "faded";
}

const SIZE_CONFIG: Record<LogoSize, { container: string; image: number }> = {
  sm: { container: "h-11 w-11", image: 20 },
  md: { container: "h-14 w-14", image: 24 },
  lg: { container: "h-[4.5rem] w-[4.5rem]", image: 26 },
};

const TABS: TabConfig[] = [
  { icon: LayoutGrid, labelKey: "business.all" },
  { icon: Bitcoin, labelKey: "business.crypto.title" },
  { icon: CreditCard, labelKey: "business.paypal.title" },
  { icon: Wallet, labelKey: "business.skrill.title" },
];

const LOGOS_ALL: LogoConfig[] = [
  { src: "/images/logo-03.png", alt: "Binance", size: "md", position: "-translate-x-32", delay: 0 },
  { src: "/images/logo-04.png", alt: "USDT", size: "md", position: "translate-x-32", delay: 50 },
  { src: "/images/logo-05.png", alt: "USDC", size: "lg", position: "-translate-x-52 -translate-y-20", delay: 100 },
  { src: "/images/logo-02.webp", alt: "Ethereum", size: "lg", position: "-translate-y-20 translate-x-52", delay: 150 },
  { src: "/images/logo-07.png", alt: "Skrill", size: "lg", position: "translate-x-52 translate-y-20", delay: 200 },
  { src: "/images/logo-06.webp", alt: "PayPal", size: "lg", position: "-translate-x-52 translate-y-20", delay: 250 },
  { src: "/images/logo-09.png", alt: "Cardano", size: "sm", position: "-translate-x-72", delay: 300, variant: "faded" },
  { src: "/images/logo-08.webp", alt: "TON", size: "sm", position: "translate-x-72", delay: 350, variant: "faded" },
];

const LOGOS_CRYPTO: LogoConfig[] = [
  { src: "/images/logo-02.webp", alt: "Ethereum", size: "md", position: "-translate-x-32", delay: 0 },
  { src: "/images/logo-03.png", alt: "Binance", size: "md", position: "translate-x-32", delay: 50 },
  { src: "/images/logo-04.png", alt: "USDT", size: "lg", position: "-translate-x-52 -translate-y-20", delay: 100 },
  { src: "/images/logo-05.png", alt: "USDC", size: "lg", position: "-translate-y-20 translate-x-52", delay: 150 },
  { src: "/images/logo-06.webp", alt: "PayPal", size: "lg", position: "translate-x-52 translate-y-20", delay: 200 },
  { src: "/images/logo-07.png", alt: "Skrill", size: "lg", position: "-translate-x-52 translate-y-20", delay: 250 },
  { src: "/images/logo-08.webp", alt: "TON", size: "sm", position: "-translate-x-72", delay: 300, variant: "faded" },
  { src: "/images/logo-09.png", alt: "Cardano", size: "sm", position: "translate-x-72", delay: 350, variant: "faded" },
];

const LOGOS_PAYPAL: LogoConfig[] = [
  { src: "/images/logo-06.webp", alt: "PayPal", size: "lg", position: "-translate-x-32", delay: 0 },
  { src: "/images/logo-03.png", alt: "Binance", size: "md", position: "translate-x-32", delay: 50 },
  { src: "/images/logo-04.png", alt: "USDT", size: "lg", position: "-translate-x-52 -translate-y-20", delay: 100 },
  { src: "/images/logo-02.webp", alt: "Ethereum", size: "lg", position: "-translate-y-20 translate-x-52", delay: 150 },
  { src: "/images/logo-05.png", alt: "USDC", size: "lg", position: "translate-x-52 translate-y-20", delay: 200 },
  { src: "/images/logo-07.png", alt: "Skrill", size: "md", position: "-translate-x-52 translate-y-20", delay: 250 },
  { src: "/images/logo-09.png", alt: "Cardano", size: "sm", position: "-translate-x-72", delay: 300, variant: "faded" },
  { src: "/images/logo-08.webp", alt: "TON", size: "sm", position: "translate-x-72", delay: 350, variant: "faded" },
];

const LOGOS_SKRILL: LogoConfig[] = [
  { src: "/images/logo-07.png", alt: "Skrill", size: "lg", position: "-translate-x-32", delay: 0 },
  { src: "/images/logo-03.png", alt: "Binance", size: "md", position: "translate-x-32", delay: 50 },
  { src: "/images/logo-04.png", alt: "USDT", size: "lg", position: "-translate-x-52 -translate-y-20", delay: 100 },
  { src: "/images/logo-02.webp", alt: "Ethereum", size: "lg", position: "-translate-y-20 translate-x-52", delay: 150 },
  { src: "/images/logo-06.webp", alt: "PayPal", size: "lg", position: "translate-x-52 translate-y-20", delay: 200 },
  { src: "/images/logo-05.png", alt: "USDC", size: "md", position: "-translate-x-52 translate-y-20", delay: 250 },
  { src: "/images/logo-08.webp", alt: "TON", size: "sm", position: "-translate-x-72", delay: 300, variant: "faded" },
  { src: "/images/logo-09.png", alt: "Cardano", size: "sm", position: "translate-x-72", delay: 350, variant: "faded" },
];

const TAB_LOGOS: LogoConfig[][] = [LOGOS_ALL, LOGOS_CRYPTO, LOGOS_PAYPAL, LOGOS_SKRILL];

function LogoItem({ src, alt, size, position, delay, isVisible, variant = "default" }: LogoItemProps) {
  const { container, image } = SIZE_CONFIG[size];
  const isFaded = variant === "faded";

  return (
    <div
      className={`absolute ${position} transition-all duration-700 ease-out`}
      style={{
        opacity: isVisible ? (isFaded ? 0.35 : 1) : 0,
        transform: isVisible ? undefined : "scale(0.8)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div
        className={`${container} flex items-center justify-center rounded-full bg-white dark:bg-gray-800/90 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-110 hover:shadow-xl ${
          isFaded
            ? "border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
            : "shadow-lg shadow-black/[0.08] dark:shadow-black/30 ring-1 ring-gray-900/[0.05] dark:ring-white/[0.05]"
        }`}
      >
        <Image
          className="relative rounded-full"
          src={src}
          width={image}
          height={image}
          alt={alt}
        />
      </div>
    </div>
  );
}

function TabButton({ icon: Icon, label, isActive }: { icon: LucideIcon; label: string; isActive: boolean }) {
  return (
    <Tab as={Fragment}>
      <button
        className={`flex h-9 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          isActive
            ? "bg-gray-900 text-white dark:bg-blue-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700/50"
        }`}
      >
        <Icon size={15} strokeWidth={2} className={isActive ? "text-gray-400" : ""} />
        <span>{label}</span>
      </button>
    </Tab>
  );
}

function CenterLogo({ isVisible }: { isVisible: boolean }) {
  return (
    <div
      className="absolute z-10 transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "scale(1)" : "scale(0.9)",
      }}
    >
      <div className="relative">
        <div className="absolute -inset-3 rounded-full border border-blue-500/20 animate-pulse" />
        <div className="absolute -inset-6 rounded-full border border-blue-500/10" />
        <div className="h-20 w-20 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-xl shadow-blue-500/10 ring-1 ring-gray-900/[0.05] dark:ring-white/[0.05]">
          <Image
            className="relative rounded-full"
            src="/images/logo-01.webp"
            width={32}
            height={32}
            alt="Bitcoin"
            priority
          />
        </div>
      </div>
    </div>
  );
}

function OrbitRings({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        className="absolute w-64 h-64 rounded-full border border-gray-200/60 dark:border-gray-700/40 transition-all duration-1000 ease-out"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1)" : "scale(0.8)",
          transitionDelay: "100ms",
        }}
      />
      <div
        className="absolute w-[26rem] h-[26rem] rounded-full border border-gray-200/40 dark:border-gray-700/30 transition-all duration-1000 ease-out"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1)" : "scale(0.8)",
          transitionDelay: "200ms",
        }}
      />
      <div
        className="absolute w-[36rem] h-[36rem] rounded-full border border-gray-200/20 dark:border-gray-700/20 transition-all duration-1000 ease-out"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1)" : "scale(0.8)",
          transitionDelay: "300ms",
        }}
      />
    </div>
  );
}

function ConnectorLines({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <div
        className="absolute w-full h-px bg-gradient-to-r from-transparent via-gray-300/50 dark:via-gray-600/30 to-transparent transition-opacity duration-700"
        style={{ opacity: isVisible ? 1 : 0, transitionDelay: "400ms" }}
      />
      <div
        className="absolute w-px h-40 bg-gradient-to-b from-transparent via-gray-300/50 dark:via-gray-600/30 to-transparent transition-opacity duration-700"
        style={{ opacity: isVisible ? 1 : 0, transitionDelay: "450ms" }}
      />
      <div
        className="absolute w-[70%] h-px rotate-[20deg] bg-gradient-to-r from-transparent via-gray-200/40 dark:via-gray-700/25 to-transparent transition-opacity duration-700"
        style={{ opacity: isVisible ? 1 : 0, transitionDelay: "500ms" }}
      />
      <div
        className="absolute w-[70%] h-px -rotate-[20deg] bg-gradient-to-r from-transparent via-gray-200/40 dark:via-gray-700/25 to-transparent transition-opacity duration-700"
        style={{ opacity: isVisible ? 1 : 0, transitionDelay: "550ms" }}
      />
    </div>
  );
}

function BusinessCategories() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);
  const [tabAnimating, setTabAnimating] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleTabChange = (index: number) => {
    setTabAnimating(true);
    setTimeout(() => {
      setSelectedTab(index);
      setTimeout(() => setTabAnimating(false), 50);
    }, 150);
  };

  return (
    <section ref={containerRef} className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div suppressHydrationWarning>
          <TabGroup selectedIndex={selectedTab} onChange={handleTabChange}>
            <div className="flex justify-center">
              <TabList
                className="relative mb-8 inline-flex flex-wrap justify-center gap-1 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm p-1.5 ring-1 ring-gray-900/[0.05] dark:ring-white/[0.05] max-[480px]:max-w-[180px] transition-all duration-500"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(-10px)",
                }}
              >
                {TABS.map((tab, index) => (
                  <TabButton
                    key={tab.labelKey}
                    icon={tab.icon}
                    label={t(tab.labelKey)}
                    isActive={selectedTab === index}
                  />
                ))}
              </TabList>
            </div>

            <TabPanels className="relative flex h-[300px] items-center justify-center">
              <OrbitRings isVisible={isVisible} />
              <ConnectorLines isVisible={isVisible} />
              <CenterLogo isVisible={isVisible} />

              <div className="relative">
                {TAB_LOGOS.map((logos, tabIndex) => (
                  <TabPanel key={tabIndex} as={Fragment} static>
                    <div
                      className={`transition-opacity duration-200 ${
                        selectedTab === tabIndex && !tabAnimating ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"
                      }`}
                    >
                      {logos.map((logo, logoIndex) => (
                        <LogoItem
                          key={`${tabIndex}-${logoIndex}`}
                          {...logo}
                          isVisible={isVisible && selectedTab === tabIndex && !tabAnimating}
                        />
                      ))}
                    </div>
                  </TabPanel>
                ))}
              </div>
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </section>
  );
}

export default BusinessCategories;
