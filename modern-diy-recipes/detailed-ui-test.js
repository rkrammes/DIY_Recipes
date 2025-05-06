#!/usr/bin/env node

/**
 * Detailed UI test with Puppeteer that captures console errors
 * and screenshots every step of the process
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'test-artifacts', 'detailed-ui-test');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Helper to take screenshot with timestamp
async function takeScreenshot(page, name) {
  const filename = path.join(screenshotsDir, `${name}-${Date.now()}.png`);
  await page.screenshot({ path: filename, fullPage: true });
  console.log(`Screenshot saved: ${filename}`);
  return filename;
}

async function testUI() {
  console.log('Starting detailed UI test with Puppeteer...');
  
  // Launch browser with devtools open to see console
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1200, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    devtools: true
  });
  
  try {
    const page = await browser.newPage();
    
    // Capture console logs
    page.on('console', msg => {
      console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`);
    });
    
    // Capture network errors
    page.on('requestfailed', request => {
      console.log(`NETWORK ERROR: ${request.url()} - ${request.failure().errorText}`);
    });
    
    // Capture JS errors
    page.on('pageerror', error => {
      console.log(`PAGE ERROR: ${error.message}`);
    });
    
    // Go to the app
    console.log('Step 1: Loading homepage');
    await page.goto('http://localhost:3000');
    await new Promise(r => setTimeout(r, 3000));
    await takeScreenshot(page, '1-homepage');
    
    // Output page HTML for debugging
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    console.log('Page HTML excerpt:', bodyHTML.substring(0, 500) + '...');
    
    // Look for any recipe link to click
    console.log('Step 2: Finding recipe to click');
    const clickSuccess = await page.evaluate(() => {
      // Debug info
      window.pageDebug = {
        links: [],
        headings: [],
        clickTarget: null
      };
      
      // Log all links
      document.querySelectorAll('a').forEach(a => {
        window.pageDebug.links.push({
          text: a.textContent,
          href: a.href,
          classes: a.className
        });
      });
      
      // Log all headings
      document.querySelectorAll('h1, h2, h3, h4').forEach(h => {
        window.pageDebug.headings.push({
          type: h.tagName,
          text: h.textContent
        });
      });
      
      // Try to click on first link containing recipe
      const recipeLinks = Array.from(document.querySelectorAll('a')).filter(a => 
        a.textContent.includes('Recipe') || 
        a.textContent.includes('recipe') ||
        a.href.includes('recipe') ||
        a.href.includes('Recipe')
      );
      
      if (recipeLinks.length > 0) {
        window.pageDebug.clickTarget = {
          type: 'recipe-link',
          text: recipeLinks[0].textContent,
          href: recipeLinks[0].href
        };
        recipeLinks[0].click();
        return true;
      }
      
      // Try clicking on a recipe card
      const cards = Array.from(document.querySelectorAll('.card, [class*="card"], article, .border, [class*="border"]'));
      if (cards.length > 0) {
        window.pageDebug.clickTarget = {
          type: 'card',
          element: cards[0].tagName,
          text: cards[0].textContent.substring(0, 30)
        };
        cards[0].click();
        return true;
      }
      
      // Try clicking on recipe heading
      const headings = Array.from(document.querySelectorAll('h2, h3, h4'));
      if (headings.length > 0) {
        window.pageDebug.clickTarget = {
          type: 'heading',
          element: headings[0].tagName,
          text: headings[0].textContent
        };
        headings[0].click();
        return true;
      }
      
      return false;
    });
    
    if (!clickSuccess) {
      console.log('Could not find anything to click');
      // Get debug info
      const pageDebug = await page.evaluate(() => window.pageDebug || {});
      console.log('Page debug info:', JSON.stringify(pageDebug, null, 2));
    } else {
      console.log('Clicked on recipe element');
      
      // Wait for navigation/loading
      await new Promise(r => setTimeout(r, 3000));
      await takeScreenshot(page, '2-after-click');
      
      // Look for recipe versions section
      console.log('Step 3: Looking for Recipe Versions section');
      const versionsInfo = await page.evaluate(() => {
        window.versionsDebug = {
          versionsHeading: null,
          errorMessages: [],
          componentFound: false,
          componentError: null
        };
        
        // Look for versions heading
        const versionsHeadings = Array.from(document.querySelectorAll('h3, h4')).filter(h => 
          h.textContent.includes('Recipe Version') || 
          h.textContent.includes('Version')
        );
        
        if (versionsHeadings.length > 0) {
          window.versionsDebug.versionsHeading = {
            element: versionsHeadings[0].tagName,
            text: versionsHeadings[0].textContent
          };
          
          // Try to find the RecipeIterationManager component
          const iterationComponent = document.querySelector('[data-component="RecipeIterationManager"]');
          window.versionsDebug.componentFound = !!iterationComponent;
          
          if (iterationComponent) {
            versionsHeadings[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
        
        // Look for error messages
        const errorElements = document.querySelectorAll('.error, [role="alert"], .text-red-500, .text-alert-red');
        window.versionsDebug.errorMessages = Array.from(errorElements).map(el => el.textContent);
        
        // Look for "something went wrong" text
        const errorText = document.body.innerText;
        if (errorText.includes('something went wrong') || errorText.includes('Something went wrong')) {
          window.versionsDebug.componentError = 'Found "something went wrong" text on page';
        }
        
        return window.versionsDebug;
      });
      
      console.log('Recipe Versions section info:', JSON.stringify(versionsInfo, null, 2));
      await takeScreenshot(page, '3-versions-section');
      
      // If there's an error, try to get more detailed information
      if (versionsInfo.componentError || versionsInfo.errorMessages.length > 0) {
        console.log('Step 4: Getting detailed error information');
        
        // Extract error details from the page if possible
        const errorDetails = await page.evaluate(() => {
          // Look for error stack traces in console logs or in the DOM
          const errorStacks = [];
          
          // Check for internal error boundary content
          const internalErrors = document.querySelectorAll('[data-nextjs-internal-error-boundary-error-info]');
          if (internalErrors.length > 0) {
            for (const err of internalErrors) {
              try {
                const errorInfo = JSON.parse(err.dataset.nextjsInternalErrorBoundaryErrorInfo);
                errorStacks.push({
                  source: 'Next.js error boundary',
                  message: errorInfo.error?.message || 'Unknown error',
                  stack: errorInfo.error?.stack
                });
              } catch (e) {
                errorStacks.push({
                  source: 'Next.js error boundary (parsing failed)',
                  content: err.dataset.nextjsInternalErrorBoundaryErrorInfo
                });
              }
            }
          }
          
          // Get any visible error messages
          const visibleErrors = Array.from(document.querySelectorAll('.error, [role="alert"], p')).filter(el => 
            el.textContent.includes('error') || 
            el.textContent.includes('Error') || 
            el.textContent.includes('went wrong') ||
            el.textContent.includes('failed')
          ).map(el => ({
            type: el.tagName,
            className: el.className,
            text: el.textContent
          }));
          
          return {
            errorStacks,
            visibleErrors,
            url: window.location.href,
            pathname: window.location.pathname
          };
        });
        
        console.log('Error details:', JSON.stringify(errorDetails, null, 2));
        await takeScreenshot(page, '4-error-details');
      }
    }
    
    console.log('Test completed. Check the screenshots for visual verification.');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Keep browser open for manual inspection
    console.log('Browser will remain open for manual inspection. Press Ctrl+C to close.');
  }
}

testUI().catch(console.error);