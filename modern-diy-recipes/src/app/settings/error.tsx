'use client';

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold text-accent mb-4">
        Settings Error
      </h2>
      <p className="text-text-secondary mb-6">
        Unable to load settings. Your preferences may not be saved properly.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2 bg-accent text-background rounded hover:opacity-90"
      >
        Retry
      </button>
    </div>
  );
}