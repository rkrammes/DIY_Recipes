const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'terminology-test');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

// Helper to save screenshots with timestamp
const saveScreenshot = async (page, name) => {
  const timestamp = Date.now();
  const filePath = path.join(screenshotsDir, `${name}-${timestamp}.png`);
  await page.screenshot({ path: filePath });
  console.log(`Screenshot saved: ${filePath}`);
  return filePath;
};

// Check text on the page with timeout and retry
const checkTextOnPage = async (page, text, timeout = 5000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const content = await page.content();
    if (content.includes(text)) {
      return true;
    }
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
};

// Helper to wait a bit
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Main test function
(async () => {
  console.log('Starting DIY formulation terminology verification test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 900 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Test document-test page
    console.log('Testing document-test page...');
    await page.goto('http://localhost:3000/document-test', { waitUntil: 'networkidle2' });
    await saveScreenshot(page, 'document-test-page');
    
    // Check for DIY formulation terminology
    console.log('Checking for proper DIY formulation terminology...');
    const tests = [
      { term: 'Creation Mode', oldTerm: 'Making Mode' },
      { term: 'Formulation Timeline', oldTerm: 'Recipe Timeline' },
      { term: 'Formulation Tools', oldTerm: 'Recipe Tools' },
      { term: 'Formulation Metrics', oldTerm: 'Recipe Metrics' },
      { term: 'Printed from DIY Formulations', oldTerm: 'Printed from DIY Recipes' },
      { term: 'Start Creating', oldTerm: 'Start Making' }
    ];
    
    const results = [];
    
    // Click on Creation Mode to see its related content
    console.log('Testing Creation Mode...');
    try {
      const creationModeButton = await page.$('button:has-text("Creation Mode")');
      if (creationModeButton) {
        await creationModeButton.click();
        await wait(1000);
        await saveScreenshot(page, 'creation-mode-active');
        
        // Check for Creation Mode terminology in active state
        const creationModeActive = await checkTextOnPage(page, 'Creation Mode enabled');
        results.push({ term: 'Creation Mode enabled', found: creationModeActive });
        
        // Start Creating button
        const startCreatingButton = await page.$('button:has-text("Start Creating")');
        if (startCreatingButton) {
          results.push({ term: 'Start Creating', found: true });
          
          // Click to start
          await startCreatingButton.click();
          await wait(1000);
          await saveScreenshot(page, 'creating-step');
          
          // Exit Creation Mode
          const exitButton = await page.$('button:has-text("Exit Creation")');
          if (exitButton) {
            results.push({ term: 'Exit Creation Mode', found: true });
            await exitButton.click();
          } else {
            results.push({ term: 'Exit Creation Mode', found: false });
          }
        } else {
          results.push({ term: 'Start Creating', found: false });
        }
      } else {
        console.log('Creation Mode button not found');
        results.push({ term: 'Creation Mode', found: false });
      }
    } catch (error) {
      console.error('Error testing Creation Mode:', error);
    }
    
    // Check for section headings and titles
    const pageContent = await page.content();
    for (const test of tests) {
      if (!results.some(r => r.term === test.term)) {
        const found = pageContent.includes(test.term);
        const oldFound = pageContent.includes(test.oldTerm);
        results.push({ 
          term: test.term, 
          found,
          oldTermStillPresent: oldFound
        });
      }
    }
    
    // Generate report
    console.log('\nTerminology Test Results:');
    results.forEach(result => {
      if (result.found) {
        console.log(`✅ "${result.term}" found`);
      } else {
        console.log(`❌ "${result.term}" not found`);
      }
      
      if (result.oldTermStillPresent) {
        console.log(`⚠️ Old terminology still present: "${result.oldTermStillPresent}"`);
      }
    });
    
    // Write a test report
    const reportPath = path.join(screenshotsDir, 'terminology-test-report.md');
    let report = `# DIY Formulation Terminology Test Report\n\n`;
    report += `## Test Date: ${new Date().toLocaleString()}\n\n`;
    report += `This test verifies that the document-centric interface uses appropriate DIY formulation terminology.\n\n`;
    report += `### Test Results\n\n`;
    
    results.forEach(result => {
      report += `- **${result.term}**: ${result.found ? '✅ Found' : '❌ Not found'}\n`;
      if (result.oldTermStillPresent) {
        report += `  ⚠️ Warning: Old terminology "${result.oldTermStillPresent}" still present\n`;
      }
    });
    
    report += `\n### Summary\n\n`;
    const passedTests = results.filter(r => r.found).length;
    report += `${passedTests} out of ${results.length} terminology checks passed.\n`;
    
    fs.writeFileSync(reportPath, report);
    console.log(`\nTest report written to: ${reportPath}`);
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();