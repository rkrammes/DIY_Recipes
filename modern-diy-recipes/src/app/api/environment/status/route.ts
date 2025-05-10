/**
 * API endpoint for checking environment status
 * Only available in development mode
 */
import { NextResponse } from 'next/server';
import { getEnvironmentStatus, validateClientEnvironment, validateFeatureFlags } from '@/lib/environmentValidator';

export async function GET() {
  // Only allow this endpoint in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Environment status check only available in development mode' },
      { status: 403 }
    );
  }

  // Get environment status and validation results
  const status = getEnvironmentStatus();
  const clientValidation = validateClientEnvironment();
  const featureFlagsValidation = validateFeatureFlags();

  return NextResponse.json({
    status,
    validation: {
      client: clientValidation,
      featureFlags: featureFlagsValidation,
      valid: clientValidation && featureFlagsValidation
    },
    timestamp: new Date().toISOString()
  });
}