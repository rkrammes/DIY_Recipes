/**
 * Environment Status Component
 * 
 * Displays information about the current environment configuration
 * This is useful for development and debugging purposes
 */

'use client';

import { useEffect, useState } from 'react';
import { getEnvironmentStatus, getUiMode } from '@/lib/environmentValidator';

// Only show in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

export default function EnvironmentStatus() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    // Only load status in development mode
    if (isDevelopment) {
      setStatus(getEnvironmentStatus());
    }
  }, []);

  if (!isDevelopment || !status) {
    return null;
  }

  // Get list of enabled features
  const enabledFeatures = Object.entries(status.features)
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => feature);

  return (
    <div className="fixed bottom-0 right-0 p-2 z-50">
      <button
        onClick={() => setVisible(!visible)}
        className="bg-gray-800 text-white px-3 py-1 rounded text-xs"
      >
        {visible ? 'Hide' : 'Show'} Env
      </button>

      {visible && (
        <div className="bg-gray-800 text-white text-xs p-4 rounded shadow mt-2 max-w-md">
          <h3 className="text-sm font-bold mb-2">Environment Status</h3>
          
          <table className="w-full text-left">
            <tbody>
              <tr>
                <td className="py-1 pr-3">Mode:</td>
                <td className="py-1">
                  <span className={status.isDevelopment ? 'text-green-400' : 'text-blue-400'}>
                    {status.environment}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-1 pr-3">UI Mode:</td>
                <td className="py-1">{getUiMode()}</td>
              </tr>
              <tr>
                <td className="py-1 pr-3">Theme:</td>
                <td className="py-1">{status.theme}</td>
              </tr>
              <tr>
                <td className="py-1 pr-3">Supabase:</td>
                <td className="py-1">
                  <span className={status.supabaseUrl === 'Set' ? 'text-green-400' : 'text-red-400'}>
                    {status.supabaseUrl === 'Set' ? 'Connected' : 'Not Connected'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <h4 className="text-sm font-bold mt-3 mb-1">Enabled Features</h4>
          {enabledFeatures.length > 0 ? (
            <ul className="grid grid-cols-2 gap-x-4">
              {enabledFeatures.map((feature) => (
                <li key={feature} className="text-green-400">
                  ✓ {feature}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No features enabled</p>
          )}

          <div className="mt-3 text-xs text-gray-400">
            This panel is only visible in development mode
          </div>
        </div>
      )}
    </div>
  );
}