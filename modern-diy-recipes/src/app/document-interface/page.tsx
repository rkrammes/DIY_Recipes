'use client';

import React from 'react';
import Link from 'next/link';

export default function DocumentInterfacePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">DIY Recipes: Document-Centric Interface</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document-Centric UI Cards */}
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Document-Centric Formulation Interface</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Simple Document Card */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="bg-blue-500 text-white p-4">
                <h3 className="text-xl font-semibold">Simple Document</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600 mb-4">
                  A simplified document-centric interface with Making Mode functionality.
                </p>
                <Link 
                  href="/simple-doc"
                  className="block text-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                >
                  View Simple Document
                </Link>
              </div>
            </div>
            
            {/* Document Test Card */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="bg-purple-500 text-white p-4">
                <h3 className="text-xl font-semibold">Document Test</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600 mb-4">
                  Test the full document-centric interface with mock iterations data.
                </p>
                <Link 
                  href="/document-test"
                  className="block text-center bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded"
                >
                  View Document Test
                </Link>
              </div>
            </div>
            
            {/* Full Document Card */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="bg-green-500 text-white p-4">
                <h3 className="text-xl font-semibold">Document View</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600 mb-4">
                  The complete document-centric interface with database integration.
                </p>
                <Link 
                  href="/document-view?id=1"
                  className="block text-center bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                >
                  View Full Document
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Implementation Details */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-gray-800 text-white p-4">
            <h3 className="text-xl font-semibold">Implementation Details</h3>
          </div>
          <div className="p-4">
            <p className="text-gray-600 mb-4">
              The document-centric interface integrates viewing, editing, versioning, and Making Mode into a cohesive experience.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                <span>Making Mode with step-by-step guidance</span>
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                <span>Version timeline for iterations</span>
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 bg-purple-500 rounded-full mr-2"></span>
                <span>Print functionality for reference</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Testing Information */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-gray-800 text-white p-4">
            <h3 className="text-xl font-semibold">Testing Information</h3>
          </div>
          <div className="p-4">
            <p className="text-gray-600 mb-4">
              The document-centric interface has been tested with Puppeteer to verify functionality.
            </p>
            <div className="space-y-2">
              <p><strong>Testing Commands:</strong></p>
              <pre className="bg-gray-100 p-2 rounded text-sm">
                node test-simple-doc-fixed.js
                node test-document-iterations-complete.js
              </pre>
            </div>
            <p className="mt-4">
              <Link 
                href="/"
                className="text-blue-500 hover:underline"
              >
                Return to Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}