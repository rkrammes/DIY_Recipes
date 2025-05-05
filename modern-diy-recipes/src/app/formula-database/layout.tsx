import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Formula Database | DIY Recipes',
  description: 'Advanced scientific formula database with retro sci-fi interface',
};

export default function FormulaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}