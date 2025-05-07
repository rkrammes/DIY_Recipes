"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Recipe List Page - Redirects to Formulations as part of the terminology transition
 */
export default function RecipeListPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to formulations page
    router.replace('/formulations');
  }, [router]);

  return (
    <div className="p-4">
      <p>Redirecting to formulations...</p>
    </div>
  );
}