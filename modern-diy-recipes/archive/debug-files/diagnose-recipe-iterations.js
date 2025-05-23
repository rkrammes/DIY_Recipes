/**
 * Diagnostic script to troubleshoot recipe iteration issues
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Helper for delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Create directory for screenshots
const outputDir = path.join(__dirname, 'test-artifacts', 'diagnostics');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Save screenshot with timestamp
async function saveScreenshot(page, name) {
  const timestamp = Date.now();
  const path = `${outputDir}/${name}-${timestamp}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`Screenshot saved: ${path}`);
  return path;
}

// Log to file and console
function log(message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  
  if (data) {
    console.log(data);
  }
  
  fs.appendFileSync(`${outputDir}/diagnosis.log`, logMessage + "\n");
  if (data) {
    fs.appendFileSync(`${outputDir}/diagnosis.log`, JSON.stringify(data, null, 2) + "\n");
  }
}

async function diagnoseRecipeIterations() {
  log('Starting recipe iterations diagnosis');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 900 },
    args: ['--window-size=1280,900']
  });
  
  const page = await browser.newPage();
  
  // Enable console logging from the page
  page.on('console', message => {
    const type = message.type().substring(0, 3).toUpperCase();
    log(`[BROWSER ${type}] ${message.text()}`);
  });
  
  try {
    // 1. Navigate to the app
    log('Navigating to home page');
    await page.goto('http://localhost:3000');
    await delay(3000);
    await saveScreenshot(page, '01-homepage');
    
    // 2. Check browser console for errors
    log('Checking for console errors');
    const consoleErrors = await page.evaluate(() => {
      // This runs in the browser context
      const errors = [];
      const originalConsoleError = console.error;
      
      // Override console.error to capture errors
      console.error = (...args) => {
        errors.push(args.join(' '));
        originalConsoleError.apply(console, args);
      };
      
      // Trigger any errors that might be in the console
      return errors;
    });
    
    if (consoleErrors.length > 0) {
      log('Console errors detected:', consoleErrors);
    } else {
      log('No console errors detected');
    }
    
    // 3. Check if Supabase is initialized
    log('Checking Supabase initialization');
    const supabaseStatus = await page.evaluate(() => {
      // Look for Supabase-related variables in window or localStorage
      const supabaseUrl = localStorage.getItem('supabase.url') || 
                         window.SUPABASE_URL || 
                         window.supabaseUrl;
      
      const supabaseKey = localStorage.getItem('supabase.key') || 
                         window.SUPABASE_ANON_KEY || 
                         window.supabaseKey;
      
      return {
        urlFound: !!supabaseUrl,
        keyFound: !!supabaseKey,
        url: supabaseUrl ? 'Found (masked)' : null,
        localStorageItems: Object.keys(localStorage)
      };
    });
    
    log('Supabase status:', supabaseStatus);
    
    // 4. Try to click on a recipe
    log('Looking for a recipe to click');
    await page.evaluate(() => {
      // Scroll down to make sure we see all content
      window.scrollTo(0, 500);
    });
    await delay(1000);
    await saveScreenshot(page, '02-scrolled');
    
    // Check for links that might be recipes
    const links = await page.$$eval('a', links => 
      links.map(a => ({
        href: a.href,
        text: a.innerText.trim().substring(0, 50),
        visible: a.offsetParent !== null
      }))
      .filter(a => a.visible && a.text.length > 0)
    );
    
    log(`Found ${links.length} visible links on page:`, links.slice(0, 10));
    
    // Try to click on something that looks like a recipe
    let recipeClicked = false;
    
    for (const link of links) {
      if (link.text.toLowerCase().includes('recipe') || 
          link.href.includes('recipe') ||
          link.href.includes('detail')) {
        log(`Attempting to click recipe link: ${link.text}`);
        
        await page.evaluate(linkText => {
          const links = Array.from(document.querySelectorAll('a'))
            .filter(a => a.innerText.trim().includes(linkText));
          if (links.length > 0) links[0].click();
        }, link.text.substring(0, 15));
        
        recipeClicked = true;
        break;
      }
    }
    
    if (!recipeClicked) {
      // Try clicking any visible link that might be a recipe
      log('No obvious recipe links found, trying to click first visible link');
      await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'))
          .filter(a => a.offsetParent !== null && a.innerText.trim().length > 0);
        if (links.length > 0) links[0].click();
      });
    }
    
    // 5. Wait for recipe details to load
    log('Waiting for recipe details to load');
    await delay(3000);
    await saveScreenshot(page, '03-recipe-details');
    
    // 6. Check for the versions section error
    log('Checking for versions section error');
    const versionSectionStatus = await page.evaluate(() => {
      // Look for error message
      const errorElements = Array.from(document.querySelectorAll('*'))
        .filter(el => 
          el.innerText && 
          el.innerText.includes('Recipe versioning encountered an issue')
        );
      
      if (errorElements.length > 0) {
        // Found error message
        return {
          error: true,
          message: errorElements[0].innerText.trim(),
          // Try to find the parent component
          parent: errorElements[0].closest('[data-component]')?.getAttribute('data-component') || 'unknown'
        };
      }
      
      // Look for versions section
      const versionElements = Array.from(document.querySelectorAll('*'))
        .filter(el => 
          el.innerText && 
          (el.innerText.includes('Recipe Versions') || 
           el.innerText.includes('Version History'))
        );
      
      if (versionElements.length > 0) {
        return {
          error: false,
          found: true,
          text: versionElements[0].innerText.trim().substring(0, 100)
        };
      }
      
      return {
        error: false,
        found: false
      };
    });
    
    log('Version section status:', versionSectionStatus);
    
    // 7. Click the refresh button if error is found
    if (versionSectionStatus.error) {
      log('Error found, trying to click refresh button');
      const refreshClicked = await page.evaluate(() => {
        const refreshButtons = Array.from(document.querySelectorAll('button'))
          .filter(btn => 
            btn.innerText && 
            btn.innerText.toLowerCase().includes('refresh')
          );
        
        if (refreshButtons.length > 0) {
          refreshButtons[0].click();
          return true;
        }
        return false;
      });
      
      log(`Refresh button ${refreshClicked ? 'clicked' : 'not found'}`);
      await delay(3000);
      await saveScreenshot(page, '04-after-refresh');
    }
    
    // 8. Check console logs for database connection issues
    log('Checking console logs for database connection issues');
    const dbErrors = await page.evaluate(() => {
      return {
        supabaseErrors: window.__supabase_errors || [],
        connectionErrors: Array.from(document.querySelectorAll('*'))
          .filter(el => 
            el.innerText && 
            (el.innerText.includes('database') || 
             el.innerText.includes('connection'))
          )
          .map(el => el.innerText.trim())
      };
    });
    
    log('Database connection issues:', dbErrors);
    
    // 9. Check network requests
    log('Checking network requests to Supabase');
    const networkRequests = await page.evaluate(() => {
      if (!window.performance || !window.performance.getEntries) {
        return { error: 'Performance API not available' };
      }
      
      const resources = window.performance.getEntries()
        .filter(entry => 
          entry.name && 
          (entry.name.includes('supabase') || 
           entry.name.includes('api'))
        )
        .map(entry => ({
          url: entry.name,
          duration: Math.round(entry.duration),
          type: entry.initiatorType,
          status: entry.responseStatus
        }));
      
      return { resources };
    });
    
    log('Network requests:', networkRequests);
    
    // 10. Try to find and test any recipe-related APIs
    log('Testing direct API access');
    const apiTest = await page.evaluate(async () => {
      try {
        // Try to detect Supabase URL from the page
        const supabaseUrl = 
          window.supabaseUrl || 
          localStorage.getItem('supabase.url') || 
          document.querySelector('meta[name="supabase-url"]')?.getAttribute('content');
        
        const supabaseKey = 
          window.supabaseKey || 
          localStorage.getItem('supabase.key') || 
          document.querySelector('meta[name="supabase-anon-key"]')?.getAttribute('content');
        
        if (!supabaseUrl || !supabaseKey) {
          return { error: 'Could not find Supabase URL or key' };
        }
        
        // Try direct fetch to Supabase
        const response = await fetch(`${supabaseUrl}/rest/v1/recipes?select=id,title&limit=1`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        
        if (!response.ok) {
          return { 
            error: 'API request failed', 
            status: response.status,
            statusText: response.statusText
          };
        }
        
        const data = await response.json();
        return { 
          success: true, 
          data,
          url: `${supabaseUrl} (masked key)`
        };
      } catch (err) {
        return { error: err.message };
      }
    });
    
    log('API test results:', apiTest);
    
    // 11. Take a final screenshot
    await saveScreenshot(page, '05-final');
    
    // 12. Generate diagnosis report
    const diagnosis = {
      timestamp: new Date().toISOString(),
      supabaseStatus: supabaseStatus,
      versionSectionStatus: versionSectionStatus,
      apiTest: apiTest,
      possibleIssues: []
    };
    
    // Analyze issues
    if (versionSectionStatus.error) {
      diagnosis.possibleIssues.push('Recipe versioning error detected in UI');
    }
    
    if (!supabaseStatus.urlFound || !supabaseStatus.keyFound) {
      diagnosis.possibleIssues.push('Supabase configuration may be missing');
    }
    
    if (apiTest.error) {
      diagnosis.possibleIssues.push(`API test failed: ${apiTest.error}`);
    }
    
    // Check for database connection issues in console logs
    const connectionIssues = consoleErrors.filter(err => 
      err.toLowerCase().includes('database') || 
      err.toLowerCase().includes('supabase') ||
      err.toLowerCase().includes('connection')
    );
    
    if (connectionIssues.length > 0) {
      diagnosis.possibleIssues.push('Database connection errors in console');
      diagnosis.connectionIssues = connectionIssues;
    }
    
    // Write diagnosis report
    const reportPath = `${outputDir}/diagnosis-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(diagnosis, null, 2));
    log(`Diagnosis report saved to: ${reportPath}`);
    
    // Generate recommendations
    let recommendations = '# Recipe Versioning Diagnosis\n\n';
    recommendations += `**Test Date:** ${new Date().toLocaleString()}\n\n`;
    recommendations += '## Issues Detected\n\n';
    
    if (diagnosis.possibleIssues.length === 0) {
      recommendations += '✅ No obvious issues detected. The problem may be intermittent or related to specific recipes.\n\n';
    } else {
      diagnosis.possibleIssues.forEach(issue => {
        recommendations += `- ❌ ${issue}\n`;
      });
      recommendations += '\n';
    }
    
    recommendations += '## Recommendations\n\n';
    
    if (!supabaseStatus.urlFound || !supabaseStatus.keyFound) {
      recommendations += '1. **Check Supabase Configuration**\n';
      recommendations += '   - Verify the `.env` file contains NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY\n';
      recommendations += '   - Make sure the environment variables are loaded correctly\n\n';
    }
    
    if (apiTest.error) {
      recommendations += '2. **Verify Supabase Connection**\n';
      recommendations += '   - Run the test-supabase-simple.js script to check connectivity\n';
      recommendations += '   - Ensure your Supabase project is running and accessible\n\n';
    }
    
    recommendations += '3. **Verify SQL Setup**\n';
    recommendations += '   - Run the create_recipe_iterations_table.sql script\n';
    recommendations += '   - Check if the tables exist and have proper relationships\n\n';
    
    recommendations += '4. **Check Recipe Data**\n';
    recommendations += '   - Verify that recipes have valid IDs\n';
    recommendations += '   - Ensure you\'re viewing database-stored recipes, not mock data\n\n';
    
    recommendations += '5. **Browser Issues**\n';
    recommendations += '   - Clear browser cache and try again\n';
    recommendations += '   - Check browser console for JavaScript errors\n\n';
    
    recommendations += '## Next Steps\n\n';
    recommendations += '1. Run the debug-hook-interface.js script to test database access\n';
    recommendations += '2. Verify the SQL tables exist with `\\dt` in the Supabase SQL editor\n';
    recommendations += '3. Check for any error handling issues in the useRecipeIteration.ts hook\n';
    
    // Write recommendations
    const recommendationsPath = `${outputDir}/recommendations-${Date.now()}.md`;
    fs.writeFileSync(recommendationsPath, recommendations);
    log(`Recommendations saved to: ${recommendationsPath}`);
    
    log('Diagnosis completed');
    
  } catch (error) {
    log(`Diagnosis error: ${error.message}`);
    console.error(error);
  } finally {
    await browser.close();
  }
}

// Run the diagnosis
diagnoseRecipeIterations().catch(console.error);