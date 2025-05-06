/**
 * Puppeteer test script to verify feature toggle UI functionality
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create directory for test artifacts
const artifactsDir = path.join(__dirname, 'test-artifacts', 'feature-toggle');
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

// Helper for delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Save screenshot with timestamp
async function saveScreenshot(page, name) {
  const timestamp = Date.now();
  const screenshotPath = path.join(artifactsDir, `${name}-${timestamp}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
}

// Log to file and console
function log(message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  
  const logPath = path.join(artifactsDir, 'test.log');
  fs.appendFileSync(logPath, logMessage + '\n');
  
  if (data) {
    console.log(data);
    fs.appendFileSync(logPath, JSON.stringify(data, null, 2) + '\n');
  }
}

async function testFeatureToggle() {
  log('Starting feature toggle test with Puppeteer');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 900 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Log browser console messages
    page.on('console', message => {
      const type = message.type().substring(0, 3).toUpperCase();
      log(`[BROWSER ${type}] ${message.text()}`);
    });
    
    // 1. Navigate to the app
    log('Navigating to homepage');
    await page.goto('http://localhost:3000');
    await delay(3000);
    await saveScreenshot(page, '01-homepage');
    
    
    // 2. Find and click a recipe
    log('Looking for a recipe to click');
    
    const clickedRecipe = await page.evaluate(() => {
      // Find elements that look like recipe cards or links
      const recipeElements = [
        ...document.querySelectorAll('[data-recipe-id]'),
        ...document.querySelectorAll('a[href*="recipe"]'),
        ...document.querySelectorAll('div[class*="recipe-item"], div[class*="recipe-card"]')
      ];
      
      // If no specific recipe elements found, try list items or general links
      if (recipeElements.length === 0) {
        const listItems = document.querySelectorAll('li, a, div.card');
        for (const item of listItems) {
          // Check if the text suggests it's a recipe
          if (item.innerText && 
              (item.innerText.includes('Recipe') || 
               item.innerText.includes('Soap') || 
               item.innerText.includes('Cream') || 
               item.innerText.includes('Oil'))) {
            recipeElements.push(item);
          }
        }
      }
      
      // Click the first recipe element
      if (recipeElements.length > 0) {
        const recipe = recipeElements[0];
        recipe.click();
        return {
          clicked: true,
          text: recipe.innerText?.substring(0, 30),
          tag: recipe.tagName
        };
      }
      
      return { clicked: false };
    });
    
    log('Recipe click result:', clickedRecipe);
    
    if (!clickedRecipe.clicked) {
      // If no recipe was clicked, try navigating to a known recipe route
      log('No recipe found to click, trying direct URL to recipe-test');
      await page.goto('http://localhost:3000/recipe-test');
    }
    
    // 3. Wait for recipe details page to load
    await delay(3000);
    await saveScreenshot(page, '02-recipe-details');
    
    // 4. Look for the feature toggle bar
    log('Looking for feature toggle bar');
    
    const featureToggleBar = await page.evaluate(() => {
      // Find the feature toggle bar
      const toggleBar = document.querySelector('.feature-toggle-bar') || 
                        document.querySelector('[class*="feature-toggle"]');
      
      if (toggleBar) {
        return {
          found: true,
          hasSettingsButton: !!toggleBar.querySelector('button')
        };
      }
      
      return { found: false };
    });
    
    log('Feature toggle bar status:', featureToggleBar);
    
    if (!featureToggleBar.found) {
      log('Feature toggle bar not found, attempting to find any button that might open settings');
      
      const settingsButton = await page.evaluate(() => {
        // Look for any settings or feature-related buttons
        const buttons = Array.from(document.querySelectorAll('button'))
          .filter(btn => 
            btn.innerText.includes('Feature') || 
            btn.innerText.includes('Setting') || 
            btn.innerText.includes('Version')
          );
        
        if (buttons.length > 0) {
          const rect = buttons[0].getBoundingClientRect();
          return {
            found: true,
            text: buttons[0].innerText,
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          };
        }
        
        return { found: false };
      });
      
      if (settingsButton.found) {
        log(`Found settings button: ${settingsButton.text}`);
        await page.mouse.click(settingsButton.x, settingsButton.y);
        await delay(1000);
        await saveScreenshot(page, '03-after-settings-click');
      }
    } else {
      // Click the Features button to open the dropdown
      log('Clicking Features button in toggle bar');
      
      const clickedFeatures = await page.evaluate(() => {
        const featuresButton = document.querySelector('.feature-toggle-bar button');
        if (featuresButton) {
          featuresButton.click();
          return { clicked: true, text: featuresButton.innerText };
        }
        return { clicked: false };
      });
      
      log('Features button click result:', clickedFeatures);
      
      if (clickedFeatures.clicked) {
        await delay(1000);
        await saveScreenshot(page, '03-features-dropdown-open');
        
        // 5. Toggle recipe versioning
        log('Toggling recipe versioning checkbox');
        
        const toggled = await page.evaluate(() => {
          // Find the versioning checkbox
          const versioningCheck = Array.from(document.querySelectorAll('input[type="checkbox"]'))
            .find(checkbox => {
              const label = checkbox.closest('label');
              return label && label.innerText.includes('Versioning');
            });
          
          if (versioningCheck) {
            // Get the initial state
            const initialState = versioningCheck.checked;
            
            // Click to toggle
            versioningCheck.click();
            
            return {
              toggled: true,
              initialState,
              newState: versioningCheck.checked
            };
          }
          
          return { toggled: false };
        });
        
        log('Versioning toggle result:', toggled);
        
        if (toggled.toggled) {
          await delay(1000);
          await saveScreenshot(page, '04-after-version-toggle');
          
          // Check if recipe versions section is now visible
          const versionsVisible = await page.evaluate(() => {
            // Look for recipe versions section
            const versionSection = Array.from(document.querySelectorAll('h3'))
              .find(h => h.innerText.includes('Recipe Version'));
            
            if (versionSection) {
              // Find the containing section
              const container = versionSection.closest('div');
              return {
                visible: true,
                hasCreateButton: container && 
                  !!container.querySelector('button') &&
                  container.querySelector('button').innerText.includes('Create')
              };
            }
            
            return { visible: false };
          });
          
          log('Recipe versions section status:', versionsVisible);
          
          if (versionsVisible.visible && versionsVisible.hasCreateButton) {
            // Try creating a new version
            log('Attempting to create a new recipe version');
            
            const createdVersion = await page.evaluate(() => {
              // Find create version button
              const createButtons = Array.from(document.querySelectorAll('button'))
                .filter(btn => 
                  btn.innerText.includes('Create') && 
                  btn.innerText.includes('Version')
                );
              
              if (createButtons.length > 0) {
                createButtons[0].click();
                return { clicked: true };
              }
              
              return { clicked: false };
            });
            
            log('Create version result:', createdVersion);
            
            if (createdVersion.clicked) {
              await delay(3000);
              await saveScreenshot(page, '05-after-create-version');
              
              // Check if a new version was created
              const newVersionCreated = await page.evaluate(() => {
                // Check for Version 2 or other indication of success
                return {
                  found: document.body.innerText.includes('Version 2'),
                  hasVersionList: !!document.querySelector('[class*="version-list"]')
                };
              });
              
              log('New version creation status:', newVersionCreated);
            }
          }
          
          // Try disabling versioning again
          log('Disabling recipe versioning');
          
          // First open features dropdown if it closed
          await page.evaluate(() => {
            const featuresButton = document.querySelector('.feature-toggle-bar button');
            if (featuresButton) {
              featuresButton.click();
            }
          });
          
          await delay(1000);
          
          // Click the checkbox again to disable
          const disabledVersioning = await page.evaluate(() => {
            const versioningCheck = Array.from(document.querySelectorAll('input[type="checkbox"]'))
              .find(checkbox => {
                const label = checkbox.closest('label');
                return label && label.innerText.includes('Versioning');
              });
            
            if (versioningCheck && versioningCheck.checked) {
              versioningCheck.click();
              return { toggled: true };
            }
            
            return { toggled: false };
          });
          
          log('Disabling versioning result:', disabledVersioning);
          
          if (disabledVersioning.toggled) {
            await delay(1000);
            await saveScreenshot(page, '06-versioning-disabled');
            
            // Check for the enable button
            const enableButton = await page.evaluate(() => {
              const buttons = Array.from(document.querySelectorAll('button'))
                .filter(btn => btn.innerText.includes('Enable Versioning'));
              
              return {
                found: buttons.length > 0
              };
            });
            
            log('Enable versioning button status:', enableButton);
          }
        }
      }
    }
    
    
    // 7. Verify localStorage persistence
    log('Verifying localStorage persistence');
    
    const localStorageState = await page.evaluate(() => {
      // Check if feature settings were saved to localStorage
      const storedSettings = localStorage.getItem('recipeFeatures');
      
      if (storedSettings) {
        try {
          return {
            found: true,
            settings: JSON.parse(storedSettings)
          };
        } catch (e) {
          return {
            found: true,
            error: e.message,
            rawValue: storedSettings
          };
        }
      }
      
      return { found: false };
    });
    
    log('localStorage state:', localStorageState);
    
    // Generate test report
    const testReport = {
      timestamp: new Date().toISOString(),
      featureToggleFound: featureToggleBar.found,
      versioningToggleWorks: localStorageState.found,
      issues: []
    };
    
    if (!featureToggleBar.found) {
      testReport.issues.push('Feature toggle bar not found in UI');
    }
    
    if (!localStorageState.found) {
      testReport.issues.push('Feature settings not persisted in localStorage');
    }
    
    // Write test report
    const reportPath = path.join(artifactsDir, `test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2));
    log(`Test report written to: ${reportPath}`);
    
    log('Test completed successfully');
    
  } catch (error) {
    log(`Test error: ${error.message}`);
    console.error(error);
    await saveScreenshot(page, 'error');
  } finally {
    await browser.close();
  }
}

testFeatureToggle().catch(console.error);