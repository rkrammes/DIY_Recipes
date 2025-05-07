'use client';

import React from 'react';
import { useFamilyAuth } from '@/lib/auth/familyAuth';

/**
 * FamilyLoginScreen - Simple login screen for family members
 */
export default function FamilyLoginScreen() {
  const { familyMembers, login, isAuthenticated } = useFamilyAuth();
  
  // If already authenticated, don't show login screen
  if (isAuthenticated) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="bg-surface-1 rounded-lg shadow-lg p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome to DIY Formulations</h1>
        
        <p className="mb-4 text-center text-text-secondary">
          Choose who's using the app today:
        </p>
        
        <div className="grid gap-4 mb-6">
          {familyMembers.map(member => (
            <button
              key={member.id}
              onClick={() => login(member.id)}
              className="flex items-center p-4 rounded-lg border-2 border-transparent hover:border-accent transition-colors"
              style={{ backgroundColor: `${member.color}30` }}
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-0 mr-3">
                <span className="text-2xl" aria-hidden="true">
                  {member.avatar || '👤'}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg">{member.displayName}</div>
                <div className="text-sm text-text-secondary capitalize">{member.role}</div>
              </div>
            </button>
          ))}
        </div>
        
        <p className="text-center text-xs text-text-secondary">
          Your family's DIY formulations will be saved for everyone to use!
        </p>
      </div>
    </div>
  );
}