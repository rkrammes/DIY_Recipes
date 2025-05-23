/**
 * Script to analyze the page structure of the DIY Recipes app
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create directory for output if it doesn't exist
const outputDir = path.join(__dirname, 'test-artifacts', 'page-structure');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper for delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function analyzePageStructure() {
  console.log('Starting page structure analysis...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to the app
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3000');
    await delay(3000);
    
    // Take screenshot
    const screenshotPath = path.join(outputDir, `homepage-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Homepage screenshot saved to: ${screenshotPath}`);
    
    // Analyze DOM structure
    const structure = await page.evaluate(() => {
      function getElementInfo(element, depth = 0, maxDepth = 3) {
        if (depth > maxDepth) return { tag: element.tagName, truncated: true };
        
        const children = Array.from(element.children).map(child => 
          getElementInfo(child, depth + 1, maxDepth)
        );
        
        return {
          tag: element.tagName,
          id: element.id || undefined,
          className: element.className || undefined,
          textContent: element.textContent?.trim().substring(0, 50) || undefined,
          children: children.length > 0 ? children : undefined
        };
      }
      
      // Get basic page structure
      const body = document.body;
      return getElementInfo(body);
    });
    
    // Write structure to file
    const structurePath = path.join(outputDir, `structure-${Date.now()}.json`);
    fs.writeFileSync(structurePath, JSON.stringify(structure, null, 2));
    console.log(`Page structure saved to: ${structurePath}`);
    
    // Find potential recipe elements
    const recipeElements = await page.evaluate(() => {
      // Look for various elements that might be recipe items
      const potentialRecipes = [
        ...document.querySelectorAll('[data-recipe-id]'),
        ...document.querySelectorAll('*[class*="recipe"]'),
        ...document.querySelectorAll('li'),
        ...document.querySelectorAll('.card'),
        ...document.querySelectorAll('a[href*="recipe"]')
      ];
      
      return Array.from(new Set(potentialRecipes)).map(el => ({
        tag: el.tagName,
        id: el.id || undefined,
        className: el.className || undefined,
        textContent: el.textContent?.trim().substring(0, 50) || undefined,
        hasClickHandler: el.onclick !== null,
        href: el.href || undefined,
        attributes: Array.from(el.attributes).map(attr => `${attr.name}="${attr.value}"`).join(', ')
      })).slice(0, 20); // Limit to first 20 to avoid huge output
    });
    
    // Write recipe elements to file
    const recipePath = path.join(outputDir, `recipes-${Date.now()}.json`);
    fs.writeFileSync(recipePath, JSON.stringify(recipeElements, null, 2));
    console.log(`Potential recipe elements saved to: ${recipePath}`);
    
    // Take interactive actions
    console.log('Attempting to interact with a recipe...');
    
    // Try to find and click the first recipe element
    const clickResult = await page.evaluate(() => {
      // Collect all links with text content
      const links = Array.from(document.querySelectorAll('a'))
        .filter(a => a.textContent && a.textContent.trim().length > 0);
      
      // Look for links with likely recipe names
      const recipeLinks = links.filter(a => {
        const text = a.textContent.toLowerCase();
        return text.includes('recipe') || 
               text.length > 5; // Any reasonably named recipe
      });
      
      if (recipeLinks.length > 0) {
        recipeLinks[0].click();
        return {
          clicked: true,
          element: {
            tag: recipeLinks[0].tagName,
            text: recipeLinks[0].textContent.trim(),
            href: recipeLinks[0].href
          }
        };
      }
      
      return { clicked: false };
    });
    
    console.log('Click result:', clickResult);
    
    if (clickResult.clicked) {
      await delay(2000);
      
      // Take screenshot of recipe details
      const detailsScreenshotPath = path.join(outputDir, `details-${Date.now()}.png`);
      await page.screenshot({ path: detailsScreenshotPath, fullPage: true });
      console.log(`Recipe details screenshot saved to: ${detailsScreenshotPath}`);
      
      // Analyze recipe details page structure
      const detailsStructure = await page.evaluate(() => {
        // Look for versions section
        const versionSections = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
          .filter(h => h.textContent && h.textContent.includes('Version'));
        
        const buttons = Array.from(document.querySelectorAll('button'))
          .map(b => ({
            text: b.textContent.trim(),
            className: b.className,
            visible: b.offsetParent !== null
          }));
        
        return {
          title: document.querySelector('h1, h2')?.textContent.trim(),
          url: window.location.href,
          versionSections: versionSections.map(v => ({
            tag: v.tagName,
            text: v.textContent.trim(),
            parentElement: v.parentElement ? {
              tag: v.parentElement.tagName,
              className: v.parentElement.className
            } : null
          })),
          buttons
        };
      });
      
      // Write details structure to file
      const detailsPath = path.join(outputDir, `details-structure-${Date.now()}.json`);
      fs.writeFileSync(detailsPath, JSON.stringify(detailsStructure, null, 2));
      console.log(`Recipe details structure saved to: ${detailsPath}`);
    }
    
    console.log('Structure analysis completed');
    
  } catch (error) {
    console.error('Error during analysis:', error);
  } finally {
    await browser.close();
  }
}

analyzePageStructure().catch(console.error);