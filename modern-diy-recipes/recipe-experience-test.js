// Test script to analyze the recipe document experience
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const APP_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, 'test-artifacts', 'recipe-experience');

// Test plan:
// 1. Navigate to recipes page
// 2. Open a recipe and capture the viewing experience
// 3. Test edit functionality
// 4. Test version tracking functionality
// 5. Look for AI suggestion features
// 6. Document the user flow with observations

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`Directory created: ${dirPath}`);
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
  }
}

async function captureScreenshot(page, name) {
  const fileName = `${name}.png`;
  const filePath = path.join(SCREENSHOTS_DIR, fileName);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`Screenshot saved: ${filePath}`);
  return filePath;
}

async function writeObservation(observation) {
  const filePath = path.join(SCREENSHOTS_DIR, 'observations.md');
  
  try {
    let existingContent = '';
    try {
      existingContent = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      // File doesn't exist yet, that's fine
    }
    
    const timestamp = new Date().toISOString();
    const newContent = `${existingContent}\n\n## ${timestamp}\n${observation}`;
    
    await fs.writeFile(filePath, newContent, 'utf8');
    console.log(`Observation saved to ${filePath}`);
  } catch (error) {
    console.error('Error writing observation:', error);
  }
}

async function testRecipeDocumentExperience() {
  console.log('🔍 Analyzing recipe document experience with Puppeteer...');
  
  await ensureDirectoryExists(SCREENSHOTS_DIR);
  await writeObservation('# Recipe Document Experience Analysis\n\nThis document contains observations from testing the recipe document experience.');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--window-size=1280,800']
  });
  
  try {
    // Create a page and setup console log capturing
    const page = await browser.newPage();
    
    page.on('console', message => {
      const type = message.type();
      console.log(`[Browser Console] [${type}] ${message.text()}`);
    });
    
    // 1. Navigate to the app
    console.log('Navigating to the app...');
    await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await captureScreenshot(page, '01-home-page');
    await writeObservation('### Initial Navigation\n- Successfully loaded the home page');
    
    // Check if any recipe cards are displayed
    const recipeCards = await page.$$('[data-testid="recipe-card"]');
    
    if (recipeCards.length === 0) {
      console.log('❌ No recipe cards found on the page');
      await captureScreenshot(page, 'no-recipes-found');
      await writeObservation('- ❌ No recipe cards found on the homepage');
      
      // Try to create a recipe if available
      const createButton = await page.$('[data-testid="create-recipe-button"]') || 
                         await page.$('button:has-text("Create Recipe")') ||
                         await page.$('button:has-text("New Recipe")');
      
      if (createButton) {
        console.log('Creating a new recipe...');
        await createButton.click();
        await wait(2000);
        await captureScreenshot(page, '02-create-recipe-form');
        await writeObservation('### Recipe Creation\n- Clicked on create recipe button\n- Captured the creation form');
        
        // Fill out the recipe form
        await page.type('[data-testid="recipe-title-input"]', 'Test Recipe');
        await page.type('[data-testid="recipe-description-input"]', 'This is a test recipe created by Puppeteer');
        
        // Look for a save or submit button
        const saveButton = await page.$('[data-testid="save-recipe-button"]') ||
                        await page.$('button:has-text("Save")') ||
                        await page.$('button:has-text("Create")') ||
                        await page.$('button:has-text("Submit")');
        
        if (saveButton) {
          await saveButton.click();
          await wait(2000);
          await captureScreenshot(page, '03-created-recipe');
          await writeObservation('- Successfully created a new recipe');
        } else {
          await writeObservation('- ❌ Could not find save button for recipe creation');
        }
      } else {
        await writeObservation('- ❌ Could not find create recipe button');
        return false;
      }
    } else {
      console.log(`✅ Found ${recipeCards.length} recipe cards on the page`);
      await writeObservation(`- Found ${recipeCards.length} recipe cards on the homepage`);
      
      // 2. Open a recipe and capture the viewing experience
      console.log('Clicking on the first recipe card...');
      await recipeCards[0].click();
      await wait(2000);
      await captureScreenshot(page, '02-recipe-details');
      
      // Document the recipe viewing experience
      const recipeStructure = await page.evaluate(() => {
        const elements = {};
        elements.title = document.querySelector('h1, h2')?.textContent?.trim() || 'No title found';
        elements.description = document.querySelector('p')?.textContent?.trim() || 'No description found';
        
        // Check for ingredients section
        elements.hasIngredients = false;
        const allElements = Array.from(document.querySelectorAll('*'));
        for (const el of allElements) {
          if (el.textContent && el.textContent.includes('Ingredients')) {
            elements.hasIngredients = true;
            break;
          }
        }
        
        // Check for instructions section
        elements.hasInstructions = false;
        for (const el of allElements) {
          if (el.textContent && (el.textContent.includes('Instructions') || el.textContent.includes('Steps'))) {
            elements.hasInstructions = true;
            break;
          }
        }
        
        // Check for tags section
        elements.hasTags = false;
        for (const el of allElements) {
          if (el.textContent && el.textContent.includes('Tags')) {
            elements.hasTags = true;
            break;
          }
        }
        
        // Check for versions/history section
        elements.hasVersions = false;
        for (const el of allElements) {
          if (el.textContent && (el.textContent.includes('Versions') || el.textContent.includes('History'))) {
            elements.hasVersions = true;
            break;
          }
        }
        
        // Check for AI suggestions
        elements.hasAiSuggestions = false;
        for (const el of allElements) {
          if (el.textContent && (el.textContent.includes('AI Suggestions') || el.textContent.includes('Suggested'))) {
            elements.hasAiSuggestions = true;
            break;
          }
        }
        
        return elements;
      });
      
      await writeObservation(`### Recipe Viewing Experience\n- Recipe title: ${recipeStructure.title}\n- Has ingredients section: ${recipeStructure.hasIngredients}\n- Has instructions section: ${recipeStructure.hasInstructions}\n- Has tags section: ${recipeStructure.hasTags}\n- Has versions/history section: ${recipeStructure.hasVersions}\n- Has AI suggestions: ${recipeStructure.hasAiSuggestions}`);
      
      // 3. Test edit functionality
      console.log('Looking for edit buttons...');
      
      // Find edit buttons
      const editButtons = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const editButtons = buttons.filter(button => {
          return button.textContent.includes('Edit') || 
                 button.textContent.includes('Modify') || 
                 button.getAttribute('data-testid') === 'edit-recipe-button';
        });
        return editButtons.map(button => ({
          text: button.textContent.trim(),
          testId: button.getAttribute('data-testid'),
          position: button.getBoundingClientRect()
        }));
      });
      
      // Use the information from the evaluated buttons
      const hasEditButtons = editButtons.length > 0;
      
      if (hasEditButtons) {
        await writeObservation('### Edit Functionality\n- Found edit buttons in the UI');
        
        // Click the first edit button by simulating a click at its position
        const firstEditButton = editButtons[0];
        await page.mouse.click(
          firstEditButton.position.left + (firstEditButton.position.width / 2),
          firstEditButton.position.top + (firstEditButton.position.height / 2)
        );
        await wait(2000);
        await captureScreenshot(page, '03-edit-mode');
        
        // Determine if editing is inline or in a modal
        const hasModal = await page.evaluate(() => {
          return !!(
            document.querySelector('div[role="dialog"]') || 
            document.querySelector('.modal') || 
            document.querySelector('.dialog')
          );
        });
        
        await writeObservation(`- Editing is done ${hasModal ? 'in a modal' : 'inline'}`);
        
        // Find and interact with the title input field
        const inputFieldInfo = await page.evaluate((hasModal) => {
          let inputField = null;
          
          if (hasModal) {
            const modal = document.querySelector('div[role="dialog"]') || 
                          document.querySelector('.modal') || 
                          document.querySelector('.dialog');
            
            if (modal) {
              inputField = modal.querySelector('input[type="text"]');
            }
          }
          
          if (!inputField) {
            // Try general selectors if not found in modal
            inputField = document.querySelector('input[type="text"]') || 
                         document.querySelector('textarea');
          }
          
          return inputField ? {
            found: true,
            x: inputField.getBoundingClientRect().left + (inputField.getBoundingClientRect().width / 2),
            y: inputField.getBoundingClientRect().top + (inputField.getBoundingClientRect().height / 2)
          } : { found: false };
        }, hasModal);
        
        if (inputFieldInfo.found) {
          // Click on the input field
          await page.mouse.click(inputFieldInfo.x, inputFieldInfo.y);
          
          // Clear the field (multiple backspaces should clear most fields)
          for (let i = 0; i < 30; i++) {
            await page.keyboard.press('Backspace');
          }
          
          // Type the new text
          await page.keyboard.type('Modified Recipe Title');
          await writeObservation('- Successfully modified the recipe title');
          
          // Look for save button
          const saveButtonInfo = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const saveButton = buttons.find(button => 
              button.textContent.includes('Save') || button.textContent.includes('Update')
            );
            
            return saveButton ? {
              found: true,
              x: saveButton.getBoundingClientRect().left + (saveButton.getBoundingClientRect().width / 2),
              y: saveButton.getBoundingClientRect().top + (saveButton.getBoundingClientRect().height / 2)
            } : { found: false };
          });
          
          if (saveButtonInfo.found) {
            await page.mouse.click(saveButtonInfo.x, saveButtonInfo.y);
            await wait(2000);
            await captureScreenshot(page, '04-saved-changes');
            await writeObservation('- Successfully saved changes to the recipe');
          } else {
            await writeObservation('- ❌ Could not find save button after editing');
          }
        } else {
          await writeObservation('- ❌ Could not find title input field for editing');
        }
      } else {
        await writeObservation('- ❌ No edit buttons found in the recipe details view');
      }
      
      // 4. Test version tracking functionality
      console.log('Looking for version tracking features...');
      
      // Look for version history or iterations
      const versionButtons = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const versionButtons = buttons.filter(button => {
          return button.textContent.includes('Versions') || 
                 button.textContent.includes('History') || 
                 button.getAttribute('data-testid') === 'recipe-versions';
        });
        return versionButtons.map(button => ({
          text: button.textContent.trim(),
          testId: button.getAttribute('data-testid'),
          position: button.getBoundingClientRect()
        }));
      });
      
      const hasVersionButtons = versionButtons.length > 0;
      
      if (hasVersionButtons) {
        // Click the first version button
        const firstVersionButton = versionButtons[0];
        await page.mouse.click(
          firstVersionButton.position.left + (firstVersionButton.position.width / 2),
          firstVersionButton.position.top + (firstVersionButton.position.height / 2)
        );
        await wait(2000);
        await captureScreenshot(page, '05-version-history');
        
        // Document how versions are displayed
        let versionUI;
        try {
          versionUI = await page.evaluate(() => {
            const elements = {};
            elements.versionCount = document.querySelectorAll('.version-item, .history-item, li').length;
            
            // Check for timestamps
            elements.hasTimestamps = false;
            const allSpans = Array.from(document.querySelectorAll('span'));
            for (const span of allSpans) {
              if (span.textContent && (span.textContent.includes('created at') || span.textContent.includes('modified at'))) {
                elements.hasTimestamps = true;
                break;
              }
            }
            
            // Check for comparison functionality
            elements.hasComparison = false;
            const allButtons = Array.from(document.querySelectorAll('button'));
            for (const button of allButtons) {
              if (button.textContent && (button.textContent.includes('Compare') || button.textContent.includes('Diff'))) {
                elements.hasComparison = true;
                break;
              }
            }
            
            // Check for restore functionality
            elements.hasRestore = false;
            for (const button of allButtons) {
              if (button.textContent && (button.textContent.includes('Restore') || button.textContent.includes('Revert'))) {
                elements.hasRestore = true;
                break;
              }
            }
            
            return elements;
          });
        } catch (error) {
          console.error('Error getting version UI details:', error);
          versionUI = { versionCount: 0, hasTimestamps: false, hasComparison: false, hasRestore: false };
        }
        
        await writeObservation(`### Version Tracking\n- Number of versions displayed: ${versionUI.versionCount}\n- Shows timestamps: ${versionUI.hasTimestamps}\n- Has version comparison: ${versionUI.hasComparison}\n- Can restore previous versions: ${versionUI.hasRestore}`);
        
        // Try clicking on a version if available
        const versionItems = await page.evaluate(() => {
          const items = Array.from(document.querySelectorAll('.version-item, .history-item, li'));
          return items.map(item => ({
            text: item.textContent.trim(),
            position: item.getBoundingClientRect()
          }));
        });
        
        if (versionItems.length > 1) {
          // Click the second version item
          const secondVersionItem = versionItems[1];
          await page.mouse.click(
            secondVersionItem.position.left + (secondVersionItem.position.width / 2),
            secondVersionItem.position.top + (secondVersionItem.position.height / 2)
          );
          await wait(2000);
          await captureScreenshot(page, '06-specific-version');
          await writeObservation('- Successfully viewed a specific version');
        }
      } else {
        await writeObservation('### Version Tracking\n- ❌ No version tracking features found');
      }
      
      // 5. Look for AI suggestion features
      console.log('Looking for AI suggestion features...');
      
      const aiButtons = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const aiButtons = buttons.filter(button => {
          return button.textContent.includes('AI Suggestions') || 
                 button.textContent.includes('Get Suggestions') || 
                 button.getAttribute('data-testid') === 'ai-suggest';
        });
        return aiButtons.map(button => ({
          text: button.textContent.trim(),
          testId: button.getAttribute('data-testid'),
          position: button.getBoundingClientRect()
        }));
      });
      
      const hasAiButtons = aiButtons.length > 0;
      
      if (hasAiButtons) {
        // Click the first AI suggestion button
        const firstAiButton = aiButtons[0];
        await page.mouse.click(
          firstAiButton.position.left + (firstAiButton.position.width / 2),
          firstAiButton.position.top + (firstAiButton.position.height / 2)
        );
        await wait(2000);
        await captureScreenshot(page, '07-ai-suggestions');
        
        // Document how AI suggestions are integrated
        const aiUI = await page.evaluate(() => {
          const elements = {};
          elements.suggestionsCount = document.querySelectorAll('.suggestion-item, .ai-item').length;
          
          // Check for apply buttons
          elements.hasApplyButton = false;
          const allButtons = Array.from(document.querySelectorAll('button'));
          for (const button of allButtons) {
            if (button.textContent && (button.textContent.includes('Apply') || button.textContent.includes('Use'))) {
              elements.hasApplyButton = true;
              break;
            }
          }
          
          // Check if suggestions are inline
          elements.isInline = document.querySelectorAll('span.suggestion, mark.suggestion').length > 0;
          
          // Check if suggestions are in a standalone panel
          elements.isStandalone = !!(
            document.querySelector('div.suggestions-panel') || 
            document.querySelector('div.ai-panel')
          );
          
          return elements;
        });
        
        await writeObservation(`### AI Suggestions\n- Number of suggestions: ${aiUI.suggestionsCount}\n- Can apply suggestions: ${aiUI.hasApplyButton}\n- Suggestions appear inline: ${aiUI.isInline}\n- Suggestions appear in separate panel: ${aiUI.isStandalone}`);
      } else {
        await writeObservation('### AI Suggestions\n- ❌ No AI suggestion features found');
      }
    }
    
    // 6. Document overall document organization
    console.log('Analyzing overall document organization...');
    
    // Return to recipe details if needed
    try {
      await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 10000 });
      const recipeCards = await page.$$('[data-testid="recipe-card"]');
      if (recipeCards.length > 0) {
        await recipeCards[0].click();
        await wait(2000);
      }
    } catch (error) {
      console.error('Error returning to recipe details:', error);
    }
    
    // Capture the layout structure
    const layoutStructure = await page.evaluate(() => {
      function getElementInfo(element) {
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          id: element.id,
          classes: Array.from(element.classList),
          position: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          }
        };
      }
      
      const layout = {};
      
      // Main content area
      layout.mainContent = getElementInfo(document.querySelector('main, [role="main"]'));
      
      // Navigation
      layout.navigation = getElementInfo(document.querySelector('nav, [role="navigation"]'));
      
      // Sidebar(s)
      layout.leftSidebar = getElementInfo(document.querySelector('aside:first-of-type, [role="complementary"]:first-of-type'));
      layout.rightSidebar = getElementInfo(document.querySelector('aside:last-of-type, [role="complementary"]:last-of-type'));
      
      // Modal
      layout.modal = getElementInfo(document.querySelector('[role="dialog"], .modal'));
      
      return layout;
    });
    
    await captureScreenshot(page, '08-overall-layout');
    
    await writeObservation(`### Overall Document Organization\n- Main content area: ${layoutStructure.mainContent ? 'Present' : 'Not found'}\n- Navigation: ${layoutStructure.navigation ? 'Present' : 'Not found'}\n- Left sidebar: ${layoutStructure.leftSidebar ? 'Present' : 'Not found'}\n- Right sidebar: ${layoutStructure.rightSidebar ? 'Present' : 'Not found'}\n- Uses modal dialogs: ${layoutStructure.modal ? 'Yes' : 'No'}`);
    
    // Declare variables needed for summary with default values
    let recipeDisplayInfo = 'Could not evaluate recipe structure';
    let ingredientsStatus = 'Issues with ingredient display';
    
    // Use data from earlier screen captures if available
    if (typeof recipeStructure !== 'undefined') {
      recipeDisplayInfo = `Title and description are visible, ingredients section is ${recipeStructure.hasIngredients ? 'present' : 'missing'}`;
      ingredientsStatus = recipeStructure.hasIngredients ? 'Recipe ingredients are properly displayed' : 'Issues with ingredient display';
    }
    
    // Handle potentially undefined variables with default values
    const editButtonsFound = typeof editButtons !== 'undefined' && editButtons.length > 0;
    const editInModal = typeof hasModal !== 'undefined' && hasModal;
    const versionButtonsFound = typeof versionButtons !== 'undefined' && versionButtons.length > 0;
    const aiButtonsFound = typeof aiButtons !== 'undefined' && aiButtons.length > 0;
    const versionCount = (typeof versionUI !== 'undefined' && versionUI?.versionCount) || 'unknown';
    
    // Default layout determination
    let layoutType = 'single-column';
    if (layoutStructure) {
      if (layoutStructure.leftSidebar && layoutStructure.rightSidebar) {
        layoutType = 'three-column';
      } else if (layoutStructure.leftSidebar || layoutStructure.rightSidebar) {
        layoutType = 'two-column';
      }
    }
    
    // Create summary report
    await writeObservation(`\n## Summary Findings\n
1. Recipe content display: ${recipeDisplayInfo}
2. Editing experience: ${editButtonsFound ? `Editing is done ${editInModal ? 'in a modal' : 'inline'}` : 'No editing functionality found'}
3. Version tracking: ${versionButtonsFound ? `Version history is available with ${versionCount} versions` : 'No version tracking functionality found'}
4. AI suggestions: ${aiButtonsFound ? 'AI suggestion features are available' : 'No AI suggestion features found'}
5. Document organization: Uses a ${layoutType} layout

### Key Observations:
- ${ingredientsStatus}
- ${editButtonsFound ? 'Editing functionality works as expected' : 'Limited or no editing functionality'}
- ${versionButtonsFound ? 'Version tracking is implemented' : 'No version history management'}
- ${aiButtonsFound ? 'AI suggestion features are integrated' : 'No AI enhancement features'}`);
    
    console.log('Analysis completed successfully.');
    return true;
  } catch (error) {
    console.error('Error during testing:', error);
    await writeObservation(`\n## ERROR\nEncountered an error during testing: ${error.message}`);
    return false;
  } finally {
    // Show final message and close the browser
    console.log('\nTest completed. Check the screenshots and observation document in:', SCREENSHOTS_DIR);
    await browser.close();
  }
}

// Check if the app is already running
async function checkAppIsRunning() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(APP_URL, { timeout: 5000 });
    await browser.close();
    return true;
  } catch (error) {
    console.log('App is not running yet. Please start it with: npm run dev');
    return false;
  }
}

// Run the test
async function runTest() {
  if (await checkAppIsRunning()) {
    await testRecipeDocumentExperience();
  }
}

runTest();