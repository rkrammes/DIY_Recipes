import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAudio } from '@/hooks/useAudio';

const AuthStatus = () => {
  const { user, signOut, loading, error } = useAuth();
  const { playSound } = useAudio(true);

  if (loading) {
    return (
      <div className="h-8 w-40 bg-surface-2 animate-pulse rounded"></div>
    );
  }

  if (!user) {
    return (
      <div className="text-text-secondary">Not signed in</div>
    );
  }

  const handleSignOut = () => {
    playSound('click', 'dystopia');
    signOut();
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-text-secondary">
        <span className="hidden md:inline">Signed in as </span>
        <strong className="text-text truncate max-w-[150px] inline-block align-bottom overflow-hidden">{user.email}</strong>
      </span>
      <button
        onClick={handleSignOut}
        className="px-3 py-1.5 text-sm rounded-md bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-text transition-colors"
      >
        Sign Out
      </button>
      {error && <div className="text-alert-red text-sm">{error}</div>}
    </div>
  );
};

export default AuthStatus;