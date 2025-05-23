'use client';

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

/**
 * Placeholder component for Context7 integration
 * TODO: Implement proper browser-compatible version
 */
export default function Context7Integration() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Context7 Integration</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Context7 integration is temporarily disabled during the build optimization.
          This feature will be restored with a browser-compatible implementation.
        </p>
      </CardContent>
    </Card>
  );
}