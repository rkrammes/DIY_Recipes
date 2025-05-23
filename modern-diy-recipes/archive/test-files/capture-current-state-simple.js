const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureCurrentState() {
  const browser = await puppeteer.launch({ 
    headless: true, 
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('1. Capturing main page...');
    await page.goto('http://localhost:3000/', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    await sleep(2000);
    
    await page.screenshot({ 
      path: path.join(__dirname, 'current-state-backup', '01-main-page.png'),
      fullPage: true 
    });
    
    // Get page content for analysis
    const pageContent = await page.content();
    const pageTitle = await page.title();
    const pageUrl = page.url();
    
    console.log(`Page title: ${pageTitle}`);
    console.log(`Page URL: ${pageUrl}`);
    
    // Check what type of interface we're looking at
    const hasTerminalClass = await page.evaluate(() => {
      return !!document.querySelector('.terminal-container, .retro-terminal, .kraft-terminal');
    });
    
    const hasDocumentInterface = await page.evaluate(() => {
      return !!document.querySelector('.document-container, .prose, article');
    });
    
    console.log(`Has terminal interface: ${hasTerminalClass}`);
    console.log(`Has document interface: ${hasDocumentInterface}`);
    
    // Try to get theme
    const theme = await page.evaluate(() => {
      const htmlTheme = document.documentElement.getAttribute('data-theme');
      const bodyTheme = document.body.getAttribute('data-theme');
      const localTheme = localStorage.getItem('kraft-terminal-theme');
      return htmlTheme || bodyTheme || localTheme || 'no-theme-found';
    });
    
    console.log(`Current theme: ${theme}`);
    
    // Save page info
    const info = {
      capturedAt: new Date().toISOString(),
      url: pageUrl,
      title: pageTitle,
      theme: theme,
      hasTerminalInterface: hasTerminalClass,
      hasDocumentInterface: hasDocumentInterface,
      viewport: await page.viewport()
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'current-state-backup', 'page-info.json'),
      JSON.stringify(info, null, 2)
    );
    
    // Try to capture recipes view
    console.log('2. Looking for recipes...');
    
    // Try clicking on first available button or link
    const clickableElements = await page.$$('button:not([disabled]), a[href*="recipe"]');
    if (clickableElements.length > 0) {
      console.log(`Found ${clickableElements.length} clickable elements`);
      await clickableElements[0].click();
      await sleep(2000);
      await page.screenshot({ 
        path: path.join(__dirname, 'current-state-backup', '02-after-first-click.png'),
        fullPage: true 
      });
    }
    
    console.log('State captured successfully!');
    
  } catch (error) {
    console.error('Error capturing state:', error);
  } finally {
    await browser.close();
  }
}

captureCurrentState();