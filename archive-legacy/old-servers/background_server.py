#!/usr/bin/env python3
"""
Background HTTP Server in Python with detailed logging
"""

import http.server
import socketserver
import os
import sys
import datetime
import threading
import traceback

# Set the port
PORT = 6789

# Create log file
log_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "background_server.log")
with open(log_file, "w") as f:
    f.write(f"Server starting at {datetime.datetime.now()}\n")
    f.write(f"Python version: {sys.version}\n")
    f.write(f"Process ID: {os.getpid()}\n")
    f.write(f"Current directory: {os.getcwd()}\n\n")

def log_message(message):
    """Write a message to the log file"""
    with open(log_file, "a") as f:
        f.write(f"{datetime.datetime.now()} - {message}\n")

class MyHandler(http.server.SimpleHTTPRequestHandler):
    """Custom request handler with logging"""
    def log_message(self, format, *args):
        """Override log_message to write to our log file"""
        message = f"{self.address_string()} - {format % args}"
        log_message(message)
        
    def do_GET(self):
        """Handle GET requests"""
        log_message(f"GET request received: {self.path}")
        
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        
        # Send a simple HTML response
        response = f"""
        <html>
        <head>
            <title>Python Background Server</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }}
                .container {{ max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }}
                h1 {{ color: #2c3e50; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Python Background HTTP Server</h1>
                <p>This page is served by a Python HTTP server on port {PORT}.</p>
                <p>This request was logged to: {log_file}</p>
                <p>Server info:</p>
                <ul>
                    <li>Python version: {sys.version}</li>
                    <li>Process ID: {os.getpid()}</li>
                    <li>Request time: {datetime.datetime.now()}</li>
                    <li>Request path: {self.path}</li>
                </ul>
            </div>
        </body>
        </html>
        """
        
        self.wfile.write(response.encode('utf-8'))

# Create a function to run the server
def run_server():
    try:
        log_message("Starting server")
        with socketserver.TCPServer(("0.0.0.0", PORT), MyHandler) as httpd:
            log_message(f"Server started at http://localhost:{PORT}")
            log_message(f"Server started at http://127.0.0.1:{PORT}")
            log_message(f"Process ID: {os.getpid()}")
            httpd.serve_forever()
    except Exception as e:
        log_message(f"Error in server: {e}")
        log_message(traceback.format_exc())

# Start the server in a separate thread
server_thread = threading.Thread(target=run_server)
server_thread.daemon = True
server_thread.start()

# Keep the main thread running to prevent the daemon thread from exiting
log_message("Main thread waiting for server to run")
try:
    while True:
        # Log keepalive message every 10 seconds
        log_message("Server still running")
        server_thread.join(10)
        if not server_thread.is_alive():
            log_message("Server thread died")
            break
except KeyboardInterrupt:
    log_message("Server stopped by Ctrl+C")
except Exception as e:
    log_message(f"Error in main thread: {e}")
    log_message(traceback.format_exc())