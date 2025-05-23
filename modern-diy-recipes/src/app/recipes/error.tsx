'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RecipesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Recipes error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 bg-surface-1 rounded-lg border border-accent/20">
        <h2 className="text-xl font-bold text-accent mb-4">
          Error Loading Recipes
        </h2>
        <p className="text-text-secondary mb-6">
          We couldn't load the recipes. This might be a temporary issue with the database connection.
        </p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-accent text-background rounded hover:opacity-90"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full px-4 py-2 bg-surface-2 text-text rounded hover:bg-surface-3"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}