'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Import the test component with dynamic import to avoid SSR issues
const TestFeatureToggleBar = dynamic(
  () => import('@/components/test-feature-toggle-bar'),
  { ssr: false }
);

/**
 * Test page for the feature toggle bar component
 */
export default function FeatureToggleTestPage() {
  return (
    <div className="container mx-auto py-8">
      <TestFeatureToggleBar />
    </div>
  );
}