const puppeteer = require('puppeteer');
const path = require('path');

async function captureCurrentState() {
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  
  // Capture console messages
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });
  
  // Capture errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.toString());
  });
  
  try {
    console.log('1. Capturing main page...');
    await page.goto('http://localhost:3000/', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    await page.waitForTimeout(2000);
    
    // Get current theme
    const theme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme') || 
             localStorage.getItem('kraft-terminal-theme') || 
             'unknown';
    });
    console.log(`Current theme: ${theme}`);
    
    await page.screenshot({ 
      path: path.join(__dirname, 'current-state-backup', '01-main-page.png'),
      fullPage: true 
    });
    
    // Check if we're on terminal interface or document interface
    const isTerminal = await page.evaluate(() => {
      return window.location.pathname.includes('terminal') || 
             document.querySelector('.terminal-container') !== null;
    });
    
    console.log(`Interface type: ${isTerminal ? 'Terminal' : 'Document'}`);
    
    // Try to navigate to recipes
    console.log('2. Looking for recipe navigation...');
    
    if (isTerminal) {
      // Terminal interface - look for category buttons
      const categoryButton = await page.$('.terminal-btn:not([disabled])');
      if (categoryButton) {
        await categoryButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ 
          path: path.join(__dirname, 'current-state-backup', '02-category-view.png'),
          fullPage: true 
        });
        
        // Try to click on a recipe
        const recipeItem = await page.$('.terminal-list-item');
        if (recipeItem) {
          await recipeItem.click();
          await page.waitForTimeout(1000);
          await page.screenshot({ 
            path: path.join(__dirname, 'current-state-backup', '03-recipe-detail.png'),
            fullPage: true 
          });
        }
      }
    } else {
      // Document interface - look for recipe links
      const recipeLink = await page.$('a[href*="/recipes"]');
      if (recipeLink) {
        await recipeLink.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ 
          path: path.join(__dirname, 'current-state-backup', '02-recipes-list.png'),
          fullPage: true 
        });
        
        // Click on first recipe
        const firstRecipe = await page.$('a[href*="/recipes/"][href*="-"]');
        if (firstRecipe) {
          await firstRecipe.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ 
            path: path.join(__dirname, 'current-state-backup', '03-recipe-detail.png'),
            fullPage: true 
          });
        }
      }
    }
    
    // Check for settings
    console.log('3. Checking for settings...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    
    const settingsButton = await page.$('[aria-label*="Settings"], button:has-text("Settings"), .settings-btn');
    if (settingsButton) {
      await settingsButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ 
        path: path.join(__dirname, 'current-state-backup', '04-settings.png'),
        fullPage: true 
      });
    }
    
    // Document the state
    const stateInfo = {
      capturedAt: new Date().toISOString(),
      theme: theme,
      interfaceType: isTerminal ? 'terminal' : 'document',
      url: page.url(),
      viewport: await page.viewport(),
      consoleLogs: consoleLogs,
      errors: pageErrors,
      features: {
        hasRecipes: await page.evaluate(() => !!document.querySelector('[href*="recipes"]')),
        hasSettings: await page.evaluate(() => !!document.querySelector('[aria-label*="Settings"]')),
        hasThemeToggle: await page.evaluate(() => !!document.querySelector('[data-theme]')),
        hasNavigation: await page.evaluate(() => !!document.querySelector('nav'))
      }
    };
    
    require('fs').writeFileSync(
      path.join(__dirname, 'current-state-backup', 'state-info.json'),
      JSON.stringify(stateInfo, null, 2)
    );
    
    console.log('State captured successfully!');
    console.log('Console errors:', pageErrors.length);
    console.log('Features detected:', stateInfo.features);
    
  } catch (error) {
    console.error('Error capturing state:', error);
  } finally {
    await browser.close();
  }
}

captureCurrentState();