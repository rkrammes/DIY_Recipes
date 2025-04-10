import React from 'react';
import useAuth from '../../hooks/useAuth';

const AuthStatus = () => {
  const { user, signOut, loading, error } = useAuth();

  if (loading) {
    return <div>Loading authentication status...</div>;
  }

  if (!user) {
    return <div>Not signed in.</div>;
  }

  return (
    <div className="flex items-center space-x-4">
      <span>Signed in as <strong>{user.email}</strong></span>
      <button
        onClick={signOut}
        className="bg-gray-700 text-white px-3 py-1 rounded"
      >
        Sign Out
      </button>
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
};

export default AuthStatus;