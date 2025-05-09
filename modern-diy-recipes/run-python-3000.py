#!/usr/bin/env python3
"""
Ultra simple Python HTTP server on port 3000
"""
import http.server
import socketserver

PORT = 3000

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(b"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Success - Port 3000</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; }
                .success { color: green; font-weight: bold; }
            </style>
        </head>
        <body>
            <h1>Success! Server Running on Port 3000</h1>
            <p class="success">Python HTTP server is working correctly</p>
        </body>
        </html>
        """)