'use client';

import React, { useState, useEffect } from 'react';
import { useMcp } from '../providers/McpProvider';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useTheme } from '../providers/ConsolidatedThemeProvider';
import { Input } from './ui/input';
import { Label } from './ui/label';

/**
 * SupabaseIntegration component
 * 
 * This component demonstrates the usage of the Supabase MCP adapter
 * to interact with Supabase database and storage.
 */
export default function SupabaseIntegration() {
  const { supabase, isInitialized, initialize } = useMcp();
  const { theme } = useTheme();
  
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [records, setRecords] = useState<any[]>([]);
  const [buckets, setBuckets] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [newRecordData, setNewRecordData] = useState<Record<string, any>>({});
  const [selectedBucket, setSelectedBucket] = useState<string>('');

  // Initialize MCP if not already initialized
  useEffect(() => {
    if (!isInitialized) {
      initialize().catch(console.error);
    }
  }, [isInitialized, initialize]);

  // Load tables
  const loadTables = async () => {
    if (!supabase) {
      setError('Supabase MCP is not initialized. Click "Initialize" to connect.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // We use a special query to get tables
      const result = await supabase.executeFunction('db.select', {
        table: 'information_schema.tables',
        columns: 'table_name',
        filter: { table_schema: 'public' }
      });
      
      const tableNames = result.map((r: any) => r.table_name).filter(Boolean);
      setTables(tableNames);
    } catch (err) {
      console.error('Failed to load Supabase tables:', err);
      setError('Failed to load tables. ' + 
        (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Load records for a table
  const loadRecords = async (tableName: string) => {
    if (!supabase) {
      setError('Supabase MCP is not initialized');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSelectedTable(tableName);
      
      const result = await supabase.executeFunction('db.select', { 
        table: tableName,
        options: { limit: 10 }
      });
      
      setRecords(result || []);
      
      // Reset new record data
      if (result && result.length > 0) {
        const sampleRecord = result[0];
        const emptyRecord = Object.keys(sampleRecord).reduce((acc, key) => {
          acc[key] = '';
          return acc;
        }, {} as Record<string, any>);
        setNewRecordData(emptyRecord);
      }
    } catch (err) {
      console.error('Failed to load records:', err);
      setError('Failed to load records. ' + 
        (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Load storage buckets
  const loadBuckets = async () => {
    if (!supabase) {
      setError('Supabase MCP is not initialized');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // This is a simplified approach - actual implementation would use storage.listBuckets
      // But for demonstration, we'll just show a simulated response
      const simulatedBuckets = [
        { name: 'public', id: 'public', public: true },
        { name: 'private', id: 'private', public: false },
        { name: 'avatars', id: 'avatars', public: true }
      ];
      
      setBuckets(simulatedBuckets);
    } catch (err) {
      console.error('Failed to load buckets:', err);
      setError('Failed to load storage buckets. ' + 
        (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // List files in a bucket
  const listFiles = async (bucketName: string) => {
    if (!supabase) {
      setError('Supabase MCP is not initialized');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSelectedBucket(bucketName);
      
      const result = await supabase.executeFunction('storage.list', { 
        bucket: bucketName
      });
      
      setFiles(result || []);
    } catch (err) {
      console.error('Failed to list files:', err);
      setError('Failed to list files. ' + 
        (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Insert a new record
  const insertRecord = async () => {
    if (!supabase || !selectedTable) {
      setError('Supabase MCP is not initialized or no table selected');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await supabase.executeFunction('db.insert', {
        table: selectedTable,
        data: newRecordData
      });
      
      // Reload records
      await loadRecords(selectedTable);
    } catch (err) {
      console.error('Failed to insert record:', err);
      setError('Failed to insert record. ' + 
        (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto mb-8">
      <h2 className="text-2xl font-bold mb-4">Supabase MCP Integration</h2>
      
      <div className="mb-6">
        <p className="text-text-secondary mb-4">
          This component demonstrates integration with Supabase through the MCP adapter.
          It allows you to explore your database tables and storage buckets.
        </p>
        
        <div className="flex gap-4 mb-6">
          <Button 
            onClick={initialize}
            disabled={isInitialized}
            variant={isInitialized ? "outline" : "default"}
          >
            {isInitialized ? "MCP Initialized" : "Initialize MCP"}
          </Button>
          
          <Button 
            onClick={loadTables}
            disabled={loading || !isInitialized}
          >
            {loading ? "Loading..." : "Load Tables"}
          </Button>
          
          <Button 
            onClick={loadBuckets}
            disabled={loading || !isInitialized}
            variant="outline"
          >
            {loading ? "Loading..." : "Load Storage Buckets"}
          </Button>
        </div>
        
        {error && (
          <div className="p-4 bg-[oklch(var(--error)/0.1)] border border-[oklch(var(--error)/0.5)] rounded-md mb-4 text-[oklch(var(--error))]">
            {error}
          </div>
        )}
      </div>
      
      {/* Database Section */}
      {tables.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Database Tables</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            {tables.map(table => (
              <Button 
                key={table}
                variant={selectedTable === table ? "default" : "outline"}
                onClick={() => loadRecords(table)}
                disabled={loading}
                className="justify-start"
              >
                {table}
              </Button>
            ))}
          </div>
          
          {/* Table records */}
          {selectedTable && records.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-medium mb-2">Records in {selectedTable}</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      {Object.keys(records[0]).map(key => (
                        <th key={key} className="text-left py-2 px-4">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => (
                      <tr key={index} className="border-b border-border-subtle">
                        {Object.values(record).map((value, i) => (
                          <td key={i} className="py-2 px-4">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Insert form */}
              <div className="mt-6">
                <h4 className="text-lg font-medium mb-2">Insert New Record</h4>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {Object.keys(newRecordData).map(field => (
                    <div key={field}>
                      <Label htmlFor={field}>{field}</Label>
                      <Input
                        id={field}
                        value={newRecordData[field]}
                        onChange={e => setNewRecordData(prev => ({
                          ...prev,
                          [field]: e.target.value
                        }))}
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={insertRecord}
                  disabled={loading}
                >
                  Insert Record
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Storage Section */}
      {buckets.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Storage Buckets</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            {buckets.map(bucket => (
              <Button 
                key={bucket.id}
                variant={selectedBucket === bucket.name ? "default" : "outline"}
                onClick={() => listFiles(bucket.name)}
                disabled={loading}
                className="justify-start"
              >
                {bucket.name}
                {bucket.public && (
                  <span className="ml-2 text-xs py-0.5 px-2 bg-surface-1 rounded-full">
                    public
                  </span>
                )}
              </Button>
            ))}
          </div>
          
          {/* Files list */}
          {selectedBucket && (
            <div>
              <h4 className="text-lg font-medium mb-2">Files in {selectedBucket}</h4>
              {files.length === 0 ? (
                <p className="text-text-secondary">No files found in this bucket.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {files.map((file, index) => (
                    <Card key={index} className="p-3 border border-border-subtle">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-text-secondary">
                        {file.metadata?.size 
                          ? (file.metadata.size / 1024).toFixed(1) + ' KB'
                          : 'Unknown size'}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}