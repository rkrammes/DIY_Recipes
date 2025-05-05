'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ConsolidatedThemeProvider';
import { useAudio } from '@/providers/AudioProvider';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug' | 'trace';
  source: string;
  message: string;
  details?: string;
}

export default function LogsPage() {
  const { value: themeContext } = useTheme();
  const { playSound } = useAudio();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  
  // Get theme style
  const themeStyle = themeContext?.theme === 'dystopia' || themeContext?.theme === 'terminal-mono'
    ? 'terminal'
    : themeContext?.theme === 'neotopia' || themeContext?.theme === 'paper-ledger'
      ? 'paper'
      : 'hacker';
  
  // Generate sample logs
  useEffect(() => {
    const sources = ['server', 'database', 'client', 'auth', 'system', 'fs', 'cache'];
    const levels: ('info' | 'warning' | 'error' | 'debug' | 'trace')[] = ['info', 'warning', 'error', 'debug', 'trace'];
    const messages = [
      { level: 'info', text: 'Application started' },
      { level: 'info', text: 'User logged in successfully' },
      { level: 'info', text: 'Recipe created successfully' },
      { level: 'info', text: 'Recipe updated successfully' },
      { level: 'info', text: 'Ingredients fetched successfully' },
      { level: 'warning', text: 'Rate limit approaching' },
      { level: 'warning', text: 'Database connection pool reaching limit' },
      { level: 'warning', text: 'Memory usage high' },
      { level: 'warning', text: 'Disk space running low' },
      { level: 'error', text: 'Failed to connect to database' },
      { level: 'error', text: 'Request failed' },
      { level: 'error', text: 'Validation error' },
      { level: 'error', text: 'Authentication failed' },
      { level: 'debug', text: 'Processing request' },
      { level: 'debug', text: 'Query executed' },
      { level: 'debug', text: 'Cache hit' },
      { level: 'debug', text: 'Cache miss' },
      { level: 'trace', text: 'Function called' },
      { level: 'trace', text: 'Event emitted' },
      { level: 'trace', text: 'State changed' }
    ];
    
    const details = [
      '{"userId":"123","action":"login","ip":"127.0.0.1"}',
      '{"recipeId":"456","userId":"123","action":"create"}',
      '{"error":"Connection refused","code":"ECONNREFUSED"}',
      '{"query":"SELECT * FROM recipes","duration":120}',
      '{"memory":{"used":1024,"total":8192},"cpu":{"usage":50}}',
      '{"event":"click","element":"button","id":"save-recipe"}',
      '{"state":{"previous":"draft","current":"published"}}',
      '{"request":{"method":"GET","path":"/recipes","duration":250}}',
      '{"auth":{"method":"password","result":"success"}}',
      '{"validation":{"field":"name","error":"Required"}}',
    ];
    
    // Generate initial logs
    const initialLogs: LogEntry[] = Array.from({ length: 50 }, (_, i) => {
      const timestamp = new Date(Date.now() - (Math.random() * 24 * 60 * 60 * 1000));
      const source = sources[Math.floor(Math.random() * sources.length)];
      const messageObj = messages[Math.floor(Math.random() * messages.length)];
      
      return {
        timestamp: timestamp.toISOString(),
        level: messageObj.level as 'info' | 'warning' | 'error' | 'debug' | 'trace',
        source,
        message: messageObj.text,
        details: Math.random() > 0.3 ? details[Math.floor(Math.random() * details.length)] : undefined
      };
    });
    
    // Sort by timestamp (newest first)
    initialLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setLogs(initialLogs);
    
    // Add new logs periodically if autoRefresh is enabled
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        setLogs(prevLogs => {
          const now = new Date();
          const source = sources[Math.floor(Math.random() * sources.length)];
          const messageObj = messages[Math.floor(Math.random() * messages.length)];
          
          const newLog: LogEntry = {
            timestamp: now.toISOString(),
            level: messageObj.level as 'info' | 'warning' | 'error' | 'debug' | 'trace',
            source,
            message: messageObj.text,
            details: Math.random() > 0.3 ? details[Math.floor(Math.random() * details.length)] : undefined
          };
          
          return [newLog, ...prevLogs].slice(0, 100); // Keep only the 100 most recent logs
        });
      }, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);
  
  // Filter logs
  const filteredLogs = logs.filter(log => {
    // Filter by level
    if (filter !== 'all' && log.level !== filter) {
      return false;
    }
    
    // Filter by search
    if (search && !log.message.toLowerCase().includes(search.toLowerCase()) && 
        !log.source.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Get color for log level
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return themeStyle === 'terminal' ? 'text-green-500' : 'text-green-600';
      case 'debug':
        return 'text-purple-500';
      case 'trace':
        return 'text-gray-500';
      default:
        return 'text-blue-500';
    }
  };
  
  return (
    <div className={`p-6 h-full flex flex-col ${
      themeStyle === 'terminal' 
        ? 'font-terminal terminal-scanlines' 
        : themeStyle === 'paper' 
          ? 'font-mono paper-texture' 
          : 'font-mono'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">System Logs</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className={`text-sm ${themeStyle === 'terminal' ? 'text-text-secondary' : 'text-text-secondary'}`}>
              Auto-refresh:
            </label>
            <button 
              className={`px-2 py-1 text-sm rounded ${
                autoRefresh 
                  ? 'bg-accent/80 text-text-inverse'
                  : 'bg-surface-2 text-text-secondary'
              }`}
              onClick={() => {
                playSound('click');
                setAutoRefresh(!autoRefresh);
              }}
            >
              {autoRefresh ? 'ON' : 'OFF'}
            </button>
          </div>
          
          <button 
            className={`px-3 py-1 text-sm rounded ${
              themeStyle === 'terminal' 
                ? 'border border-text-primary/50 hover:bg-text-primary/20' 
                : 'bg-surface-2 hover:bg-surface-3'
            }`}
            onClick={() => {
              playSound('click');
              // Add a new "cleared" log
              const now = new Date();
              const newLog: LogEntry = {
                timestamp: now.toISOString(),
                level: 'info',
                source: 'system',
                message: 'Logs cleared by user'
              };
              
              setLogs([newLog]);
            }}
          >
            Clear Logs
          </button>
        </div>
      </div>
      
      {/* Filters and search */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className={`text-sm ${themeStyle === 'terminal' ? 'text-text-secondary' : 'text-text-secondary'}`}>
            Filter:
          </label>
          <select 
            className={`px-2 py-1 rounded ${
              themeStyle === 'terminal' 
                ? 'bg-surface-1 border border-text-primary/50' 
                : 'bg-surface-1 border border-border-subtle'
            }`}
            value={filter}
            onChange={(e) => {
              playSound('select');
              setFilter(e.target.value);
            }}
          >
            <option value="all">All Levels</option>
            <option value="error">Errors</option>
            <option value="warning">Warnings</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
            <option value="trace">Trace</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2 flex-grow">
          <label className={`text-sm ${themeStyle === 'terminal' ? 'text-text-secondary' : 'text-text-secondary'}`}>
            Search:
          </label>
          <input 
            type="text"
            className={`px-2 py-1 rounded flex-grow ${
              themeStyle === 'terminal' 
                ? 'bg-surface-1 border border-text-primary/50' 
                : 'bg-surface-1 border border-border-subtle'
            }`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter logs..."
          />
        </div>
      </div>
      
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Logs table */}
        <div className={`flex-1 overflow-auto ${
          themeStyle === 'terminal' 
            ? 'bg-surface-1/40 border border-text-primary/30' 
            : themeStyle === 'paper' 
              ? 'bg-surface-1/60 border border-border-subtle shadow rounded-md' 
              : 'bg-surface-1/70 border border-accent/30 shadow-lg rounded-md'
        }`}>
          <table className="w-full text-sm">
            <thead className={`sticky top-0 ${
              themeStyle === 'terminal' 
                ? 'bg-surface-1/90 border-b border-text-primary/30' 
                : themeStyle === 'paper' 
                  ? 'bg-surface-1/90 border-b border-border-subtle' 
                  : 'bg-surface-1/90 border-b border-border-subtle'
            }`}>
              <tr>
                <th className="text-left p-2 font-bold">Timestamp</th>
                <th className="text-left p-2 font-bold">Level</th>
                <th className="text-left p-2 font-bold">Source</th>
                <th className="text-left p-2 font-bold">Message</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-text-secondary">
                    No logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr 
                    key={log.timestamp + index}
                    className={`cursor-pointer ${
                      index % 2 === 0 
                        ? themeStyle === 'terminal' ? 'bg-surface-0/50' : 'bg-surface-0/30' 
                        : ''
                    } ${selectedLog === log ? 'bg-accent/10' : 'hover:bg-accent/5'}`}
                    onClick={() => {
                      playSound('select');
                      setSelectedLog(log);
                    }}
                  >
                    <td className="p-2 whitespace-nowrap">{formatTimestamp(log.timestamp)}</td>
                    <td className={`p-2 ${getLevelColor(log.level)}`}>
                      {themeStyle === 'terminal' ? log.level.toUpperCase() : log.level}
                    </td>
                    <td className="p-2">{log.source}</td>
                    <td className="p-2 truncate max-w-md">{log.message}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Log details panel */}
        {selectedLog && (
          <div className={`w-96 overflow-auto p-4 ${
            themeStyle === 'terminal' 
              ? 'bg-surface-1/40 border border-text-primary/30' 
              : themeStyle === 'paper' 
                ? 'bg-surface-1/60 border border-border-subtle shadow rounded-md' 
                : 'bg-surface-1/70 border border-accent/30 shadow-lg rounded-md'
          }`}>
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Log Details</h2>
              <button 
                className="text-text-secondary hover:text-text-primary"
                onClick={() => {
                  playSound('click');
                  setSelectedLog(null);
                }}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-text-secondary mb-1">Timestamp</h3>
                <p>{formatTimestamp(selectedLog.timestamp)}</p>
              </div>
              
              <div>
                <h3 className="text-sm text-text-secondary mb-1">Level</h3>
                <p className={getLevelColor(selectedLog.level)}>
                  {selectedLog.level.toUpperCase()}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm text-text-secondary mb-1">Source</h3>
                <p>{selectedLog.source}</p>
              </div>
              
              <div>
                <h3 className="text-sm text-text-secondary mb-1">Message</h3>
                <p>{selectedLog.message}</p>
              </div>
              
              {selectedLog.details && (
                <div>
                  <h3 className="text-sm text-text-secondary mb-1">Details</h3>
                  <pre className={`overflow-auto p-2 rounded text-xs ${
                    themeStyle === 'terminal' 
                      ? 'bg-surface-0/50 border border-text-primary/20' 
                      : 'bg-surface-0/70 border border-border-subtle'
                  }`}>
                    {
                      // Try to pretty-print JSON if valid
                      (() => {
                        try {
                          return JSON.stringify(JSON.parse(selectedLog.details), null, 2);
                        } catch {
                          return selectedLog.details;
                        }
                      })()
                    }
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Status bar */}
      <div className={`mt-4 py-2 px-4 text-sm ${
        themeStyle === 'terminal' 
          ? 'bg-surface-1/40 border border-text-primary/30' 
          : themeStyle === 'paper' 
            ? 'bg-surface-1/60 border border-border-subtle shadow rounded-md' 
            : 'bg-surface-1/70 border border-accent/30 shadow-lg rounded-md'
      }`}>
        <div className="flex justify-between">
          <div>
            Showing {filteredLogs.length} of {logs.length} logs
            {filter !== 'all' && ` (filtered to ${filter})`}
            {search && ` (search: "${search}")`}
          </div>
          <div className={`${autoRefresh ? 'text-green-500' : 'text-yellow-500'}`}>
            {autoRefresh ? 'Live updates enabled' : 'Live updates paused'}
          </div>
        </div>
      </div>
    </div>
  );
}