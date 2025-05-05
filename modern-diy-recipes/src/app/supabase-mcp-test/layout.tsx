'use client';

import { SimplifiedMcpAuthProvider } from '../../hooks/useSimplifiedMcpAuth';

export default function SimplifiedMcpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SimplifiedMcpAuthProvider>
      {children}
    </SimplifiedMcpAuthProvider>
  );
}