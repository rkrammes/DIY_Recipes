#!/usr/bin/env python3
"""
Simple HTTP Server in Python
"""

import http.server
import socketserver
import os
import sys

# Set the port
PORT = 7777

class MyHandler(http.server.SimpleHTTPRequestHandler):
    """Custom request handler"""
    def do_GET(self):
        """Handle GET requests"""
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        
        # Send a simple HTML response
        response = f"""
        <html>
        <head>
            <title>Python Test Server</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }}
                .container {{ max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }}
                h1 {{ color: #2c3e50; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Python HTTP Server</h1>
                <p>This page is served by a Python HTTP server on port {PORT}.</p>
                <p>Server info:</p>
                <ul>
                    <li>Python version: {sys.version}</li>
                    <li>Process ID: {os.getpid()}</li>
                    <li>Current directory: {os.getcwd()}</li>
                </ul>
            </div>
        </body>
        </html>
        """
        
        self.wfile.write(response.encode('utf-8'))

# Create and start the server
Handler = MyHandler

try:
    with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
        print(f"Server started at http://localhost:{PORT}")
        print(f"Server started at http://127.0.0.1:{PORT}")
        print(f"Process ID: {os.getpid()}")
        httpd.serve_forever()
except KeyboardInterrupt:
    print("Server stopped by user")
except Exception as e:
    print(f"Error starting server: {e}")