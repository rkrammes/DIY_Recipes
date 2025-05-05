'use client';

import { createContext, useContext } from 'react';

export interface DevUser {
  id: string;
  email: string;
  role: string;
}

export interface DevAuthContext {
  user: DevUser | null;
  isAuthenticated: boolean;
  isEditMode: boolean;
  toggleEditMode: () => void;
  logout: () => void;
  login: () => void;
}

export const defaultDevUser: DevUser = {
  id: 'dev-user-1',
  email: 'dev@example.com',
  role: 'admin'
};

export const DevAuthContext = createContext<DevAuthContext>({
  user: null,
  isAuthenticated: false,
  isEditMode: false,
  toggleEditMode: () => {},
  logout: () => {},
  login: () => {}
});

export const useDevAuth = () => useContext(DevAuthContext);