'use client';

import React, { useState, useEffect } from 'react';
import { 
  FamilyAuthContext, 
  FamilyMember, 
  DEFAULT_FAMILY_MEMBERS 
} from './familyAuth';

interface FamilyAuthProviderProps {
  children: React.ReactNode;
  initialMembers?: FamilyMember[];
}

/**
 * FamilyAuthProvider - Family-friendly authentication provider
 * 
 * This provider manages authentication for family members, with
 * built-in roles, preferences, and access control.
 */
export default function FamilyAuthProvider({ 
  children,
  initialMembers = DEFAULT_FAMILY_MEMBERS
}: FamilyAuthProviderProps) {
  // State for current member and all family members
  const [currentMember, setCurrentMember] = useState<FamilyMember | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialMembers);
  const [initialized, setInitialized] = useState(false);
  
  // Initialize auth state from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      // Load family members
      const storedMembers = localStorage.getItem('family_members');
      if (storedMembers) {
        setFamilyMembers(JSON.parse(storedMembers));
      } else {
        // Store default members if none exist
        localStorage.setItem('family_members', JSON.stringify(initialMembers));
      }
      
      // Load current member
      const storedMemberId = localStorage.getItem('current_member_id');
      if (storedMemberId) {
        const member = initialMembers.find(m => m.id === storedMemberId) || 
                       (storedMembers ? JSON.parse(storedMembers).find((m: FamilyMember) => m.id === storedMemberId) : null);
        
        if (member) {
          setCurrentMember(member);
        }
      }
    } catch (error) {
      console.error('Failed to initialize family auth:', error);
    } finally {
      setInitialized(true);
    }
  }, [initialMembers]);
  
  // Login with member ID
  const login = (memberId: string) => {
    const member = familyMembers.find(m => m.id === memberId);
    if (!member) return;
    
    setCurrentMember(member);
    
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_member_id', memberId);
    }
  };
  
  // Logout current member
  const logout = () => {
    setCurrentMember(null);
    
    // Remove from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('current_member_id');
    }
  };
  
  // Switch to another family member
  const switchMember = (memberId: string) => {
    // Just use login for now, but could add additional logic
    login(memberId);
  };
  
  // Get a preference for the current member
  const getPreference = <T = any>(key: string, defaultValue?: T): T => {
    if (!currentMember || !currentMember.preferences) {
      return defaultValue as T;
    }
    
    return (currentMember.preferences[key] ?? defaultValue) as T;
  };
  
  // Set a preference for the current member
  const setPreference = <T = any>(key: string, value: T) => {
    if (!currentMember) return;
    
    // Create a new member object with updated preferences
    const updatedMember = {
      ...currentMember,
      preferences: {
        ...currentMember.preferences,
        [key]: value
      }
    };
    
    // Update current member
    setCurrentMember(updatedMember);
    
    // Update member in the family members list
    const updatedMembers = familyMembers.map(m => 
      m.id === currentMember.id ? updatedMember : m
    );
    
    setFamilyMembers(updatedMembers);
    
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('family_members', JSON.stringify(updatedMembers));
    }
  };
  
  // Check if the current member has access to a specific module
  const hasAccessToModule = (moduleId: string): boolean => {
    if (!currentMember || !currentMember.allowedModules) {
      return false;
    }
    
    // Parents have access to everything
    if (currentMember.role === 'parent') {
      return true;
    }
    
    // Check if the module is in the allowed modules list
    return currentMember.allowedModules.includes(moduleId);
  };
  
  // Context value
  const contextValue = {
    currentMember,
    isAuthenticated: !!currentMember,
    familyMembers,
    login,
    logout,
    switchMember,
    getPreference,
    setPreference,
    hasAccessToModule
  };
  
  // Don't render children until initialized
  if (!initialized && typeof window !== 'undefined') {
    return <div>Loading...</div>;
  }
  
  return (
    <FamilyAuthContext.Provider value={contextValue}>
      {children}
    </FamilyAuthContext.Provider>
  );
}