/**
 * Script to directly test recipe details with standard UI
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create directory for screenshots
const screenshotsDir = path.join(__dirname, 'test-artifacts', 'recipe-details');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Helper for delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Save screenshot with timestamp
async function saveScreenshot(page, name) {
  const timestamp = Date.now();
  const screenshotPath = path.join(screenshotsDir, `${name}-${timestamp}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
}

async function testRecipeDetails() {
  console.log('Starting direct recipe details test');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 900 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Force standard UI and enable recipe versioning
    console.log('Navigating to recipe test page with forced standard UI...');
    await page.goto('http://localhost:3001/recipe-test?terminal_ui=false&recipe_versioning=true');
    await delay(3000);
    await saveScreenshot(page, '01-recipe-test-page');
    
    // Check for recipe list and elements
    const recipeElements = await page.evaluate(() => {
      // Get all elements on the page that might contain recipes
      const elements = Array.from(document.querySelectorAll('*'))
        .filter(el => {
          const text = el.innerText || '';
          return text.includes('Recipe') || 
                 text.includes('Mustache') || 
                 text.includes('Beard') || 
                 text.includes('Hand Soap') || 
                 text.includes('Hair Rinse');
        })
        .map(el => ({
          text: (el.innerText || '').substring(0, 50).trim(),
          tag: el.tagName,
          className: el.className,
          id: el.id,
          clickable: el.tagName === 'A' || el.tagName === 'BUTTON' || 
                    el.onclick !== null || 
                    window.getComputedStyle(el).cursor === 'pointer',
          rect: {
            x: el.getBoundingClientRect().left,
            y: el.getBoundingClientRect().top,
            width: el.getBoundingClientRect().width,
            height: el.getBoundingClientRect().height
          }
        }))
        .filter(el => el.text && el.rect.width > 0 && el.rect.height > 0);
      
      return {
        elements,
        pageTitle: document.title,
        bodyText: document.body.innerText.substring(0, 200)
      };
    });
    
    console.log('Recipe elements:', recipeElements);
    
    // If we found clickable recipe elements, click one
    const clickableRecipes = recipeElements.elements?.filter(el => el.clickable) || [];
    
    if (clickableRecipes.length > 0) {
      console.log(`Clicking recipe: ${clickableRecipes[0].text}`);
      await page.mouse.click(
        clickableRecipes[0].rect.x + clickableRecipes[0].rect.width / 2,
        clickableRecipes[0].rect.y + clickableRecipes[0].rect.height / 2
      );
      await delay(3000);
      await saveScreenshot(page, '02-recipe-details');
      
      // Check for the Recipe Versions section
      const versionSection = await page.evaluate(() => {
        // Look for Recipe Versions header
        const headers = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
          .filter(h => h.innerText.includes('Recipe Versions') || h.innerText.includes('Versions'));
        
        if (headers.length > 0) {
          // Get the section content
          const header = headers[0];
          const section = header.closest('section') || header.parentElement;
          
          return {
            found: true,
            headerText: header.innerText,
            sectionText: section ? section.innerText.substring(0, 200) : 'No section content',
            // Check for error message
            hasError: section ? section.innerText.includes('encountered an issue') : false
          };
        }
        
        return { found: false };
      });
      
      console.log('Version section:', versionSection);
      
      // If we found an error, try to click the refresh button
      if (versionSection.hasError) {
        console.log('Found error in version section, looking for refresh button...');
        const refreshButton = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'))
            .filter(b => b.innerText.includes('Refresh'));
          
          if (buttons.length > 0) {
            const rect = buttons[0].getBoundingClientRect();
            return {
              found: true,
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
              text: buttons[0].innerText
            };
          }
          
          return { found: false };
        });
        
        if (refreshButton.found) {
          console.log(`Clicking refresh button: ${refreshButton.text}`);
          await page.mouse.click(refreshButton.x, refreshButton.y);
          await delay(3000);
          await saveScreenshot(page, '03-after-refresh');
        }
      }
    }
    
    // Try direct URL with recipe ID
    console.log('Trying direct URL with recipe ID...');
    await page.goto('http://localhost:3001/recipe-test?id=971e9734-d147-4066-9b55-b80a080de24f&terminal_ui=false&recipe_versioning=true');
    await delay(3000);
    await saveScreenshot(page, '04-direct-recipe-id');
    
    // Log the UI state and any errors
    const pageState = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        h1: Array.from(document.querySelectorAll('h1')).map(h => h.innerText),
        errors: Array.from(document.querySelectorAll('.error, [class*="error"], [class*="alert"]'))
          .map(el => el.innerText),
        // Check for any console errors that might be stored
        storedErrors: window.__consoleErrors || []
      };
    });
    
    console.log('Page state:', pageState);
    
    console.log('Test completed');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testRecipeDetails().catch(console.error);