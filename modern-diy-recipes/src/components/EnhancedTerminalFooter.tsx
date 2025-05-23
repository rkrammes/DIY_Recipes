'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ConsolidatedThemeProvider';

interface EnhancedTerminalFooterProps {
  systemStatus?: 'online' | 'offline' | 'checking';
  databaseStats?: {
    formulations: number;
    ingredients: number;
    tools: number;
    library: number;
  };
  lastSyncTime?: Date | null;
}

// Function components for dynamic values
function MemoryUsage() {
  const [usage, setUsage] = useState('--');
  useEffect(() => {
    setUsage(`${Math.floor(Math.random() * 30) + 70}%`);
    const interval = setInterval(() => {
      setUsage(`${Math.floor(Math.random() * 30) + 70}%`);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  return <>{usage}</>;
}

function CpuUsage() {
  const [usage, setUsage] = useState('--');
  useEffect(() => {
    setUsage(`${Math.floor(Math.random() * 15) + 5}%`);
    const interval = setInterval(() => {
      setUsage(`${Math.floor(Math.random() * 15) + 5}%`);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  return <>{usage}</>;
}

function CurrentTime() {
  const [time, setTime] = useState('--:--:--');
  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return <>{time}</>;
}

function LastSyncTime({ lastSyncTime }: { lastSyncTime: Date | null }) {
  const [formattedTime, setFormattedTime] = useState('--:--:--');
  useEffect(() => {
    if (lastSyncTime) {
      setFormattedTime(lastSyncTime.toLocaleTimeString());
    }
  }, [lastSyncTime]);
  return <>{formattedTime}</>;
}

export function EnhancedTerminalFooter({
  systemStatus = 'online',
  databaseStats = { formulations: 6, ingredients: 20, tools: 3, library: 10 },
  lastSyncTime = new Date()
}: EnhancedTerminalFooterProps) {
  const themeContext = useTheme();
  const theme = themeContext?.theme || 'hackers';
  
  return (
    <div 
      data-terminal="footer"
      className="py-4 px-4 font-mono flex-shrink-0 shadow-sm relative z-10 h-[140px]"
    >
      <div className="grid grid-cols-12 gap-2">
        {/* System Status Panel */}
        <div className="col-span-3 border border-border-subtle p-1">
          <div className="flex justify-between mb-1">
            <span className="server-info text-[1rem] font-bold">SYS_STATUS</span>
            <span className={`text-[1rem] ${systemStatus === 'online' ? 'value-positive' : 'error'} font-bold`}>
              [{systemStatus.toUpperCase()}]
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[0.875rem]">
            <div className="flex justify-between">
              <span className="text-text-secondary">UPTIME:</span>
              <span>{Math.floor(Math.random() * 24) + 1}h {Math.floor(Math.random() * 60)}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">SESS_ID:</span>
              <span>#{Math.floor(Math.random() * 9000) + 1000}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">DB_CONN:</span>
              <span className={systemStatus === 'online' ? 'value-positive' : 'error'}>
                {systemStatus === 'online' ? 'ACTIVE' : 'FAILED'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">API:</span>
              <span className="value-positive">READY</span>
            </div>
          </div>

          {/* System meters visualization */}
          <div className="mt-1 grid grid-cols-2 gap-x-1 text-[0.875rem]">
            <div>
              <div className="flex justify-between">
                <span className="text-text-secondary">CPU</span>
                <span className="server-info"><CpuUsage /></span>
              </div>
              <div className="w-full bg-surface-2 border border-border-subtle h-1.5 mt-0.5">
                <div className="bg-accent h-full" style={{ width: `${parseInt((Math.random() * 15 + 5).toString())}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <span className="text-text-secondary">MEM</span>
                <span className="server-info"><MemoryUsage /></span>
              </div>
              <div className="w-full bg-surface-2 border border-border-subtle h-1.5 mt-0.5">
                <div className="bg-accent h-full" style={{ width: `${parseInt((Math.random() * 30 + 70).toString())}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Module Registry Stats Panel */}
        <div className="col-span-3 border border-border-subtle p-1">
          <div className="flex justify-between mb-1">
            <span className="server-info text-[1rem] font-bold">MODULE_STATISTICS</span>
            <span className={`text-[0.875rem]
              ${systemStatus === 'checking' ? 'warning animate-pulse' :
                systemStatus === 'online' ? 'value-positive' :
                'error'}
            `}>
              {systemStatus === 'checking' ? 'CONNECTING...' :
                systemStatus === 'online' ? (
                  <LastSyncTime lastSyncTime={lastSyncTime} />
                ) : 'DISCONNECTED'
              }
            </span>
          </div>

          <div className="mb-1 text-[0.875rem]">
            <div className="flex justify-between mb-0.5">
              <span className="text-text-secondary">FORMULATIONS:</span>
              <span className="font-bold">{databaseStats.formulations}</span>
              <span className="text-text-secondary">TOTAL:</span>
              <span className="font-bold">
                {systemStatus === 'online' ? databaseStats.formulations * 3 : '--'}
              </span>
            </div>
            <div className="w-full bg-surface-2 border border-border-subtle h-1">
              <div
                className={`${systemStatus === 'online' ? 'bg-emerald-500' :
                          systemStatus === 'checking' ? 'bg-amber-500 animate-pulse' :
                          'bg-red-500'} h-full`}
                style={{
                  width: systemStatus === 'online'
                    ? `${Math.min(databaseStats.formulations * 7, 100)}%`
                    : systemStatus === 'checking' ? '30%' : '10%'
                }}
              ></div>
            </div>
          </div>

          <div className="mb-1 text-[0.875rem]">
            <div className="flex justify-between mb-0.5">
              <span className="text-text-secondary">INGREDIENTS:</span>
              <span className="font-bold">{databaseStats.ingredients}</span>
              <span className="text-text-secondary">USED:</span>
              <span className="font-bold">
                {systemStatus === 'online' ? Math.floor(databaseStats.ingredients * 0.8) : '--'}
              </span>
            </div>
            <div className="w-full bg-surface-2 border border-border-subtle h-1">
              <div
                className={`${systemStatus === 'online' ? 'bg-blue-500' :
                          systemStatus === 'checking' ? 'bg-amber-500 animate-pulse' :
                          'bg-red-500'} h-full`}
                style={{
                  width: systemStatus === 'online'
                    ? `${Math.min(databaseStats.ingredients * 3, 100)}%`
                    : systemStatus === 'checking' ? '50%' : '10%'
                }}
              ></div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[0.875rem]">
            <div className="flex space-x-1">
              <span className="text-text-secondary">MODULES:</span>
              <span className="server-info">3</span>
            </div>
            <div className="text-xs">
              <span className={`
                ${systemStatus === 'checking' ? 'warning animate-pulse' :
                  systemStatus === 'online' ? 'value-positive animate-pulse' :
                  'error'}
              `}>
                {systemStatus === 'checking' ? '▮▮▯▯▯▯' :
                 systemStatus === 'online' ? '▮▮▮▮▯▯' :
                 '▯▯▯▯▯▯'}
              </span>
            </div>
          </div>
        </div>

        {/* Live System Log Stream */}
        <div className="col-span-4 border border-border-subtle p-1">
          <div className="flex justify-between mb-1">
            <span className="server-info text-[1rem] font-bold">LIVE_SYSTEM_LOG</span>
            <span className="value-positive animate-pulse text-[0.875rem]">STREAMING</span>
          </div>

          <div className="h-16 overflow-y-auto bg-surface-2 p-1 font-mono text-[0.75rem] leading-tight">
            <div className="text-text-secondary">[<CurrentTime />] System resources initialized successfully</div>
            <div className="text-text-secondary">[<CurrentTime />] Cache size optimized (64MB)</div>
            <div className="value-positive">[<CurrentTime />] Database connection established to supabase.co</div>
            <div className="text-text-secondary">[<CurrentTime />] Auth provider initialized with DEV profile</div>
            <div className="text-text-secondary">[<CurrentTime />] Loaded formulation data ({databaseStats.formulations} entries)</div>
            <div className="text-text-secondary">[<CurrentTime />] Loaded ingredient data ({databaseStats.ingredients} entries)</div>
            <div className="server-info">[<CurrentTime />] Theme activated: {theme.toUpperCase()}</div>
            <div className="server-info">[<CurrentTime />] UI rendering complete (React hydration)</div>
            <div className="warning">[<CurrentTime />] Font loading completed with fallbacks</div>
            <div className="text-text-secondary">[<CurrentTime />] Audio system enabled</div>
            <div className="system-message">[<CurrentTime />] Formulation processor initialized</div>
            <div className="value-positive">[<CurrentTime />] Module System activated</div>
            <div className="warning animate-pulse">[<CurrentTime />] Awaiting user input _</div>
          </div>
        </div>

        {/* Command & F-Key Bar */}
        <div className="col-span-2 border border-border-subtle p-1">
          <div className="flex justify-between mb-1">
            <span className="server-info text-[1rem] font-bold">COMMANDS</span>
            <span className="warning text-[0.875rem]">MODULE_SYS</span>
          </div>

          <div className="grid grid-cols-1 gap-y-1 text-[0.875rem]">
            <div className="flex justify-between">
              <span className="text-text-secondary">F1:</span>
              <span className="server-info">HELP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">F2:</span>
              <span className="server-info">SAVE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">F3:</span>
              <span className="server-info">SEARCH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">F10:</span>
              <span className="server-info animate-pulse">QUIT</span>
            </div>
          </div>

          <div className="mt-1 flex items-center justify-between text-[0.875rem]">
            <span className="text-text-secondary">ACTIVE:</span>
            <span className="server-info font-bold">MODULES</span>
          </div>
        </div>

        {/* System Branding */}
        <div className="cols-span-12 md:col-span-12 lg:col-span-12 flex justify-between items-end mt-1 text-[0.875rem]">
          <div className="flex items-center">
            <span className="text-text-secondary">
              KRAFT_AI_TERMINAL v1.0.2 | <span className="server-info">MODULE_SYSTEM v2.0</span> |
              <span className={systemStatus === 'online' ? 'value-positive' : 'error'}>
                {' '}{systemStatus.toUpperCase()}
              </span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-text-secondary">
              NET: <span className="network-info">123ms</span>
            </div>
            <div>
              <span className={`${systemStatus === 'online' ? 'value-positive' : 'error'} animate-pulse`}>
                {systemStatus === 'online' ? '▀ ▄ ▀ ▄ ▀ ▄ ▀ ▄' : '_ _ _ _ _ _ _ _'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}