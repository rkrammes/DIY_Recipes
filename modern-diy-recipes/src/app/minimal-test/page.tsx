'use client';

import { useState } from 'react';
import { SimpleThemeProvider, useSimpleTheme } from '@/providers/SimpleThemeProvider';
import { Button } from '@/components/ui/button';
import { useSimpleAnimation } from '@/hooks/useSimpleAnimation';

function AnimatedCard({ title, content }: { title: string; content: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const { getHoverStyles, generateTransition } = useSimpleAnimation();
  
  return (
    <div 
      className="p-6 border rounded-lg" 
      style={{ 
        borderColor: 'var(--accent)',
        transition: generateTransition('all'),
        ...getHoverStyles(isHovered)
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h2 className="text-xl font-medium mb-4">{title}</h2>
      <p>{content}</p>
    </div>
  );
}

function ThemeButton({ themeName, currentTheme, onClick }: { 
  themeName: 'hackers' | 'dystopia' | 'neotopia'; 
  currentTheme: string;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { getHoverStyles, generateTransition } = useSimpleAnimation();
  const isActive = themeName === currentTheme;
  
  return (
    <Button 
      onClick={onClick}
      style={{ 
        backgroundColor: isActive ? 'var(--accent)' : 'transparent',
        border: '1px solid var(--accent)',
        color: 'var(--text)',
        transition: generateTransition('all'),
        ...getHoverStyles(isHovered)
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {themeName.charAt(0).toUpperCase() + themeName.slice(1)} Theme
    </Button>
  );
}

function TestContent() {
  const { theme, setTheme, toggleTheme } = useSimpleTheme();
  const { prefersReducedMotion } = useSimpleAnimation();
  
  return (
    <div className="min-h-screen p-8" style={{ 
      backgroundColor: 'var(--background)',
      color: 'var(--text)'
    }}>
      <h1 className="text-2xl font-bold mb-6">Minimal Test Page</h1>
      <p className="mb-4">Current theme: {theme}</p>
      <p className="mb-4">Reduced motion: {prefersReducedMotion ? 'Yes' : 'No'}</p>
      
      <div className="flex gap-4 mb-8">
        <ThemeButton 
          themeName="hackers" 
          currentTheme={theme} 
          onClick={() => setTheme('hackers')} 
        />
        <ThemeButton 
          themeName="dystopia" 
          currentTheme={theme} 
          onClick={() => setTheme('dystopia')} 
        />
        <ThemeButton 
          themeName="neotopia" 
          currentTheme={theme} 
          onClick={() => setTheme('neotopia')} 
        />
        
        <Button onClick={toggleTheme}>Cycle Themes</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatedCard 
          title="Simple Animated Card" 
          content="This card uses simple CSS transitions without framer-motion." 
        />
        <AnimatedCard 
          title="Theme-Specific Animations" 
          content="Animation timings and styles change based on the current theme." 
        />
      </div>
    </div>
  );
}

export default function MinimalTestPage() {
  return (
    <SimpleThemeProvider>
      <TestContent />
    </SimpleThemeProvider>
  );
}