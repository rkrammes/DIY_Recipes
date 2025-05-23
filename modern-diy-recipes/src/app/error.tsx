'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-surface-1 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-accent mb-4">
          Something went wrong!
        </h2>
        <p className="text-text-secondary mb-6">
          An error occurred while processing your request. Please try again.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 p-4 bg-surface-2 rounded">
            <summary className="cursor-pointer text-sm font-semibold">
              Error details
            </summary>
            <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap">
              {error.message}
            </pre>
          </details>
        )}
        <button
          onClick={reset}
          className="w-full px-4 py-2 bg-accent text-background rounded hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  );
}