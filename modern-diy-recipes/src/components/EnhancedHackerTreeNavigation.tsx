'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/providers/ConsolidatedThemeProvider';
import { useAudio } from '@/providers/AudioProvider';
import { useContext7Mcp } from '@/hooks/useContext7Mcp'; // Using Context7 for validation

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

export function EnhancedHackerTreeNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const themeContext = useTheme();
  const { playSound } = useAudio();
  const { getThemeDocumentation } = useContext7Mcp(); // Using Context7
  
  // Get theme style
  const theme = themeContext?.theme || 'hackers';
  const themeStyle = theme === 'dystopia' || theme === 'terminal-mono'
    ? 'terminal'
    : theme === 'neotopia' || theme === 'paper-ledger'
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
  
  // Check theme documentation with Context7
  useEffect(() => {
    const validateThemes = async () => {
      try {
        const themeDoc = await getThemeDocumentation();
        console.log('Theme documentation from Context7:', themeDoc);
      } catch (err) {
        console.error('Error accessing Context7 documentation:', err);
      }
    };
    
    validateThemes();
  }, [getThemeDocumentation]);
  
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
    
    // Status styling based on status type
    const statusClasses = {
      online: 'value-positive', // Green in terminal theme
      offline: 'error', // Red in terminal theme
      warning: 'warning', // Yellow in terminal theme
      secure: 'server-info', // Cyan in terminal theme
      unsecure: 'error', // Red in terminal theme
      loading: 'system-message animate-pulse' // Purple in terminal theme with animation
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
      <span className={`ml-2 text-xs ${statusClasses[status] || 'text-gray-400'}`}>
        {statusSymbols[status] || '•'}
      </span>
    );
  };
  
  // Render tree node with children - now with proper data attributes for styling
  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    const isActive = node.path && pathname === node.path;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = node.expanded;
    
    // Padding for indentation
    const paddingLeft = `${(level * 16) + 8}px`;
    
    return (
      <div key={node.id} className="select-none">
        {/* Node itself - now with data attributes to target theme styling */}
        <div 
          data-file-item={isActive ? 'selected' : ''}
          className={`flex items-center py-1 px-2 cursor-pointer ${isActive ? 'selected' : ''}`}
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
            <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-accent/20">
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
    <div 
      data-file-browser={true}
      className={`h-full flex flex-col overflow-hidden`}
    >
      {/* Header with system stats */}
      <div className="p-3 border-b border-border-subtle flex flex-col">
        <div className="flex justify-between items-center">
          <div className="server-info text-xs">
            SYS:{" "}
            <span className={networkStatus === 'CONNECTED' ? 'value-positive' : 'warning animate-pulse'}>
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
            <span className={cpuUsage > 50 ? 'warning' : cpuUsage > 80 ? 'error' : 'value-positive'}>
              {cpuUsage}%
            </span>
          </div>
          <div>
            <span className="text-text-secondary">MEM:</span>{" "}
            <span className={memoryUsage > 700 ? 'warning' : memoryUsage > 900 ? 'error' : 'value-positive'}>
              {memoryUsage}MB
            </span>
          </div>
        </div>
      </div>
      
      {/* Tree navigation - using proper data attributes for styling */}
      <div className="flex-1 overflow-y-auto">
        {/* Navigation tree */}
        <div className="py-1">
          {navTree.map(section => renderTreeNode(section))}
        </div>
      </div>
      
      {/* Footer with terminal status */}
      <div 
        data-terminal={true} 
        className="p-2 border-t border-border-subtle"
      >
        <div className="text-xs font-terminal">
          <span className="text-text-secondary">{">"}</span> <span className="text-text-primary cursor-blink">_</span>
        </div>
      </div>
    </div>
  );
}