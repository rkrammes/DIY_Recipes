const http = require('http');

// Function to check if the server is running on a specific port
function checkServerRunning(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      console.log(`Server is running on port ${port}!`);
      console.log(`Status code: ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.error(`Error connecting to port ${port}: ${err.message}`);
      resolve(false);
    });

    // Set a timeout for the request
    req.setTimeout(5000, () => {
      req.abort();
      console.error(`Connection to port ${port} timed out`);
      resolve(false);
    });
  });
}

// Check both ports 3000 and 3001
async function main() {
  console.log("Checking if server is running on port 3000...");
  const isRunning3000 = await checkServerRunning(3000);

  console.log("\nChecking if server is running on port 3001...");
  const isRunning3001 = await checkServerRunning(3001);

  if (isRunning3000) {
    console.log("\nSUCCESS: The application is running on port 3000");
    console.log("You can access it at: http://localhost:3000");
  } else if (isRunning3001) {
    console.log("\nSUCCESS: The application is running on port 3001");
    console.log("You can access it at: http://localhost:3001");
  } else {
    console.log("\nERROR: The application does not appear to be running on either port 3000 or 3001");
    console.log("Try restarting with the start script: ./start-on-port-3001.sh");
  }
}

main();