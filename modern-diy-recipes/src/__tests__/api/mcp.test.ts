import { POST, GET } from '@/app/api/mcp/route';
import { NextRequest } from 'next/server';

// Mock the MCP adapters
jest.mock('@/lib/mcp/adapters', () => ({
  getMcpAdapter: jest.fn(() => ({
    name: 'MockAdapter',
    isConnected: false,
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    executeFunction: jest.fn().mockResolvedValue({ result: 'test' }),
    getServerInfo: jest.fn().mockResolvedValue({ name: 'test', version: '1.0' }),
    listTools: jest.fn().mockResolvedValue(['tool1', 'tool2']),
  })),
}));

describe('MCP API Route', () => {
  describe('POST /api/mcp', () => {
    it('should handle connect action', async () => {
      const request = new NextRequest('http://localhost:3000/api/mcp', {
        method: 'POST',
        body: JSON.stringify({
          adapter: 'github',
          action: 'connect',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        connected: true,
      });
    });

    it('should handle status action', async () => {
      const request = new NextRequest('http://localhost:3000/api/mcp', {
        method: 'POST',
        body: JSON.stringify({
          adapter: 'github',
          action: 'status',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('connected');
      expect(data).toHaveProperty('name');
    });

    it('should return error for missing parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/mcp', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });
  });

  describe('GET /api/mcp', () => {
    it('should return adapter status', async () => {
      const request = new NextRequest('http://localhost:3000/api/mcp?adapter=github');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('adapter', 'github');
      expect(data).toHaveProperty('connected');
      expect(data).toHaveProperty('name');
    });

    it('should return error for missing adapter', async () => {
      const request = new NextRequest('http://localhost:3000/api/mcp');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('available');
    });
  });
});