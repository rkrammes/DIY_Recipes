/**
 * Simplified Supabase MCP Adapter
 * 
 * A lightweight adapter for the Supabase MCP server
 * designed to work with the proxy server.
 */

// Base types for user and session
export interface User {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
}

export interface Session {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user: User;
}

/**
 * Simplified Supabase MCP Adapter
 */
export class SimplifiedSupabaseMcpAdapter {
  private apiUrl: string;
  private connected: boolean = false;

  /**
   * Constructor
   * @param options Configuration options
   */
  constructor(options: { apiUrl?: string } = {}) {
    this.apiUrl = options.apiUrl || '/api/mcp';
  }

  /**
   * Connect to the MCP server
   */
  async connect(): Promise<boolean> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      this.connected = true;
      console.log('Connected to Supabase MCP server:', data);
      return true;
    } catch (error) {
      console.error('Failed to connect to Supabase MCP server:', error);
      this.connected = false;
      throw error;
    }
  }

  /**
   * Disconnect from the MCP server
   */
  async disconnect(): Promise<boolean> {
    this.connected = false;
    return true;
  }

  /**
   * Check if the adapter is connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Execute an MCP function
   * @param toolName The name of the tool to execute
   * @param params The parameters to pass to the tool
   * @returns The result of the function call
   */
  async executeFunction<T = any>(toolName: string, params: Record<string, any> = {}): Promise<T> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      const response = await fetch(`${this.apiUrl}/tool/${toolName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned status: ${response.status}, ${errorText}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error(`Failed to execute function ${toolName}:`, error);
      throw error;
    }
  }

  /**
   * Execute an SQL query
   * @param sql The SQL query to execute
   * @returns The query results
   */
  async executeQuery<T = any>(sql: string): Promise<T[]> {
    return this.executeFunction<T[]>('query_data', { sql });
  }

  /**
   * Authenticate a user
   * @param email The user's email
   * @param password The user's password
   * @returns The authenticated user and session
   */
  async authenticate(email: string, password: string): Promise<Session> {
    return this.executeFunction<Session>('authenticate', { email, password });
  }

  /**
   * Get a user by ID
   * @param userId The user ID
   * @returns The user data
   */
  async getUser(userId: string): Promise<User> {
    return this.executeFunction<User>('get_user', { user_id: userId });
  }

  /**
   * Create a record
   * @param table The table name
   * @param record The record data
   * @returns The created record(s)
   */
  async createRecord<T = any>(table: string, record: Record<string, any>): Promise<T[]> {
    return this.executeFunction<T[]>('create_record', { table, record });
  }

  /**
   * Update a record
   * @param table The table name
   * @param recordId The record ID
   * @param updates The update data
   * @param idField The ID field name (defaults to 'id')
   * @returns The updated record(s)
   */
  async updateRecord<T = any>(
    table: string, 
    recordId: string, 
    updates: Record<string, any>, 
    idField: string = 'id'
  ): Promise<T[]> {
    return this.executeFunction<T[]>('update_record', { 
      table, 
      record_id: recordId, 
      updates,
      id_field: idField 
    });
  }

  /**
   * Delete a record
   * @param table The table name
   * @param recordId The record ID
   * @param idField The ID field name (defaults to 'id')
   * @returns The deleted record(s)
   */
  async deleteRecord<T = any>(
    table: string, 
    recordId: string, 
    idField: string = 'id'
  ): Promise<T[]> {
    return this.executeFunction<T[]>('delete_record', { 
      table, 
      record_id: recordId, 
      id_field: idField 
    });
  }
}