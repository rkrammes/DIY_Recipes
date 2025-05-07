import SupabaseMcpAdapter from '@/lib/mcp/adapters/supabaseMcpAdapter';
import { BaseEntity, RepositoryOptions, RepositoryQueryOptions, RepositoryResponse, RepositoryListResponse } from './repository';

/**
 * MCP-specific repository options
 */
export interface McpRepositoryOptions extends RepositoryOptions {
  adapter?: SupabaseMcpAdapter;
  configPath?: string;
  token?: string;
}

/**
 * Repository implementation that uses the Supabase MCP adapter
 */
export class McpRepository<T extends BaseEntity> {
  protected tableName: string;
  protected adapter: SupabaseMcpAdapter;
  protected fallbackData: T[] = [];
  protected options: McpRepositoryOptions;
  
  constructor(tableName: string, options: McpRepositoryOptions = {}) {
    this.tableName = tableName;
    this.options = {
      enableRealtime: options.enableRealtime ?? false,
      useFallbackData: options.useFallbackData ?? true,
      ...options
    };
    
    // Use provided adapter or create a new one
    this.adapter = options.adapter || new SupabaseMcpAdapter({
      serverPath: options.configPath,
      token: options.token
    });
  }
  
  /**
   * Connect to the MCP adapter
   */
  protected async ensureConnected(): Promise<void> {
    if (!this.adapter.isConnected) {
      await this.adapter.connect();
    }
  }
  
  /**
   * Get all records from the table
   */
  async getAll(options: RepositoryQueryOptions = {}): Promise<RepositoryListResponse<T>> {
    try {
      await this.ensureConnected();
      
      // Build filter object
      const filter: Record<string, any> = {};
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          // Handle special operators (e.g., 'name:ilike')
          if (key.includes(':')) {
            const [field, operator] = key.split(':');
            
            switch (operator) {
              case 'eq':
                filter[field] = value;
                break;
              case 'neq':
                filter[`${field}.neq`] = value;
                break;
              case 'gt':
                filter[`${field}.gt`] = value;
                break;
              case 'gte':
                filter[`${field}.gte`] = value;
                break;
              case 'lt':
                filter[`${field}.lt`] = value;
                break;
              case 'lte':
                filter[`${field}.lte`] = value;
                break;
              case 'ilike':
                filter[`${field}.ilike`] = `%${value}%`;
                break;
              case 'like':
                filter[`${field}.like`] = `%${value}%`;
                break;
              case 'in':
                if (Array.isArray(value)) {
                  filter[`${field}.in`] = value;
                }
                break;
              default:
                console.warn(`Unknown operator ${operator} for field ${field}`);
            }
          } else {
            // Simple equality filter
            filter[key] = value;
          }
        });
      }
      
      // Build select parameters
      const selectParams = {
        table: this.tableName,
        columns: '*',
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        options: {
          limit: options.limit,
          offset: options.page && options.limit 
            ? (options.page - 1) * options.limit
            : undefined,
          order: options.orderBy ? {
            column: options.orderBy,
            ascending: options.ascending ?? false
          } : undefined
        }
      };
      
      // Execute query
      const data = await this.adapter.select<T>(selectParams);
      
      return { 
        data: data || [], 
        error: null 
      };
    } catch (err) {
      console.error(`Error in ${this.tableName}.getAll via MCP:`, err);
      
      // If using fallback data is enabled, return it on error
      if (this.options.useFallbackData && this.fallbackData.length > 0) {
        console.log(`Using fallback data for ${this.tableName}`);
        return { 
          data: this.fallbackData, 
          error: null 
        };
      }
      
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: [], error };
    }
  }
  
  /**
   * Get a record by its ID
   */
  async getById(id: string): Promise<RepositoryResponse<T>> {
    try {
      await this.ensureConnected();
      
      const data = await this.adapter.select<T>({
        table: this.tableName,
        filter: { id }
      });
      
      if (!data || data.length === 0) {
        throw new Error(`Record with ID ${id} not found`);
      }
      
      return { 
        data: data[0], 
        error: null 
      };
    } catch (err) {
      console.error(`Error in ${this.tableName}.getById via MCP:`, err);
      
      // If using fallback data is enabled, try to find the item in fallback data
      if (this.options.useFallbackData && this.fallbackData.length > 0) {
        const fallbackItem = this.fallbackData.find(item => item.id === id);
        
        if (fallbackItem) {
          console.log(`Using fallback data for ${this.tableName} with ID ${id}`);
          return { 
            data: fallbackItem, 
            error: null 
          };
        }
      }
      
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: null, error };
    }
  }
  
  /**
   * Create a new record
   */
  async create(item: Partial<T>): Promise<RepositoryResponse<T>> {
    try {
      await this.ensureConnected();
      
      // Ensure created_at is set
      const newItem = {
        ...item,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const data = await this.adapter.insert<T>({
        table: this.tableName,
        data: newItem
      });
      
      if (!data || data.length === 0) {
        throw new Error(`Failed to create record in ${this.tableName}`);
      }
      
      return { 
        data: data[0], 
        error: null 
      };
    } catch (err) {
      console.error(`Error in ${this.tableName}.create via MCP:`, err);
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: null, error };
    }
  }
  
  /**
   * Update an existing record
   */
  async update(id: string, updates: Partial<T>): Promise<RepositoryResponse<T>> {
    try {
      await this.ensureConnected();
      
      // Ensure updated_at is set
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      const data = await this.adapter.update<T>({
        table: this.tableName,
        data: updateData,
        filter: { id }
      });
      
      if (!data || data.length === 0) {
        throw new Error(`Failed to update record with ID ${id} in ${this.tableName}`);
      }
      
      return { 
        data: data[0], 
        error: null 
      };
    } catch (err) {
      console.error(`Error in ${this.tableName}.update via MCP:`, err);
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: null, error };
    }
  }
  
  /**
   * Delete a record
   */
  async delete(id: string): Promise<RepositoryResponse<boolean>> {
    try {
      await this.ensureConnected();
      
      const data = await this.adapter.delete({
        table: this.tableName,
        filter: { id }
      });
      
      return { 
        data: true, 
        error: null 
      };
    } catch (err) {
      console.error(`Error in ${this.tableName}.delete via MCP:`, err);
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: false, error };
    }
  }
  
  /**
   * Set fallback data for this repository
   */
  setFallbackData(data: T[]): void {
    this.fallbackData = data;
  }
  
  /**
   * Check if the MCP adapter is connected
   */
  async isConnected(): Promise<boolean> {
    return this.adapter.isConnected;
  }
}