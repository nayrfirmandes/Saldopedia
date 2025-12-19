'use client';

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";

interface SmartCtaButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md';
  className?: string;
  orderText?: string;
  registerText?: string;
}

export default function SmartCtaButton({ 
  variant = 'primary',
  size = 'md',
  className = '',
  orderText,
  registerText
}: SmartCtaButtonProps) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const sizeClass = size === 'sm' ? 'btn-sm py-2' : 'btn';

  const baseClass = variant === 'primary' 
    ? `${sizeClass} group w-full bg-gradient-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-sm hover:bg-[length:100%_150%] sm:w-auto`
    : `${sizeClass} group w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 sm:w-auto`;

  const arrowClass = variant === 'primary'
    ? "text-blue-300"
    : "text-gray-500";

  const buttonText = user 
    ? (orderText || t('nav.formOrder'))
    : (registerText || t('hero.ctaRegister'));

  return (
    <Link
      className={`${baseClass} ${className}`}
      href={user ? "/order" : "/register"}
    >
      <span className="relative inline-flex items-center">
        {buttonText}{" "}
        <span className={`ml-1 tracking-normal ${arrowClass} transition-transform group-hover:translate-x-0.5`}>
          →
        </span>
      </span>
    </Link>
  );
}
