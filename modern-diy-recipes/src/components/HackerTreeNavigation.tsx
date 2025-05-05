'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/providers/ConsolidatedThemeProvider';
import { useAudio } from '@/providers/AudioProvider';

// Tree node interface
interface TreeNode {
  id: string;
  name: string;
  path?: string;
  icon?: string;
  children?: TreeNode[];
  expanded?: boolean;
  status?: 'online' | 'offline' | 'warning' | 'secure' | 'unsecure' | 'loading';
  badge?: string | number;
  info?: string;
  type?: 'directory' | 'file' | 'system' | 'database' | 'network' | 'security' | 'api';
}

export function HackerTreeNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { value: themeContext } = useTheme();
  const { playSound } = useAudio();
  
  // Get theme style for specific styling
  const themeStyle = themeContext?.theme === 'dystopia' || themeContext?.theme === 'terminal-mono'
    ? 'terminal'
    : themeContext?.theme === 'neotopia' || themeContext?.theme === 'paper-ledger'
      ? 'paper'
      : 'hacker';
  
  // System status data
  const [cpuUsage, setCpuUsage] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [networkStatus, setNetworkStatus] = useState<string>('CONNECTED');
  const [uptime, setUptime] = useState<number>(0);
  
  // Initialize navigation tree with collapsible sections - API section removed
  const [navTree, setNavTree] = useState<TreeNode[]>([
    {
      id: 'directory',
      name: 'DIRECTORY',
      type: 'directory',
      expanded: true,
      icon: themeStyle === 'terminal' ? '>' : themeStyle === 'paper' ? '📁' : '📂',
      children: [
        { 
          id: 'recipes', 
          name: 'Recipes', 
          path: '/', 
          icon: themeStyle === 'terminal' ? '$' : '📋',
          type: 'directory',
          badge: 6,
          status: 'online'
        },
        { 
          id: 'ingredients', 
          name: 'Ingredients', 
          path: '/ingredients', 
          icon: themeStyle === 'terminal' ? '#' : '🧪',
          type: 'directory',
          badge: 20,
          status: 'online'
        },
        { 
          id: 'formulas', 
          name: 'Formula Database', 
          path: '/formula-database', 
          icon: themeStyle === 'terminal' ? '%' : '🧮',
          type: 'database',
          status: 'online'
        }
      ]
    },
    {
      id: 'system',
      name: 'SYSTEM',
      type: 'system',
      expanded: false,
      icon: themeStyle === 'terminal' ? '[' : themeStyle === 'paper' ? '⚙️' : '🖥️',
      children: [
        { 
          id: 'status', 
          name: 'System Status', 
          path: '/system-status', 
          icon: themeStyle === 'terminal' ? '!' : '📊',
          type: 'system',
          status: 'online',
          info: `CPU: ${cpuUsage}% | MEM: ${memoryUsage}MB`
        },
        { 
          id: 'terminal', 
          name: 'Terminal', 
          path: '/terminal', 
          icon: themeStyle === 'terminal' ? '>' : '💻',
          type: 'system',
          status: 'secure'
        },
        { 
          id: 'logs', 
          name: 'System Logs', 
          path: '/logs', 
          icon: themeStyle === 'terminal' ? '~' : '📜',
          type: 'system',
          badge: 13
        }
      ]
    },
    {
      id: 'settings',
      name: 'SETTINGS',
      type: 'system',
      expanded: false,
      icon: themeStyle === 'terminal' ? '@' : themeStyle === 'paper' ? '🔧' : '⚙️',
      children: [
        { 
          id: 'theme', 
          name: 'Theme Settings', 
          path: '/theme-demo', 
          icon: themeStyle === 'terminal' ? '*' : '🎨',
          type: 'system'
        }
      ]
    }
  ]);
  
  // Simulate system stats with error handling
  useEffect(() => {
    const updateStats = () => {
      try {
        setCpuUsage(Math.floor(Math.random() * 30) + 10);
        setMemoryUsage(Math.floor(Math.random() * 500) + 200);
        setUptime(prev => prev + 1);
        
        // Randomly change network status occasionally
        if (Math.random() > 0.95) {
          setNetworkStatus('CHECKING');
          setTimeout(() => setNetworkStatus('CONNECTED'), 1000);
        }
      } catch (error) {
        console.error("Error updating system stats:", error);
      }
    };

    // Initial update
    updateStats();
    
    // Set interval for updates
    const interval = setInterval(updateStats, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Toggle tree node expansion
  const toggleNode = (nodeId: string) => {
    try {
      playSound('click');
      setNavTree(prevTree => {
        return prevTree.map(section => {
          if (section.id === nodeId) {
            return { ...section, expanded: !section.expanded };
          }
          
          return section;
        });
      });
    } catch (error) {
      console.error("Error toggling tree node:", error);
    }
  };
  
  // Navigate to a path
  const navigateTo = (path: string) => {
    try {
      playSound('select');
      router.push(path);
    } catch (error) {
      console.error("Error navigating to path:", error, path);
      // Fallback navigation if router push fails
      window.location.href = path;
    }
  };
  
  // Generate status indicator
  const renderStatus = (status?: string) => {
    if (!status) return null;
    
    const statusColors: Record<string, string> = {
      online: themeStyle === 'terminal' 
        ? 'text-green-500' 
        : themeStyle === 'paper'
          ? 'text-green-700'
          : 'text-emerald-400',
      offline: 'text-red-500',
      warning: 'text-yellow-500',
      secure: 'text-blue-500',
      unsecure: 'text-red-500',
      loading: 'text-purple-500 animate-pulse'
    };
    
    const statusSymbols: Record<string, string> = {
      online: themeStyle === 'terminal' ? '◉' : '●',
      offline: themeStyle === 'terminal' ? '◌' : '○',
      warning: themeStyle === 'terminal' ? '⚠' : '⚠️',
      secure: themeStyle === 'terminal' ? '✓' : '🔒',
      unsecure: themeStyle === 'terminal' ? '✗' : '🔓',
      loading: themeStyle === 'terminal' ? '⟳' : '⏳'
    };
    
    return (
      <span className={`ml-2 text-xs ${statusColors[status] || 'text-gray-400'}`}>
        {statusSymbols[status] || '•'}
      </span>
    );
  };
  
  // Render tree node with children
  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    const isActive = node.path && pathname === node.path;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = node.expanded;
    
    // Padding for indentation
    const paddingLeft = `${(level * 16) + 8}px`;
    
    // Node styles based on theme and active state
    const nodeBaseClasses = themeStyle === 'terminal'
      ? 'font-terminal text-sm hover:bg-surface-2/70 transition-colors'
      : themeStyle === 'paper'
        ? 'font-mono text-sm hover:bg-surface-2/50 transition-colors'
        : 'font-mono text-sm hover:bg-accent/10 transition-colors';
        
    const nodeActiveClasses = isActive 
      ? themeStyle === 'terminal'
        ? 'bg-text-primary/20 text-text-primary font-medium'
        : themeStyle === 'paper'
          ? 'bg-surface-2 text-text-primary font-medium'
          : 'bg-accent/20 text-text-primary font-medium'
      : 'text-text-secondary hover:text-text-primary';
    
    return (
      <div key={node.id} className="select-none">
        {/* Node itself */}
        <div 
          className={`flex items-center py-1 px-2 cursor-pointer ${nodeBaseClasses} ${nodeActiveClasses}`}
          style={{ paddingLeft }}
          onClick={() => {
            if (hasChildren) {
              toggleNode(node.id);
            } else if (node.path) {
              navigateTo(node.path);
            }
          }}
          onMouseEnter={() => playSound('hover')}
        >
          {/* Expand/collapse indicator for nodes with children */}
          {hasChildren && (
            <span className="w-4 text-center mr-1">
              {isExpanded 
                ? themeStyle === 'terminal' ? '-' : '▼' 
                : themeStyle === 'terminal' ? '+' : '▶'
              }
            </span>
          )}
          
          {/* Icon */}
          <span className={`w-5 text-center mr-1 ${!hasChildren ? 'ml-4' : ''}`}>
            {node.icon}
          </span>
          
          {/* Node name */}
          <span className="flex-1 truncate">
            {node.name}
          </span>
          
          {/* Status indicator */}
          {renderStatus(node.status)}
          
          {/* Badge (count or tag) */}
          {node.badge && (
            <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
              themeStyle === 'terminal'
                ? 'bg-text-primary/10 text-text-primary'
                : themeStyle === 'paper'
                  ? 'bg-surface-2 text-text-secondary'
                  : 'bg-accent/20 text-accent'
            }`}>
              {node.badge}
            </span>
          )}
        </div>
        
        {/* Children nodes if expanded */}
        {isExpanded && hasChildren && (
          <div>
            {node.children?.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`h-full flex flex-col overflow-hidden ${
      themeStyle === 'terminal'
        ? 'terminal-text terminal-scanlines'
        : themeStyle === 'paper'
          ? 'paper-texture'
          : 'grid-background'
    }`}>
      {/* Header with system stats */}
      <div className={`p-3 border-b border-border-subtle flex flex-col ${
        themeStyle === 'terminal'
          ? 'bg-surface-1/90'
          : themeStyle === 'paper'
            ? 'bg-surface-1/80'
            : 'bg-surface-1/70 backdrop-blur-sm'
      }`}>
        <div className="flex justify-between items-center">
          <div className={`text-xs ${
            themeStyle === 'terminal'
              ? 'text-text-primary animation-flicker'
              : themeStyle === 'paper'
                ? 'text-text-primary'
                : 'text-text-primary text-shadow-glow'
          }`}>
            SYS:{" "}
            <span className={networkStatus === 'CONNECTED' ? 'text-green-500' : 'text-yellow-500 animate-pulse'}>
              {networkStatus}
            </span>
          </div>
          <div className="text-xs text-text-secondary">
            UPTIME: {Math.floor(uptime / 60)}m {uptime % 60}s
          </div>
        </div>
        
        <div className="mt-2 flex justify-between text-xs">
          <div>
            <span className="text-text-secondary">CPU:</span>{" "}
            <span className={cpuUsage > 50 ? 'text-yellow-500' : cpuUsage > 80 ? 'text-red-500' : 'text-green-500'}>
              {cpuUsage}%
            </span>
          </div>
          <div>
            <span className="text-text-secondary">MEM:</span>{" "}
            <span className={memoryUsage > 700 ? 'text-yellow-500' : memoryUsage > 900 ? 'text-red-500' : 'text-green-500'}>
              {memoryUsage}MB
            </span>
          </div>
        </div>
      </div>
      
      {/* Tree navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* Navigation tree */}
        <div className="py-1">
          {navTree.map(section => renderTreeNode(section))}
        </div>
      </div>
      
      {/* Footer with quick commands */}
      <div className={`p-2 border-t border-border-subtle ${
        themeStyle === 'terminal'
          ? 'bg-surface-1/90'
          : themeStyle === 'paper'
            ? 'bg-surface-1/80'
            : 'bg-surface-1/70 backdrop-blur-sm'
      }`}>
        {themeStyle === 'terminal' ? (
          <div className="text-xs font-terminal">
            <span className="text-text-secondary">{">"}</span> <span className="text-text-primary cursor-blink">_</span>
          </div>
        ) : (
          <div className="text-xs font-mono flex gap-2">
            <button 
              className="px-2 py-0.5 bg-surface-2 hover:bg-surface-3 rounded text-text-secondary"
              onClick={() => playSound('click')}
            >
              REFRESH
            </button>
            <button 
              className="px-2 py-0.5 bg-surface-2 hover:bg-surface-3 rounded text-text-secondary"
              onClick={() => playSound('click')}
            >
              DEBUG
            </button>
          </div>
        )}
      </div>
    </div>
  );
}