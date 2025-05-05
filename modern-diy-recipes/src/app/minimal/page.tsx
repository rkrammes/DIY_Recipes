'use client';

import React from 'react';
import Link from 'next/link';

export default function MinimalPage() {
  return (
    <div className="space-y-8">
      <div className="p-6 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-bold mb-4">Minimal Test Page</h2>
        <p className="mb-4">This is a minimal page without any of the complex providers or systems.</p>
        
        <h3 className="text-lg font-semibold mt-6 mb-2">Testing Options</h3>
        <div className="space-y-2">
          <p>To test different functionality, try these links:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><Link href="/" className="text-blue-600 hover:underline">Home Page</Link> (full implementation)</li>
            <li><Link href="/minimal-test" className="text-blue-600 hover:underline">Minimal Test</Link> (simplified theme)</li>
            <li><Link href="/test-fixed-layout" className="text-blue-600 hover:underline">Fixed Layout Test</Link> (fixed providers)</li>
          </ul>
        </div>
      </div>
      
      <div className="p-6 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-bold mb-4">Likely Issues</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Font Loading:</strong> The <code className="bg-gray-200 px-1 rounded">getAllFontVariables()</code> function 
            is called directly in the JSX of the main layout, which could cause SSR issues
          </li>
          <li>
            <strong>Animation System:</strong> The AnimationProvider has a circular dependency with 
            ThemeProvider, and both access browser APIs during rendering
          </li>
          <li>
            <strong>Audio System:</strong> The audio system tries to initialize AudioContext during 
            rendering which is not supported in SSR
          </li>
        </ul>
      </div>
    </div>
  );
}