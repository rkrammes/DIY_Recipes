'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/providers/ConsolidatedThemeProvider';
import { useAudio } from '@/providers/AudioProvider';

interface CommandHistory {
  command: string;
  output: string;
  isError?: boolean;
}

export default function TerminalPage() {
  const { value: themeContext } = useTheme();
  const { playSound } = useAudio();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>([
    { 
      command: '', 
      output: `
DIY_OS Terminal v1.0.0
Copyright (c) 2025 DIY Corp. All rights reserved.

Type 'help' to see available commands.
      ` 
    }
  ]);
  const [currentDirectory, setCurrentDirectory] = useState('/home/user');
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Get theme style
  const themeStyle = themeContext?.theme === 'dystopia' || themeContext?.theme === 'terminal-mono'
    ? 'terminal'
    : themeContext?.theme === 'neotopia' || themeContext?.theme === 'paper-ledger'
      ? 'paper'
      : 'hacker';

  // Scroll to bottom when history changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input on mount and click
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle command submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    playSound('click');
    
    // Process command
    const command = input.trim();
    const output = processCommand(command);
    
    // Add to history
    setHistory([...history, {
      command,
      output: output.text,
      isError: output.error
    }]);
    
    // Clear input
    setInput('');
  };

  // Process terminal command
  const processCommand = (command: string): { text: string; error?: boolean } => {
    const args = command.split(' ');
    const cmd = args[0].toLowerCase();
    
    switch (cmd) {
      case 'help':
        return {
          text: `
Available commands:
  help                 - Show this help message
  ls, dir              - List directory contents
  cd <directory>       - Change directory
  pwd                  - Print working directory
  cat, type <file>     - Display file contents
  clear, cls           - Clear the terminal
  echo <text>          - Display text
  whoami               - Show current user
  date                 - Show current date and time
  system               - Show system information
  recipes              - List available recipes
  ingredients          - List available ingredients
  status               - Show system status
  exit                 - Exit terminal (return to previous page)
`
        };
        
      case 'ls':
      case 'dir':
        // Simulate file listing
        return {
          text: `
drwxr-xr-x  2 user  staff  64 May 3 14:32 recipes/
drwxr-xr-x  2 user  staff  64 May 3 14:32 ingredients/
drwxr-xr-x  2 user  staff  64 May 3 14:32 documents/
-rw-r--r--  1 user  staff  2.4K May 3 14:32 README.md
-rw-r--r--  1 user  staff  1.8K May 3 14:32 config.json
-rw-r--r--  1 user  staff  4.2K May 3 14:32 .env.local
`
        };
        
      case 'cd':
        // Simulate changing directory
        if (args.length < 2) {
          return { text: currentDirectory, error: false };
        }
        
        const newDir = args[1];
        if (newDir === '..') {
          // Go up a directory
          const parts = currentDirectory.split('/');
          if (parts.length > 2) { // Don't go above /home
            parts.pop();
            setCurrentDirectory(parts.join('/'));
            return { text: `Changed to ${parts.join('/')}` };
          } else {
            return { text: `Already at root directory: ${currentDirectory}`, error: true };
          }
        } else if (newDir === '~' || newDir === '/home/user') {
          setCurrentDirectory('/home/user');
          return { text: 'Changed to /home/user' };
        } else if (newDir.startsWith('/')) {
          // Absolute path
          setCurrentDirectory(newDir);
          return { text: `Changed to ${newDir}` };
        } else {
          // Relative path
          const newPath = `${currentDirectory}/${newDir}`;
          setCurrentDirectory(newPath);
          return { text: `Changed to ${newPath}` };
        }
        
      case 'pwd':
        return { text: currentDirectory };
        
      case 'cat':
      case 'type':
        if (args.length < 2) {
          return { text: 'Usage: cat <file>', error: true };
        }
        
        const fileName = args[1];
        if (fileName === 'README.md') {
          return {
            text: `
# DIY Recipes Application

A modern application for creating and managing DIY recipes.

## Features

- Create and manage recipes
- Track ingredients and measurements
- Create iterations and variations
- Export and share your creations

## Getting Started

1. Navigate to the recipes directory
2. Create a new recipe using the interface
3. Add ingredients and instructions
4. Save and share with others

## License

Copyright (c) 2025 DIY Corp. All rights reserved.
`
          };
        } else if (fileName === 'config.json') {
          return {
            text: `
{
  "version": "1.0.0",
  "api": {
    "baseUrl": "https://api.diyrecipes.example.com",
    "timeout": 5000
  },
  "database": {
    "provider": "supabase",
    "projectId": "bzudglfxxywugesncjnz"
  },
  "features": {
    "enableExperimental": false,
    "darkMode": true,
    "soundEffects": true
  }
}
`
          };
        } else if (fileName === '.env.local') {
          return {
            text: `
NEXT_PUBLIC_SUPABASE_URL=https://bzudglfxxywugesncjnz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=************************
NEXT_PUBLIC_MCP_ENABLED=true
MCP_SECRET_KEY=************************
API_ROUTE_SECRET=************************

# Environment Variables
NODE_ENV=development
PORT=3000
HOST=localhost

# Feature Flags
ENABLE_EXPERIMENTAL=false
ENABLE_ANALYTICS=false
DISABLE_TELEMETRY=true
`
          };
        } else {
          return { text: `File not found: ${fileName}`, error: true };
        }
        
      case 'clear':
      case 'cls':
        // Clear terminal
        setHistory([]);
        return { text: '' };
        
      case 'echo':
        // Echo text
        return { text: args.slice(1).join(' ') };
        
      case 'whoami':
        return { text: 'user@diy-recipes' };
        
      case 'date':
        return { text: new Date().toString() };
        
      case 'system':
        return {
          text: `
System Information:
  OS: DIY_OS v1.0.0
  Architecture: x64
  Hostname: diy-recipes-app
  User: user@diy-recipes
`
        };
        
      case 'recipes':
        return {
          text: `
Available Recipes:
  1. Moisturizing Beard Oil (id: 971e9734-d147-4066-9b55-b80a080de24f)
  2. Green Tea Facial Toner (id: 906a2ebd-47ea-48d1-841c-e53f02d15e95)
  3. Exfoliating Coffee Scrub (id: 72f2a8f9-7314-4b5a-9f45-909ea318a4d9)
  4. Lavender Bath Salts (id: 6e26e636-43c4-4c67-94c2-7ef82306aa9d)
  5. Herbal Lip Balm (id: 519d461c-5d48-48f9-8d0e-3a518e9ec46c)
  6. DIY All-Purpose Cleaner (id: 18d99dda-f6f3-40f0-9a2e-e65fade33ab2)
`
        };
        
      case 'ingredients':
        return {
          text: `
Available Ingredients (first 10):
  1. Carnauba Wax (id: 04f0a685-dac1-4d5c-aabe-331fe91ca7ef)
  2. Lanolin (id: cf165b9f-7fb1-4aa3-a930-79627bf2288e)
  3. Jojoba Oil (id: 9a03bd75-ad74-45ed-8821-3f2ad464953b)
  4. Distilled Water (id: 53f15232-df01-43e4-a3fe-43879e51c5f1)
  5. Green Tea (id: 629d92cd-f7ef-486b-bdda-379a1148e083)
  6. Aloe Vera Juice (id: f9a0dbc2-9297-4188-8c26-c0afca22f2aa)
  7. Apple Cider Vinegar (id: 055ac740-8b2e-4851-a1a2-3e6e9da559f9)
  8. Rosemary Essential Oil (id: 0402ac64-7e52-4358-81bb-5da78a5afbf7)
  9. Peppermint Essential Oil (id: 7df610af-46cc-4842-b8d6-d52c558befdc)
  10. Coffee Grounds (id: ec95c0a4-2d93-47a3-a0b9-c8e75a122d41)

Type 'ingredients --full' to see all ingredients.
`
        };
        
      case 'status':
        return {
          text: `
System Status: ONLINE
Database: CONNECTED
API Server: RUNNING
Frontend: ACTIVE
Memory: 512MB/8192MB
CPU: 15% (4 cores)
Uptime: 2:34:17
Network: CONNECTED (192.168.1.148)
`
        };
        
      case 'exit':
        // In a real terminal, would exit. Here we just acknowledge
        window.history.back();
        return { text: 'Exiting terminal...' };
        
      default:
        return { 
          text: `Command not found: ${command}. Type 'help' for available commands.`,
          error: true 
        };
    }
  };

  return (
    <div className="p-4 h-full">
      <div 
        ref={terminalRef}
        className={`h-full overflow-y-auto p-4 rounded-md font-mono text-sm ${
          themeStyle === 'terminal' 
            ? 'bg-surface-1/90 border border-text-primary/30 font-terminal terminal-scanlines' 
            : themeStyle === 'paper' 
              ? 'bg-surface-1/90 border border-border-subtle shadow' 
              : 'bg-surface-1/90 border border-accent/30 shadow'
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Terminal history */}
        {history.map((entry, index) => (
          <div key={index} className="mb-2">
            {/* Only show prompt for user commands */}
            {entry.command && (
              <div className="flex">
                <span className={`${
                  themeStyle === 'terminal' 
                    ? 'text-green-500' 
                    : themeStyle === 'paper' 
                      ? 'text-green-700' 
                      : 'text-emerald-400'
                }`}>
                  {`user@diy-recipes:${currentDirectory}$`}
                </span>
                <span className="ml-2">{entry.command}</span>
              </div>
            )}
            
            {/* Command output */}
            <div className={`whitespace-pre-wrap ml-0 ${entry.isError ? 'text-red-500' : ''}`}>
              {entry.output}
            </div>
          </div>
        ))}
        
        {/* Input line */}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className={`${
            themeStyle === 'terminal' 
              ? 'text-green-500' 
              : themeStyle === 'paper' 
                ? 'text-green-700' 
                : 'text-emerald-400'
          }`}>
            {`user@diy-recipes:${currentDirectory}$`}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={`flex-1 ml-2 bg-transparent border-none outline-none focus:outline-none ${
              themeStyle === 'terminal' ? 'caret-green-500' : ''
            }`}
            autoComplete="off"
            spellCheck={false}
          />
        </form>
        
        {/* Fake cursor */}
        {input === '' && (
          <span className={`inline-block h-4 w-2 ml-2 animate-pulse ${
            themeStyle === 'terminal' 
              ? 'bg-green-500' 
              : themeStyle === 'paper' 
                ? 'bg-green-700' 
                : 'bg-emerald-400'
          }`}></span>
        )}
      </div>
    </div>
  );
}