# TypeScript Fixes Plan

## Current Status
- 344 TypeScript errors
- `ignoreBuildErrors: true` in next.config.ts
- Most errors are type-related, not syntax errors

## Top Issues to Fix

### 1. "This expression is not callable" (77 errors)
- Usually happens with incorrect hook usage or function types
- Common in Settings module with preference hooks

### 2. Nullable types (15 errors)
- `'item' is possibly 'null'`
- Need null checks or optional chaining

### 3. Index signature issues (14 errors)
- Theme object indexing problems
- Need proper type definitions for theme objects

### 4. Missing properties (12 + 10 errors)
- `Property 'value' does not exist on type 'ThemeContextType'`
- `Property 'ingredients' does not exist on type 'Recipe'`
- Interface definitions need updating

### 5. Implicit 'any' types (19 errors total)
- Parameters without type annotations
- Need explicit type definitions

## Quick Fixes Applied

### 1. Add missing type definitions
Created `src/types/common.d.ts` for shared types.

### 2. Fix theme type issues
Updated theme-related interfaces to have proper index signatures.

### 3. Add null safety
Used optional chaining and null checks where needed.

## Remaining Work

1. Fix Settings module hook issues
2. Update Recipe interface to include ingredients
3. Add proper types for all function parameters
4. Fix Supabase client type issues
5. Resolve test-related type errors

## To Remove ignoreBuildErrors

After fixing the critical errors:
1. Run `npx tsc --noEmit` to verify
2. Remove `ignoreBuildErrors: true` from next.config.ts
3. Test build with `npm run build`