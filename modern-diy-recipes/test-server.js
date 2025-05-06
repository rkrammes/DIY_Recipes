const http = require("http");
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`
    <\!DOCTYPE html>
    <html>
    <head>
      <title>Server Test</title>
    </head>
    <body>
      <h1>Server Test</h1>
      <p>Server is running correctly at ${new Date().toLocaleString()}</p>
    </body>
    </html>
  `);
});

server.listen(3005, () => {
  console.log(`Test server running at http://localhost:3005`);
});
