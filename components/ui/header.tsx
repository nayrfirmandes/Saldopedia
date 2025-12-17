"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import NavigationLink from "./navigation-link";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./logo";
import MobileMenu from "./mobile-menu";
import ThemeToggle from "@/components/theme-toggle";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { usePageLoading } from "@/components/page-transition-loading";
import { LayoutDashboard, ShoppingCart, DollarSign, ArrowDownToLine, ArrowLeftRight, User, Settings, LogOut, ChevronDown, ChevronRight, Shield, Users, Coins, Wallet, Gift } from "lucide-react";

const DropdownMenu = dynamic(() => import("@/components/ui/dropdown-menu"), { ssr: false });

export default function Header() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, mounted, logout } = useAuth();
  const [hidden, setHidden] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Hide when scrolling down and past 100px (both mobile and desktop)
          if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
            setHidden(true);
          } 
          // Show when scrolling up
          else if (currentScrollY < lastScrollY.current) {
            setHidden(false);
          }
          
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuOpen &&
        userMenuRef.current &&
        userButtonRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        !userButtonRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setLoggingOut(true);
    try {
      await logout();
      router.push('/login');
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      
      <header className={`fixed top-2 z-30 w-full md:top-6 transition-transform duration-300 ${hidden ? '-translate-y-24' : 'translate-y-0'}`}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative flex h-14 items-center justify-between gap-1 sm:gap-3 rounded-2xl bg-white/90 px-2 sm:px-3 shadow-lg shadow-black/[0.03] backdrop-blur-xs before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(var(--color-gray-100),var(--color-gray-200))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] dark:bg-gray-800/90 dark:shadow-gray-900/30 dark:before:[background:linear-gradient(var(--color-gray-700),var(--color-gray-800))_border-box]">
            {/* Site branding */}
            <div className="flex flex-1 items-center">
              <Logo />
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:flex md:grow">
              {/* Desktop menu links */}
              <ul className="flex grow flex-wrap items-center justify-center gap-4 text-sm lg:gap-8">
                <li className="px-3 py-1">
                  <NavigationLink
                    href="/crypto"
                    className="flex items-center text-gray-700 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                  >
                    {t('nav.cryptocurrency')}
                  </NavigationLink>
                </li>
                <li className="px-3 py-1">
                  <NavigationLink
                    href="/paypal"
                    className="flex items-center text-gray-700 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                  >
                    {t('nav.paypal')}
                  </NavigationLink>
                </li>
                <li className="px-3 py-1">
                  <NavigationLink
                    href="/skrill"
                    className="flex items-center text-gray-700 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                  >
                    {t('nav.skrill')}
                  </NavigationLink>
                </li>
                <li className="px-3 py-1">
                  <NavigationLink
                    href="/pricing"
                    className="flex items-center text-gray-700 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                  >
                    {t('nav.pricing')}
                  </NavigationLink>
                </li>
                <li className="px-3 py-1">
                  <DropdownMenu />
                </li>
              </ul>
            </nav>

            {/* Desktop sign in links */}
            <ul className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
              <li>
                <ThemeToggle />
              </li>
              <li className="relative">
                {!mounted || loading ? (
                  <div className="h-9 w-9" />
                ) : user ? (
                    <>
                      {/* Mobile: Just profile photo, no dropdown */}
                      <NavigationLink
                        href="/dashboard"
                        className="flex md:hidden items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-semibold overflow-hidden text-sm"
                      >
                        {user.photoUrl ? (
                          <img 
                            src={user.photoUrl} 
                            alt={user.name} 
                            className="h-full w-full object-cover" 
                          />
                        ) : (
                          user.name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </NavigationLink>
                      {/* Desktop: Profile pill with dropdown */}
                      <button
                        ref={userButtonRef}
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all"
                      >
                        <div className="flex items-center justify-center h-7 w-7 rounded-full bg-blue-600 text-white font-semibold overflow-hidden text-sm">
                          {user.photoUrl ? (
                            <img 
                              src={user.photoUrl} 
                              alt={user.name} 
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            user.name?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {t('header.userMenu.dashboard')}
                        </span>
                        <ChevronDown className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {userMenuOpen && (
                        <div
                          ref={userMenuRef}
                          className="absolute right-0 top-12 w-56 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 dropdown-telegram show"
                        >
                          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                          </div>
                          <div className="py-1">
                            <NavigationLink
                              href="/dashboard"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <LayoutDashboard className="h-4 w-4" />
                              {t('header.userMenu.dashboard')}
                            </NavigationLink>
                            <NavigationLink
                              href="/dashboard/orders"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              {t('header.userMenu.orders')}
                            </NavigationLink>
                          </div>
                          <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                            <button
                              onClick={() => setOpenSubmenu(openSubmenu === 'wallet' ? null : 'wallet')}
                              className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <span className="flex items-center gap-2">
                                <Wallet className="h-4 w-4" />
                                {t('header.userMenu.wallet')}
                              </span>
                              <ChevronRight className={`h-4 w-4 transition-transform ${openSubmenu === 'wallet' ? 'rotate-90' : ''}`} />
                            </button>
                            {openSubmenu === 'wallet' && (
                              <div className="bg-gray-50 dark:bg-gray-700/50">
                                <NavigationLink
                                  href="/dashboard/deposit"
                                  onClick={() => setUserMenuOpen(false)}
                                  className="flex items-center gap-2 pl-10 pr-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <DollarSign className="h-4 w-4" />
                                  {t('header.userMenu.deposit')}
                                </NavigationLink>
                                <NavigationLink
                                  href="/dashboard/withdraw"
                                  onClick={() => setUserMenuOpen(false)}
                                  className="flex items-center gap-2 pl-10 pr-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <ArrowDownToLine className="h-4 w-4" />
                                  {t('header.userMenu.withdraw')}
                                </NavigationLink>
                                <NavigationLink
                                  href="/dashboard/transfer"
                                  onClick={() => setUserMenuOpen(false)}
                                  className="flex items-center gap-2 pl-10 pr-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <ArrowLeftRight className="h-4 w-4" />
                                  {t('header.userMenu.transfer')}
                                </NavigationLink>
                              </div>
                            )}
                            <button
                              onClick={() => setOpenSubmenu(openSubmenu === 'rewards' ? null : 'rewards')}
                              className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <span className="flex items-center gap-2">
                                <Gift className="h-4 w-4" />
                                {t('header.userMenu.rewards')}
                              </span>
                              <ChevronRight className={`h-4 w-4 transition-transform ${openSubmenu === 'rewards' ? 'rotate-90' : ''}`} />
                            </button>
                            {openSubmenu === 'rewards' && (
                              <div className="bg-gray-50 dark:bg-gray-700/50">
                                <NavigationLink
                                  href="/dashboard/referral"
                                  onClick={() => setUserMenuOpen(false)}
                                  className="flex items-center gap-2 pl-10 pr-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Users className="h-4 w-4" />
                                  {t('header.userMenu.referral')}
                                </NavigationLink>
                                <NavigationLink
                                  href="/dashboard/points"
                                  onClick={() => setUserMenuOpen(false)}
                                  className="flex items-center gap-2 pl-10 pr-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Coins className="h-4 w-4" />
                                  {t('header.userMenu.points')}
                                </NavigationLink>
                              </div>
                            )}
                          </div>
                          <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                            <NavigationLink
                              href="/dashboard/profile"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <User className="h-4 w-4" />
                              {t('header.userMenu.profile')}
                            </NavigationLink>
                            <NavigationLink
                              href="/dashboard/settings"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Settings className="h-4 w-4" />
                              {t('header.userMenu.settings')}
                            </NavigationLink>
                          </div>
                          {user.role === 'admin' && (
                            <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                              <NavigationLink
                                href="/admin/transactions"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Shield className="h-4 w-4" />
                                {t('header.userMenu.adminPanel')}
                              </NavigationLink>
                            </div>
                          )}
                          <div className="border-t border-gray-200 dark:border-gray-700 pt-1">
                            <button
                              onClick={handleLogout}
                              disabled={loggingOut}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <LogOut className="h-4 w-4" />
                              {loggingOut ? t('header.userMenu.loggingOut') : t('header.userMenu.logout')}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex gap-1 sm:gap-2">
                      <NavigationLink
                        href="/login"
                        className="inline-flex items-center justify-center px-2 sm:px-2.5 py-1 text-xs sm:text-sm font-medium rounded-md bg-gray-900 hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 dark:border dark:border-gray-600 text-white shadow-sm whitespace-nowrap"
                      >
                        {t('nav.login')}
                      </NavigationLink>
                      <NavigationLink
                        href="/register"
                        className="inline-flex items-center justify-center px-2 sm:px-2.5 py-1 text-xs sm:text-sm font-medium rounded-md bg-gradient-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-sm hover:bg-[length:100%_150%] whitespace-nowrap"
                      >
                        {t('nav.register')}
                      </NavigationLink>
                    </div>
                  )}
              </li>
            </ul>

            <MobileMenu />
          </div>
        </div>
      </header>
    </>
  );
}
