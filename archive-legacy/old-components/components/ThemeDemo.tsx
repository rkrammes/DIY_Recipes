'use client';

import React from 'react';
import { useTheme } from '../modern-diy-recipes/src/providers/ThemeProvider';
import { Button } from '../modern-diy-recipes/src/components/ui/button';
import { Card } from '../modern-diy-recipes/src/components/ui/card';
import { Label } from '../modern-diy-recipes/src/components/ui/label';

export default function ThemeDemo() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen bg-[var(--surface-0)] text-[var(--text-primary)]">
      <h1 className="text-4xl font-bold mb-8">Theme Showcase</h1>

      <Card className="p-6 mb-8 w-full max-w-sm bg-[var(--surface-1)] border-[var(--border-subtle)] shadow-soft">
        <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">Current Theme: {theme}</h2>
        <Button onClick={toggleTheme} className="w-full bg-[var(--accent)] text-[var(--text-inverse)] hover:bg-[var(--accent-hover)]">
          Toggle Theme
        </Button>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-subtle)] shadow-soft">
          <h3 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Example Elements</h3>
          <div className="flex flex-col gap-4">
            <div>
              <Label className="text-sm text-[var(--text-secondary)]">Example Label</Label>
              <input type="text" placeholder="Example Input" className="w-full p-2 border-[var(--border-subtle)] bg-[var(--surface-0)] text-[var(--text-primary)]" />
            </div>
            <Button variant="outline" className="border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--surface-0)]">Outline Button</Button>
            <Button variant="default" className="bg-[var(--accent)] text-[var(--text-inverse)] hover:bg-[var(--accent-hover)]">Default Button</Button>
          </div>
        </Card>

        <Card className="p-6 bg-[var(--surface-1)] border-[var(--border-subtle)] shadow-soft">
          <h3 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Status Colors</h3>
          <div className="flex flex-col gap-4">
            <div className="p-2 bg-[var(--success)] text-[var(--text-inverse)]">Success Message</div>
            <div className="p-2 bg-[var(--warning)] text-[var(--text-inverse)]">Warning Message</div>
            <div className="p-2 bg-[var(--error)] text-[var(--text-inverse)]">Error Message</div>
          </div>
        </Card>
      </div>
    </div>
  );
}