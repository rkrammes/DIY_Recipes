# Simple Python HTTP server on port 3000
import http.server
import socketserver
import os
from datetime import datetime

PORT = 3000
Handler = http.server.SimpleHTTPRequestHandler

# Change to the public directory if it exists
public_dir = os.path.join(os.getcwd(), 'public')
if os.path.isdir(public_dir):
    os.chdir(public_dir)
    print(f"Serving files from: {public_dir}")
else:
    print(f"Directory not found: {public_dir}")
    print(f"Serving files from current directory: {os.getcwd()}")

# Print server information
print(f"Server starting on port {PORT}...")
print(f"Server URL: http://localhost:{PORT}/")
print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

# Start the server
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Server is running at http://localhost:{PORT}/")
    httpd.serve_forever()