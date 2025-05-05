import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a valid UUID v4 string
 * @returns A valid UUID v4 string
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Module-level cache to ensure consistent UUIDs for the same mock IDs
const mockIdMap: Record<string, string> = {};

/**
 * Maps a deterministic UUID for a given mock ID string to ensure consistent UUIDs
 * @param mockId Original mock ID (e.g., "mock-1", "ing-2")
 * @returns A valid UUID that is consistent for the same input
 */
export function getMockUUID(mockId: string): string {
  // If this mock ID already has a UUID assigned, return it
  if (mockIdMap[mockId]) {
    return mockIdMap[mockId];
  }
  
  // Otherwise, generate a new UUID for this mock ID
  const uuid = generateUUID();
  mockIdMap[mockId] = uuid;
  return uuid;
}
