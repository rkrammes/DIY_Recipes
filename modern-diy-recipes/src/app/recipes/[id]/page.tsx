"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

/**
 * Recipe Details Page - Redirects to Formulation Details as part of the terminology transition
 */
export default function RecipeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  
  useEffect(() => {
    // Redirect to formulation details page with the same ID
    router.replace(`/formulations/${recipeId}`);
  }, [router, recipeId]);

  return (
    <div className="p-4">
      <p>Redirecting to formulation details...</p>
    </div>
  );
}