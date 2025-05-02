import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `cookies()` helper will throw when called from pages/components not marked
            // with "use client". We're working on a fix for this that will allow you to set
            // cookies from a Server Component.
            // https://github.com/supabase/ssr/pull/127
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `cookies()` helper will throw when called from pages/components not marked
            // with "use client". We're working on a fix for this that will allow you to set
            // cookies from a Server Component.
            // https://github.com/supabase/ssr/pull/127
          }
        },
      },
    }
  );
};