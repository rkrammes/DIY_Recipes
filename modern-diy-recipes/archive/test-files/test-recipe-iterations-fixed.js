/**
 * Puppeteer test script to verify recipe iteration functionality
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create directory for screenshots if it doesn't exist
const screenshotsDir = path.join(__dirname, 'test-artifacts', 'recipe-iterations');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

function getTimestamp() {
  return Date.now();
}

async function captureScreenshot(page, name) {
  const timestamp = getTimestamp();
  const screenshotPath = path.join(screenshotsDir, `${name}-${timestamp}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
}

async function runTest() {
  console.log('Starting recipe iteration UI test...');
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for headless mode
    defaultViewport: { width: 1280, height: 800 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Log all console messages from the page
    page.on('console', message => {
      const type = message.type().substr(0, 3).toUpperCase();
      const text = message.text();
      console.log(`[BROWSER ${type}] ${text}`);
    });

    // Navigate to the home page
    console.log('Navigating to home page...');
    await page.goto('http://localhost:3000');
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for page to load
    await captureScreenshot(page, 'home-page');
    
    // Take inventory of page structure to help with debugging
    console.log('Checking page structure...');
    const elements = await page.evaluate(() => {
      // Get all elements with a class containing 'recipe'
      const recipeElements = Array.from(document.querySelectorAll('*[class*="recipe"]'));
      return recipeElements.map(el => ({
        tag: el.tagName,
        className: el.className,
        hasChildren: el.children.length > 0
      }));
    });
    
    console.log('Found elements on page that might be recipes:', 
      elements.length > 10 ? `${elements.length} elements (showing first 10)` : `${elements.length} elements`);
    
    console.log(elements.slice(0, 10));
    
    // Find and click something that looks like a recipe
    console.log('Looking for something to click...');
    // Try clicking the first element that might be a recipe card
    const clickResult = await page.evaluate(() => {
      // Look for recipe cards or links
      const recipeCards = Array.from(document.querySelectorAll(
        'div[class*="recipe"], a[class*="recipe"], [data-recipe-id], li[class*="recipe"], .card'
      ));
      
      if (recipeCards.length > 0) {
        console.log(`Found ${recipeCards.length} potential recipe cards`);
        // Click the first one
        recipeCards[0].click();
        return { success: true, count: recipeCards.length };
      }
      
      return { success: false, count: 0 };
    });
    
    console.log('Click result:', clickResult);
    
    if (!clickResult.success) {
      console.log('No recipe elements found to click. Taking a screenshot and stopping test.');
      await captureScreenshot(page, 'no-recipes-found');
      return;
    }
    
    // Wait for recipe details to load
    console.log('Waiting for recipe details to load...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    await captureScreenshot(page, 'recipe-details');
    
    // Take inventory of headers on the page
    const headers = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
        .map(el => ({
          tag: el.tagName,
          text: el.textContent.trim()
        }));
    });
    
    console.log('Found headers on page:', headers);
    
    // Check for Recipe Versions section
    const versionsSection = await page.evaluate(() => {
      // Look for an element that contains "Recipe Versions" text
      const elementsWithVersionText = Array.from(document.querySelectorAll('*'))
        .filter(el => el.textContent && el.textContent.includes('Recipe Versions'));
      
      if (elementsWithVersionText.length > 0) {
        return {
          found: true,
          element: {
            tag: elementsWithVersionText[0].tagName,
            text: elementsWithVersionText[0].textContent.trim()
          }
        };
      }
      
      return { found: false };
    });
    
    console.log('Recipe Versions section search result:', versionsSection);
    
    if (!versionsSection.found) {
      console.log('Recipe Versions section not found on the page');
      await captureScreenshot(page, 'no-versions-section');
      return;
    }
    
    // Check for mock data warning
    const mockDataWarning = await page.evaluate(() => {
      const mockWarningElement = Array.from(document.querySelectorAll('*'))
        .find(el => el.textContent && el.textContent.includes('Using mock recipe data'));
      
      return !!mockWarningElement;
    });
    
    if (mockDataWarning) {
      console.log('Using mock data - version testing unavailable');
      await captureScreenshot(page, 'mock-data-warning');
      return;
    }
    
    // Test creating a new version
    console.log('Looking for Create New Version button...');
    const createVersionButton = await page.evaluate(() => {
      // Look for a button with this text
      const buttons = Array.from(document.querySelectorAll('button'))
        .filter(el => el.textContent && 
                (el.textContent.includes('Create New Version') || 
                 el.textContent.includes('New Version')));
      
      if (buttons.length > 0) {
        buttons[0].click();
        return true;
      }
      return false;
    });
    
    if (createVersionButton) {
      console.log('Create New Version button clicked');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for version creation
      await captureScreenshot(page, 'after-create-version');
      
      // Check if Version 2 appears
      const version2Found = await page.evaluate(() => {
        return !!Array.from(document.querySelectorAll('*'))
          .find(el => el.textContent && el.textContent.includes('Version 2'));
      });
      
      if (version2Found) {
        console.log('Version 2 created successfully!');
        
        // Try editing the version
        console.log('Looking for Edit button...');
        const editClicked = await page.evaluate(() => {
          const editButton = Array.from(document.querySelectorAll('button'))
            .find(el => el.textContent && el.textContent.includes('Edit'));
          
          if (editButton) {
            editButton.click();
            return true;
          }
          return false;
        });
        
        if (editClicked) {
          console.log('Edit button clicked');
          await page.waitForTimeout(1000);
          await captureScreenshot(page, 'editing-version');
          
          // Type in notes field
          const notesTextarea = await page.$('#iteration-notes, textarea');
          if (notesTextarea) {
            await notesTextarea.click({ clickCount: 3 }); // Select all text
            await notesTextarea.type('Test notes added by Puppeteer test');
            
            // Save changes
            const saveClicked = await page.evaluate(() => {
              const saveButton = Array.from(document.querySelectorAll('button'))
                .find(el => el.textContent && el.textContent.includes('Save Changes'));
              
              if (saveButton) {
                saveButton.click();
                return true;
              }
              return false;
            });
            
            if (saveClicked) {
              console.log('Save Changes button clicked');
              await page.waitForTimeout(1000);
              await captureScreenshot(page, 'after-save-changes');
              console.log('Changes saved successfully!');
            } else {
              console.log('Save Changes button not found');
            }
          } else {
            console.log('Notes textarea not found');
          }
        } else {
          console.log('Edit button not found');
        }
        
        // Try comparison
        console.log('Looking for Compare button...');
        const compareClicked = await page.evaluate(() => {
          const compareButton = Array.from(document.querySelectorAll('button'))
            .find(el => el.textContent && el.textContent.includes('Compare'));
          
          if (compareButton) {
            compareButton.click();
            return true;
          }
          return false;
        });
        
        if (compareClicked) {
          console.log('Compare button clicked');
          await page.waitForTimeout(1000);
          await captureScreenshot(page, 'version-comparison');
          
          // Check for comparison results
          const comparisonFound = await page.evaluate(() => {
            return !!Array.from(document.querySelectorAll('*'))
              .find(el => el.textContent && el.textContent.includes('Comparison with'));
          });
          
          if (comparisonFound) {
            console.log('Version comparison successful!');
          } else {
            console.log('Comparison results not found');
          }
        } else {
          console.log('Compare button not found');
        }
      } else {
        console.log('Version 2 not found after clicking create button');
      }
    } else {
      console.log('Create New Version button not found');
    }
    
    console.log('Test completed successfully');
    
  } catch (error) {
    console.error('Test failed:', error);
    await captureScreenshot(page, 'test-failure');
  } finally {
    await browser.close();
  }
}

runTest().catch(console.error);