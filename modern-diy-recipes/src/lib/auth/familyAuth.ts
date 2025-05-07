import { createContext, useContext } from 'react';

/**
 * FamilyMember interface for family authentication
 */
export interface FamilyMember {
  id: string;
  name: string;
  displayName: string;
  role: 'parent' | 'child' | 'guest';
  color?: string;
  allowedModules?: string[];
  preferences?: {
    theme?: string;
    soundEffects?: boolean;
    autoSave?: boolean;
    [key: string]: any;
  };
  avatar?: string;
}

/**
 * FamilyAuth context interface
 */
export interface FamilyAuthContextType {
  currentMember: FamilyMember | null;
  isAuthenticated: boolean;
  familyMembers: FamilyMember[];
  login: (memberId: string) => void;
  logout: () => void;
  switchMember: (memberId: string) => void;
  getPreference: <T = any>(key: string, defaultValue?: T) => T;
  setPreference: <T = any>(key: string, value: T) => void;
  hasAccessToModule: (moduleId: string) => boolean;
}

/**
 * Default family members
 */
export const DEFAULT_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'parent-1',
    name: 'parent1',
    displayName: 'Parent',
    role: 'parent',
    color: '#4a6da7',
    allowedModules: ['formulations', 'ingredients', 'settings', 'admin'],
    preferences: {
      theme: 'neotopia',
      soundEffects: true,
      autoSave: true
    },
    avatar: '👩‍👧‍👦'
  },
  {
    id: 'child-1',
    name: 'child1',
    displayName: 'Child',
    role: 'child',
    color: '#6da75e',
    allowedModules: ['formulations', 'ingredients'],
    preferences: {
      theme: 'hackers',
      soundEffects: true,
      autoSave: false
    },
    avatar: '👧'
  },
  {
    id: 'guest-1',
    name: 'guest',
    displayName: 'Guest',
    role: 'guest',
    color: '#a7a06d',
    allowedModules: ['formulations'],
    preferences: {
      theme: 'dystopia',
      soundEffects: false,
      autoSave: false
    },
    avatar: '👤'
  }
];

// Create the context with default values
export const FamilyAuthContext = createContext<FamilyAuthContextType>({
  currentMember: null,
  isAuthenticated: false,
  familyMembers: [],
  login: () => {},
  logout: () => {},
  switchMember: () => {},
  getPreference: () => null as any,
  setPreference: () => {},
  hasAccessToModule: () => false
});

/**
 * Hook to use the family authentication context
 */
export function useFamilyAuth() {
  return useContext(FamilyAuthContext);
}