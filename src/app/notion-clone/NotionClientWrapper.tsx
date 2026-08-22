'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Import NotionClient dynamically with SSR disabled to avoid tldraw errors
const NotionClient = dynamic(() => import('./NotionClient'), {
  ssr: false,
});

export default function NotionClientWrapper(props: any) {
  return <NotionClient {...props} />;
}
