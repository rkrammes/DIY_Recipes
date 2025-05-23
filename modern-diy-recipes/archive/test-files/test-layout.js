const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function testLayout() {
  console.log('Starting layout test...');
  
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    // Test the homepage layout
    console.log('Testing homepage layout...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    
    // Create artifacts directory if it doesn't exist
    const artifactsDir = path.join(process.cwd(), 'test-artifacts');
    if (!fs.existsSync(artifactsDir)) {
      fs.mkdirSync(artifactsDir);
    }
    
    // Take a screenshot of the homepage
    await page.screenshot({ 
      path: path.join(artifactsDir, 'home-layout-test.png'),
      fullPage: true
    });
    console.log('Homepage screenshot saved');
    
    // Check the main content structure
    const layoutInfo = await page.evaluate(() => {
      // Log some debug info about the page structure
      const bodyChildren = document.body.children;
      let bodyStructure = 'Body has ' + bodyChildren.length + ' children: ';
      for (let i = 0; i < bodyChildren.length; i++) {
        const child = bodyChildren[i];
        bodyStructure += `\n - Child ${i}: ${child.tagName}, class=${child.className}, id=${child.id}`;
      }
      
      // Look for the main layout container
      const containers = document.querySelectorAll('div.flex, div.grid, div[class*="grid-cols"], div[class*="flex h-"]');
      let containersInfo = `Found ${containers.length} potential layout containers:`;
      
      for (let i = 0; i < containers.length; i++) {
        const container = containers[i];
        const style = window.getComputedStyle(container);
        containersInfo += `\n - Container ${i}: class=${container.className}, display=${style.display}`;
        
        if (style.display === 'grid') {
          containersInfo += `, grid-columns=${style.gridTemplateColumns}`;
        } else if (style.display === 'flex') {
          containersInfo += `, children=${container.children.length}`;
        }
      }
      
      return {
        bodyStructure,
        containersInfo
      };
    });
    
    console.log('Layout analysis:');
    console.log(layoutInfo.bodyStructure);
    console.log(layoutInfo.containersInfo);
    
    // Try to access Formula Database page
    console.log('Testing formula database page accessibility...');
    try {
      await page.goto('http://localhost:3000/formula-database', { timeout: 5000 });
      console.log('Formula Database page loaded successfully');
      
      await page.screenshot({ 
        path: path.join(artifactsDir, 'formula-database-test.png'),
        fullPage: true
      });
      console.log('Formula Database screenshot saved');
    } catch (error) {
      console.error('Error accessing Formula Database page:', error.message);
    }
    
    console.log('Layout tests completed');
  } catch (error) {
    console.error('Error during layout tests:', error);
  } finally {
    await browser.close();
  }
}

testLayout().catch(console.error);