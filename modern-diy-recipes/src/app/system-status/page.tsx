'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ConsolidatedThemeProvider';

interface SystemStatus {
  cpu: {
    usage: number;
    cores: number;
    model: string;
  };
  memory: {
    used: number;
    total: number;
    free: number;
  };
  disk: {
    used: number;
    total: number;
    free: number;
  };
  network: {
    status: string;
    type: string;
    ip: string;
    upload: number;
    download: number;
  };
  services: {
    name: string;
    status: 'running' | 'stopped' | 'error' | 'warning';
    uptime: number;
    pid?: number;
  }[];
  users: {
    count: number;
    active: number;
  };
  os: {
    name: string;
    version: string;
    uptime: number;
  };
}

export default function SystemStatusPage() {
  const { value: themeContext } = useTheme();
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    cpu: { usage: 0, cores: 4, model: 'Intel Core i7-1165G7' },
    memory: { used: 0, total: 8192, free: 0 },
    disk: { used: 0, total: 512000, free: 0 },
    network: { status: 'disconnected', type: 'WiFi', ip: '0.0.0.0', upload: 0, download: 0 },
    services: [],
    users: { count: 0, active: 0 },
    os: { name: 'DIY_OS', version: '1.0.0', uptime: 0 }
  });
  
  // Get theme style
  const themeStyle = themeContext?.theme === 'dystopia' || themeContext?.theme === 'terminal-mono'
    ? 'terminal'
    : themeContext?.theme === 'neotopia' || themeContext?.theme === 'paper-ledger'
      ? 'paper'
      : 'hacker';
  
  // Simulate system monitoring
  useEffect(() => {
    // Initialize services - API-related services removed
    const initialServices = [
      { name: 'system-core', status: 'running' as const, uptime: 7200, pid: 1024 },
      { name: 'data-manager', status: 'running' as const, uptime: 7100, pid: 1036 },
      { name: 'recipe-engine', status: 'running' as const, uptime: 7000, pid: 1048 },
      { name: 'fs-monitor', status: 'running' as const, uptime: 3600, pid: 2048 },
      { name: 'cache-service', status: 'warning' as const, uptime: 3500, pid: 2060 },
      { name: 'backup-service', status: 'running' as const, uptime: 3400, pid: 2072 },
      { name: 'metrics', status: 'stopped' as const, uptime: 0 }
    ];
    
    setSystemStatus(prev => ({...prev, services: initialServices}));
    
    // Update stats periodically
    const interval = setInterval(() => {
      setSystemStatus(prev => {
        // Simulate CPU and memory fluctuations
        const cpuUsage = Math.min(100, Math.max(5, prev.cpu.usage + (Math.random() * 10 - 5)));
        const memoryUsed = Math.min(prev.memory.total, Math.max(1024, prev.memory.used + (Math.random() * 200 - 100)));
        const memoryFree = prev.memory.total - memoryUsed;
        
        // Simulate disk usage (slowly increasing)
        const diskUsed = Math.min(prev.disk.total, prev.disk.used + (Math.random() * 10));
        const diskFree = prev.disk.total - diskUsed;
        
        // Simulate network traffic
        const uploadSpeed = Math.max(0, Math.floor(Math.random() * 1000));
        const downloadSpeed = Math.max(0, Math.floor(Math.random() * 2000));
        
        // Update service status randomly
        const updatedServices = prev.services.map(service => {
          // 2% chance of status change
          if (Math.random() < 0.02) {
            const statuses: ('running' | 'warning' | 'error' | 'stopped')[] = ['running', 'warning', 'error', 'stopped'];
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
            return { ...service, status: newStatus };
          }
          
          // Increment uptime for running services
          if (service.status === 'running' || service.status === 'warning') {
            return { ...service, uptime: service.uptime + 1 };
          }
          
          return service;
        });
        
        // Update users
        const userCount = 8 + Math.floor(Math.random() * 4);
        const activeUsers = Math.min(userCount, Math.floor(Math.random() * 6) + 1);
        
        return {
          ...prev,
          cpu: { ...prev.cpu, usage: cpuUsage },
          memory: { ...prev.memory, used: memoryUsed, free: memoryFree },
          disk: { ...prev.disk, used: diskUsed, free: diskFree },
          network: { 
            ...prev.network, 
            status: 'connected', 
            ip: '127.0.0.1', 
            upload: uploadSpeed, 
            download: downloadSpeed 
          },
          services: updatedServices,
          users: { count: userCount, active: activeUsers },
          os: { ...prev.os, uptime: prev.os.uptime + 1 }
        };
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Format uptime to readable string
  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };
  
  // Format bytes to readable string
  const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'running':
        return themeStyle === 'terminal' ? 'text-green-500' : 'text-green-600';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      case 'stopped':
        return 'text-gray-500';
      default:
        return 'text-gray-400';
    }
  };
  
  return (
    <div className={`p-6 ${
      themeStyle === 'terminal' 
        ? 'font-terminal terminal-scanlines' 
        : themeStyle === 'paper' 
          ? 'font-mono paper-texture' 
          : 'font-mono'
    }`}>
      <h1 className="text-2xl font-bold mb-8">System Status</h1>
      
      {/* Grid layout for system stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* CPU section */}
        <div className={`p-4 rounded-md ${
          themeStyle === 'terminal' 
            ? 'bg-surface-1/40 border border-text-primary/30' 
            : themeStyle === 'paper' 
              ? 'bg-surface-1/60 border border-border-subtle shadow' 
              : 'bg-surface-1/70 border border-accent/30 shadow-lg'
        }`}>
          <h2 className="text-lg font-semibold mb-3">CPU</h2>
          
          <div className="flex justify-between mb-2">
            <span className="text-text-secondary">Model:</span>
            <span>{systemStatus.cpu.model}</span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span className="text-text-secondary">Cores:</span>
            <span>{systemStatus.cpu.cores}</span>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-text-secondary">Usage:</span>
              <span className={`${
                systemStatus.cpu.usage > 80 
                  ? 'text-red-500' 
                  : systemStatus.cpu.usage > 50 
                    ? 'text-yellow-500' 
                    : 'text-green-500'
              }`}>
                {systemStatus.cpu.usage.toFixed(1)}%
              </span>
            </div>
            
            <div className="w-full bg-surface-0 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full ${
                  systemStatus.cpu.usage > 80 
                    ? 'bg-red-500' 
                    : systemStatus.cpu.usage > 50 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                }`}
                style={{ width: `${systemStatus.cpu.usage}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Memory section */}
        <div className={`p-4 rounded-md ${
          themeStyle === 'terminal' 
            ? 'bg-surface-1/40 border border-text-primary/30' 
            : themeStyle === 'paper' 
              ? 'bg-surface-1/60 border border-border-subtle shadow' 
              : 'bg-surface-1/70 border border-accent/30 shadow-lg'
        }`}>
          <h2 className="text-lg font-semibold mb-3">Memory</h2>
          
          <div className="flex justify-between mb-2">
            <span className="text-text-secondary">Total:</span>
            <span>{formatBytes(systemStatus.memory.total * 1024 * 1024)}</span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span className="text-text-secondary">Free:</span>
            <span>{formatBytes(systemStatus.memory.free * 1024 * 1024)}</span>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-text-secondary">Usage:</span>
              <span className={`${
                (systemStatus.memory.used / systemStatus.memory.total) > 0.8 
                  ? 'text-red-500' 
                  : (systemStatus.memory.used / systemStatus.memory.total) > 0.5 
                    ? 'text-yellow-500' 
                    : 'text-green-500'
              }`}>
                {formatBytes(systemStatus.memory.used * 1024 * 1024)} ({((systemStatus.memory.used / systemStatus.memory.total) * 100).toFixed(1)}%)
              </span>
            </div>
            
            <div className="w-full bg-surface-0 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full ${
                  (systemStatus.memory.used / systemStatus.memory.total) > 0.8 
                    ? 'bg-red-500' 
                    : (systemStatus.memory.used / systemStatus.memory.total) > 0.5 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                }`}
                style={{ width: `${(systemStatus.memory.used / systemStatus.memory.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* System services table */}
      <div className={`p-4 rounded-md mb-8 ${
        themeStyle === 'terminal' 
          ? 'bg-surface-1/40 border border-text-primary/30' 
          : themeStyle === 'paper' 
            ? 'bg-surface-1/60 border border-border-subtle shadow' 
            : 'bg-surface-1/70 border border-accent/30 shadow-lg'
      }`}>
        <h2 className="text-lg font-semibold mb-4">Services</h2>
        
        <div className={`overflow-x-auto ${themeStyle === 'terminal' ? 'terminal-text' : ''}`}>
          <table className="w-full min-w-full text-sm">
            <thead className={`${
              themeStyle === 'terminal' 
                ? 'border-b border-text-primary/30' 
                : 'border-b border-border-subtle'
            }`}>
              <tr>
                <th className="text-left py-2 font-bold">Service</th>
                <th className="text-left py-2 font-bold">Status</th>
                <th className="text-left py-2 font-bold">PID</th>
                <th className="text-left py-2 font-bold">Uptime</th>
              </tr>
            </thead>
            <tbody>
              {systemStatus.services.map((service, index) => (
                <tr 
                  key={service.name} 
                  className={index % 2 === 0 
                    ? themeStyle === 'terminal' ? 'bg-surface-0/50' : 'bg-surface-0/30' 
                    : ''
                  }
                >
                  <td className="py-2">{service.name}</td>
                  <td className={`py-2 ${getStatusColor(service.status)}`}>
                    {themeStyle === 'terminal' 
                      ? service.status === 'running' ? '[ RUNNING ]' 
                        : service.status === 'warning' ? '[ WARNING ]'
                        : service.status === 'error' ? '[ ERROR ]'
                        : '[ STOPPED ]'
                      : service.status
                    }
                  </td>
                  <td className="py-2">{service.pid || 'N/A'}</td>
                  <td className="py-2">{formatUptime(service.uptime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Network & disk info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Network section */}
        <div className={`p-4 rounded-md ${
          themeStyle === 'terminal' 
            ? 'bg-surface-1/40 border border-text-primary/30' 
            : themeStyle === 'paper' 
              ? 'bg-surface-1/60 border border-border-subtle shadow' 
              : 'bg-surface-1/70 border border-accent/30 shadow-lg'
        }`}>
          <h2 className="text-lg font-semibold mb-3">Network</h2>
          
          <div className="flex justify-between mb-2">
            <span className="text-text-secondary">Status:</span>
            <span className={systemStatus.network.status === 'connected' ? 'text-green-500' : 'text-red-500'}>
              {systemStatus.network.status.toUpperCase()}
            </span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span className="text-text-secondary">Type:</span>
            <span>{systemStatus.network.type}</span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span className="text-text-secondary">IP Address:</span>
            <span className="font-mono">{systemStatus.network.ip}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div>
              <div className="text-text-secondary mb-1 text-sm">Upload</div>
              <div className="font-mono">{systemStatus.network.upload} KB/s</div>
            </div>
            <div>
              <div className="text-text-secondary mb-1 text-sm">Download</div>
              <div className="font-mono">{systemStatus.network.download} KB/s</div>
            </div>
          </div>
        </div>
        
        {/* Disk section */}
        <div className={`p-4 rounded-md ${
          themeStyle === 'terminal' 
            ? 'bg-surface-1/40 border border-text-primary/30' 
            : themeStyle === 'paper' 
              ? 'bg-surface-1/60 border border-border-subtle shadow' 
              : 'bg-surface-1/70 border border-accent/30 shadow-lg'
        }`}>
          <h2 className="text-lg font-semibold mb-3">Disk</h2>
          
          <div className="flex justify-between mb-2">
            <span className="text-text-secondary">Total:</span>
            <span>{formatBytes(systemStatus.disk.total * 1024 * 1024)}</span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span className="text-text-secondary">Free:</span>
            <span>{formatBytes(systemStatus.disk.free * 1024 * 1024)}</span>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-text-secondary">Usage:</span>
              <span className={`${
                (systemStatus.disk.used / systemStatus.disk.total) > 0.9 
                  ? 'text-red-500' 
                  : (systemStatus.disk.used / systemStatus.disk.total) > 0.7 
                    ? 'text-yellow-500' 
                    : 'text-green-500'
              }`}>
                {formatBytes(systemStatus.disk.used * 1024 * 1024)} ({((systemStatus.disk.used / systemStatus.disk.total) * 100).toFixed(1)}%)
              </span>
            </div>
            
            <div className="w-full bg-surface-0 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full ${
                  (systemStatus.disk.used / systemStatus.disk.total) > 0.9 
                    ? 'bg-red-500' 
                    : (systemStatus.disk.used / systemStatus.disk.total) > 0.7 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                }`}
                style={{ width: `${(systemStatus.disk.used / systemStatus.disk.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* System info footer */}
      <div className={`p-4 rounded-md ${
        themeStyle === 'terminal' 
          ? 'bg-surface-1/40 border border-text-primary/30' 
          : themeStyle === 'paper' 
            ? 'bg-surface-1/60 border border-border-subtle shadow' 
            : 'bg-surface-1/70 border border-accent/30 shadow-lg'
      }`}>
        <div className="flex flex-wrap justify-between">
          <div className="mb-2 mr-4">
            <span className="text-text-secondary">OS: </span>
            <span>{systemStatus.os.name} v{systemStatus.os.version}</span>
          </div>
          
          <div className="mb-2 mr-4">
            <span className="text-text-secondary">Uptime: </span>
            <span>{formatUptime(systemStatus.os.uptime)}</span>
          </div>
          
          <div className="mb-2 mr-4">
            <span className="text-text-secondary">Users: </span>
            <span>{systemStatus.users.active}/{systemStatus.users.count} active</span>
          </div>
          
          <div className="mb-2">
            <span className="text-text-secondary">Last update: </span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}