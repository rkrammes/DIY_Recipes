"use client";  // Mark as Client Component

import TripleColumnLayout from "@/components/TripleColumnLayout";
import Link from "next/link";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Home Page - Shows the triple column layout and redirects to /formulations
 * This provides a clean transition from the old recipe terminology to the new formulation terminology
 */
export default function Home() {
  const router = useRouter();
  
  // Redirect to formulations page after a short delay (to allow the page to render first)
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      router.push('/formulations');
    }, 1500);
    
    return () => clearTimeout(redirectTimer);
  }, [router]);
  
  return (
    <div>
      <TripleColumnLayout />
      
      {/* Document-Centric Interface Banner */}
      <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
        <h3 className="text-lg font-bold mb-2">Document-Centric Interface</h3>
        <p className="mb-3">Try our new document-centric formulation interface!</p>
        <Link 
          href="/document-interface"
          className="block text-center bg-white text-blue-600 py-2 px-4 rounded font-medium hover:bg-blue-100"
        >
          View Document Interface
        </Link>
      </div>
      
      {/* Redirect notification */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 animate-pulse">
        <p className="font-medium">Redirecting to Formulations interface...</p>
      </div>
    </div>
  );
}
