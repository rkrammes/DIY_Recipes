import { supabase } from '@/lib/supabase';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { PostgrestError } from '@supabase/supabase-js';

export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface RepositoryOptions {
  enableRealtime?: boolean;
  useFallbackData?: boolean;
}

export interface RepositoryQueryOptions {
  filters?: Record<string, any>;
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
  page?: number;
}

export interface RepositoryResponse<T> {
  data: T | null;
  error: Error | PostgrestError | null;
}

export interface RepositoryListResponse<T> {
  data: T[];
  error: Error | PostgrestError | null;
  count?: number;
}

/**
 * Base repository class with common functionality for all entities
 */
export class Repository<T extends BaseEntity> {
  protected tableName: string;
  protected options: RepositoryOptions;
  protected fallbackData: T[] = [];
  
  constructor(tableName: string, options: RepositoryOptions = {}) {
    this.tableName = tableName;
    this.options = {
      enableRealtime: options.enableRealtime ?? false,
      useFallbackData: options.useFallbackData ?? true
    };
  }
  
  /**
   * Get all records from the table
   */
  async getAll(options: RepositoryQueryOptions = {}): Promise<RepositoryListResponse<T>> {
    try {
      // Start building the query
      let query = supabase
        .from(this.tableName)
        .select('*');
      
      // Apply filters if any
      if (options.filters) {
        query = this.applyFilters(query, options.filters);
      }
      
      // Apply order by if specified
      if (options.orderBy) {
        query = query.order(options.orderBy, { 
          ascending: options.ascending ?? false 
        });
      }
      
      // Apply pagination if specified
      if (options.limit) {
        query = query.limit(options.limit);
        
        if (options.page && options.page > 1) {
          const offset = (options.page - 1) * options.limit;
          query = query.range(offset, offset + options.limit - 1);
        }
      }
      
      // Execute the query
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error fetching ${this.tableName}:`, error.message);
        
        // If using fallback data is enabled, return it on error
        if (this.options.useFallbackData && this.fallbackData.length > 0) {
          console.log(`Using fallback data for ${this.tableName}`);
          return { 
            data: this.fallbackData, 
            error: null 
          };
        }
        
        // Otherwise, return the error
        return { data: [], error };
      }
      
      return { data: data || [], error: null };
    } catch (err) {
      console.error(`Exception in ${this.tableName}.getAll:`, err);
      const error = err instanceof Error ? err : new Error(String(err));
      
      // If using fallback data is enabled, return it on error
      if (this.options.useFallbackData && this.fallbackData.length > 0) {
        console.log(`Using fallback data for ${this.tableName} after exception`);
        return { 
          data: this.fallbackData, 
          error: null 
        };
      }
      
      return { data: [], error };
    }
  }
  
  /**
   * Get a record by its ID
   */
  async getById(id: string): Promise<RepositoryResponse<T>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Error fetching ${this.tableName} with ID ${id}:`, error.message);
        
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
        
        // Otherwise, return the error
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err) {
      console.error(`Exception in ${this.tableName}.getById:`, err);
      const error = err instanceof Error ? err : new Error(String(err));
      
      // If using fallback data is enabled, try to find the item in fallback data
      if (this.options.useFallbackData && this.fallbackData.length > 0) {
        const fallbackItem = this.fallbackData.find(item => item.id === id);
        
        if (fallbackItem) {
          console.log(`Using fallback data for ${this.tableName} with ID ${id} after exception`);
          return { 
            data: fallbackItem, 
            error: null 
          };
        }
      }
      
      return { data: null, error };
    }
  }
  
  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<RepositoryResponse<T>> {
    try {
      // Ensure created_at is set
      const newItem = {
        ...data,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: createdData, error } = await supabase
        .from(this.tableName)
        .insert(newItem)
        .select()
        .single();
      
      if (error) {
        console.error(`Error creating ${this.tableName}:`, error.message);
        return { data: null, error };
      }
      
      return { data: createdData, error: null };
    } catch (err) {
      console.error(`Exception in ${this.tableName}.create:`, err);
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: null, error };
    }
  }
  
  /**
   * Update an existing record
   */
  async update(id: string, data: Partial<T>): Promise<RepositoryResponse<T>> {
    try {
      // Ensure updated_at is set
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };
      
      const { data: updatedData, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Error updating ${this.tableName} with ID ${id}:`, error.message);
        return { data: null, error };
      }
      
      return { data: updatedData, error: null };
    } catch (err) {
      console.error(`Exception in ${this.tableName}.update:`, err);
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: null, error };
    }
  }
  
  /**
   * Delete a record
   */
  async delete(id: string): Promise<RepositoryResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Error deleting ${this.tableName} with ID ${id}:`, error.message);
        return { data: false, error };
      }
      
      return { data: true, error: null };
    } catch (err) {
      console.error(`Exception in ${this.tableName}.delete:`, err);
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
   * Subscribe to realtime changes for this table
   */
  subscribeToChanges(
    callback: (payload: { event: string; new: T | null; old: T | null }) => void
  ): { unsubscribe: () => void } {
    if (!this.options.enableRealtime) {
      console.warn(`Realtime not enabled for ${this.tableName}`);
      return { unsubscribe: () => {} };
    }
    
    const channel = supabase
      .channel(`${this.tableName}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: this.tableName },
        (payload) => {
          callback({
            event: payload.eventType,
            new: payload.new as T,
            old: payload.old as T
          });
        }
      )
      .subscribe();
    
    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  }
  
  /**
   * Subscribe to realtime changes for a specific record
   */
  subscribeToRecord(
    id: string,
    callback: (payload: { event: string; new: T | null; old: T | null }) => void
  ): { unsubscribe: () => void } {
    if (!this.options.enableRealtime) {
      console.warn(`Realtime not enabled for ${this.tableName}`);
      return { unsubscribe: () => {} };
    }
    
    const channel = supabase
      .channel(`${this.tableName}-${id}-changes`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: this.tableName,
          filter: `id=eq.${id}`
        },
        (payload) => {
          callback({
            event: payload.eventType,
            new: payload.new as T,
            old: payload.old as T
          });
        }
      )
      .subscribe();
    
    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  }
  
  /**
   * Apply filters to a query
   */
  protected applyFilters<U>(
    query: PostgrestFilterBuilder<any, any, U[]>, 
    filters: Record<string, any>
  ): PostgrestFilterBuilder<any, any, U[]> {
    let filteredQuery = query;
    
    // Apply each filter
    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null) continue;
      
      // Check if this is a special operator filter (e.g., 'name:ilike')
      if (key.includes(':')) {
        const [field, operator] = key.split(':');
        
        switch (operator) {
          case 'eq':
            filteredQuery = filteredQuery.eq(field, value);
            break;
          case 'neq':
            filteredQuery = filteredQuery.neq(field, value);
            break;
          case 'gt':
            filteredQuery = filteredQuery.gt(field, value);
            break;
          case 'gte':
            filteredQuery = filteredQuery.gte(field, value);
            break;
          case 'lt':
            filteredQuery = filteredQuery.lt(field, value);
            break;
          case 'lte':
            filteredQuery = filteredQuery.lte(field, value);
            break;
          case 'ilike':
            filteredQuery = filteredQuery.ilike(field, `%${value}%`);
            break;
          case 'like':
            filteredQuery = filteredQuery.like(field, `%${value}%`);
            break;
          case 'in':
            if (Array.isArray(value)) {
              filteredQuery = filteredQuery.in(field, value);
            }
            break;
          default:
            console.warn(`Unknown operator ${operator} for field ${field}`);
        }
      } else {
        // Simple equality filter
        filteredQuery = filteredQuery.eq(key, value);
      }
    }
    
    return filteredQuery;
  }
}