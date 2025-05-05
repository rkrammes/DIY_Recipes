# DIY Recipes Web Server Setup

We've created multiple server options for you to try. Here's a summary of what we've found:

## 1. File-Based Testing
- You can directly open the HTML file we created:
  ```
  open test.html
  ```
- This will open in your default browser and let you test if basic file access works

## 2. Python HTTP Server
- Run this command in your terminal to start a simple Python web server:
  ```
  cd "/Users/ryankrammes/Kraft_AI (App)/DIY_Recipes"
  python3 -m http.server 3000
  ```
- Then access http://localhost:3000 in your browser

## 3. Node.js Server
- We've created a custom Node.js server:
  ```
  cd "/Users/ryankrammes/Kraft_AI (App)/DIY_Recipes"
  node durable_node_server.js
  ```
- Then access http://localhost:3000 in your browser

## 4. Modern Next.js Application
- You can run the Next.js application with:
  ```
  cd "/Users/ryankrammes/Kraft_AI (App)/DIY_Recipes/modern-diy-recipes"
  npm run dev
  ```
- Then access http://localhost:3000 in your browser

## Troubleshooting Tips
1. Try different browsers (Safari, Chrome, Firefox)
2. Try both `localhost` and `127.0.0.1` as the hostname
3. Check if port 3000 is already in use: `lsof -i :3000`
4. Ensure no firewall or security software is blocking connections
5. Check System Preferences → Security & Privacy → Firewall settings

We've observed that Python-based servers seem to work more consistently than Node.js ones on this system.