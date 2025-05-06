"use client";  // Mark as Client Component

import TripleColumnLayout from "@/components/TripleColumnLayout";
import Link from "next/link";

export default function Home() {
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
    </div>
  );
}
