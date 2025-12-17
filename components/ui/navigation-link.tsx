'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePageLoading } from '@/components/page-transition-loading';
import { ComponentProps, MouseEvent, useCallback } from 'react';

type NavigationLinkProps = ComponentProps<typeof Link>;

export default function NavigationLink({ onClick, href, ...props }: NavigationLinkProps) {
  const { showLoading } = usePageLoading();
  const pathname = usePathname();

  const handleClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    const targetHref = typeof href === 'string' ? href : href.pathname || '';
    
    if (targetHref !== pathname && !targetHref.startsWith('#') && !targetHref.startsWith('http')) {
      showLoading();
    }
    
    if (onClick) {
      onClick(e);
    }
  }, [href, pathname, showLoading, onClick]);

  return <Link href={href} onClick={handleClick} {...props} />;
}
