'use client';

import dynamic from 'next/dynamic';

const LivechatWidget = dynamic(() => import('./livechat-widget'), {
  ssr: false,
  loading: () => null,
});

export default function LivechatWidgetWrapper() {
  return <LivechatWidget />;
}
