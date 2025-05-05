'use client';

import McpAuthProvider from '@/providers/McpAuthProvider';

export default function McpAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <McpAuthProvider>
      {children}
    </McpAuthProvider>
  );
}