'use client';

import React from 'react';
import { useUserPreferencesContext } from '../providers/UserPreferencesProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Theme display names and descriptions
const themeInfo = {
  hackers: {
    name: 'Hackers Terminal',
    description: 'Retro-futuristic interface inspired by the 1995 film Hackers',
    color: '#00FEFC',
    accent: '#7DF9FF',
  },
  dystopia: {
    name: 'Dystopian Noir',
    description: 'Dark cyberpunk interface inspired by The Matrix',
    color: '#00FF00',
    accent: '#00AA00',
  },
  neotopia: {
    name: 'Neotopia Light',
    description: 'Sleek digital interface inspired by TRON',
    color: '#7DFDFE',
    accent: '#0EF8F8',
  },
};

export default function ThemeSettings() {
  const { theme, setTheme } = useUserPreferencesContext();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Visual Theme</h2>
        <p className="text-text-secondary">
          Choose a theme for the terminal interface
        </p>
      </div>

      <RadioGroup
        value={theme}
        onValueChange={(value) => setTheme(value as 'hackers' | 'dystopia' | 'neotopia')}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {Object.entries(themeInfo).map(([themeId, info]) => (
          <div key={themeId} className="relative">
            <RadioGroupItem
              value={themeId}
              id={`theme-${themeId}`}
              className="sr-only peer"
            />
            <Label
              htmlFor={`theme-${themeId}`}
              className="flex flex-col h-full cursor-pointer rounded-lg border-2 border-surface-2 p-4
                peer-data-[state=checked]:border-accent hover:bg-surface-1 
                transition-all duration-200"
            >
              <div 
                className="w-full h-32 mb-4 rounded overflow-hidden relative"
                style={{ 
                  backgroundColor: themeId === 'hackers' ? '#0a0e12' : 
                                  themeId === 'dystopia' ? '#0a1a0a' : 
                                  '#f5f5f5' 
                }}
              >
                {/* Theme preview visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="text-center p-2 rounded"
                    style={{ 
                      color: info.color,
                      textShadow: `0 0 5px ${info.accent}`,
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      borderColor: info.color,
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                  >
                    <div className="font-mono text-xs">KRAFT_TERMINAL</div>
                    <div className="font-mono text-xs mt-1">{`>_ SELECT * FROM DB`}</div>
                  </div>
                </div>
                
                {/* Add visual elements specific to each theme */}
                {themeId === 'hackers' && (
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `repeating-linear-gradient(0deg, 
                        rgba(0, 254, 252, 0.1) 1px,
                        transparent 2px,
                        transparent 4px
                      )`
                    }}
                  />
                )}
                
                {themeId === 'dystopia' && (
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `
                        linear-gradient(
                          0deg,
                          rgba(0, 255, 0, 0.1) 50%,
                          transparent 50%
                        )
                      `,
                      backgroundSize: '100% 2px'
                    }}
                  />
                )}
                
                {themeId === 'neotopia' && (
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `
                        linear-gradient(
                          90deg,
                          rgba(125, 253, 254, 0.1) 1px,
                          transparent 1px
                        ),
                        linear-gradient(
                          0deg,
                          rgba(125, 253, 254, 0.1) 1px,
                          transparent 1px
                        )
                      `,
                      backgroundSize: '20px 20px'
                    }}
                  />
                )}
              </div>
              
              <div>
                <div 
                  className="font-medium"
                  style={{ color: theme === themeId ? info.color : 'inherit' }}
                >
                  {info.name}
                </div>
                <div className="text-sm text-text-secondary mt-1">
                  {info.description}
                </div>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>

      <Card>
        <CardHeader>
          <CardTitle>Advanced Theme Options</CardTitle>
          <CardDescription>Additional settings for the selected theme</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary mb-4">
            The current theme ({themeInfo[theme].name}) has these unique characteristics:
          </p>
          
          <div className="space-y-2">
            {theme === 'hackers' && (
              <>
                <div>• Electric blue and cyan color palette</div>
                <div>• Scan line effects for authentic CRT look</div>
                <div>• Digital noise patterns and subtle phosphor glow</div>
              </>
            )}
            
            {theme === 'dystopia' && (
              <>
                <div>• Matrix-inspired code green palette</div>
                <div>• Digital rain effects and scanning patterns</div>
                <div>• Subtle grid overlay with dystopian atmosphere</div>
              </>
            )}
            
            {theme === 'neotopia' && (
              <>
                <div>• TRON-inspired blue circuit aesthetic</div>
                <div>• Clean grid patterns with glowing elements</div>
                <div>• Light cycle blue accents and pulse effects</div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}