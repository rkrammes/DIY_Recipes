'use client';

import React, { useState } from 'react';
import { useFamilyAuth } from '@/lib/auth/familyAuth';

/**
 * FamilyMemberSwitcher - Component for switching between family members
 * 
 * This component displays the current member and allows switching to other members.
 */
export default function FamilyMemberSwitcher() {
  const { currentMember, familyMembers, switchMember, logout } = useFamilyAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  if (!currentMember) return null;
  
  // Toggle dropdown
  const toggleDropdown = () => setIsOpen(!isOpen);
  
  // Close dropdown
  const closeDropdown = () => setIsOpen(false);
  
  // Handle member selection
  const handleSelectMember = (memberId: string) => {
    switchMember(memberId);
    closeDropdown();
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    closeDropdown();
  };
  
  return (
    <div className="relative">
      {/* Current member button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center p-2 rounded hover:bg-surface-2 transition-colors"
      >
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
          style={{ backgroundColor: `${currentMember.color}40` }}
        >
          <span aria-hidden="true">{currentMember.avatar || '👤'}</span>
        </div>
        <span className="mr-1">{currentMember.displayName}</span>
        <span className="text-xs ml-1" aria-hidden="true">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>
      
      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop for closing the dropdown when clicking outside */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={closeDropdown}
            aria-hidden="true"
          />
          
          {/* Dropdown content */}
          <div className="absolute right-0 mt-2 w-48 bg-surface-1 rounded-md shadow-lg z-20 py-1 border border-border-subtle">
            {/* Header */}
            <div className="px-4 py-2 border-b border-border-subtle">
              <p className="text-sm font-medium">Switch to</p>
            </div>
            
            {/* Family members list */}
            <div className="max-h-60 overflow-y-auto">
              {familyMembers.map(member => (
                <button
                  key={member.id}
                  onClick={() => handleSelectMember(member.id)}
                  className={`w-full text-left px-4 py-2 flex items-center hover:bg-surface-2 transition-colors ${
                    member.id === currentMember.id ? 'bg-surface-2' : ''
                  }`}
                >
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center mr-2"
                    style={{ backgroundColor: `${member.color}40` }}
                  >
                    <span aria-hidden="true">{member.avatar || '👤'}</span>
                  </div>
                  <span className="flex-1">{member.displayName}</span>
                  {member.id === currentMember.id && (
                    <span className="text-accent" aria-hidden="true">✓</span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Footer actions */}
            <div className="border-t border-border-subtle py-1">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-500 hover:bg-surface-2 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}