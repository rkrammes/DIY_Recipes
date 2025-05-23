const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'test-artifacts', 'document-verify');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function verifyDocumentCentricView() {
  console.log('Starting basic verification of Document-Centric View...');
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  try {
    const page = await browser.newPage();
    console.log('Opening document view page...');
    await page.goto('http://localhost:3000/document-view?id=1', { timeout: 30000 });
    
    // Take a screenshot of initial page
    console.log('Taking screenshot of initial page...');
    await page.waitForTimeout(3000); // Wait for page to stabilize
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'document-view-initial.png'),
      fullPage: true 
    });

    // Check if we get a page title
    try {
      const title = await page.$eval('h1', el => el.textContent);
      console.log(`Page title: ${title}`);
    } catch (err) {
      console.log('Could not find page title');
    }

    // Check if the document view has rendered
    try {
      const documentContent = await page.$('.document-centric-recipe');
      if (documentContent) {
        console.log('Document content found! ✅');
      } else {
        console.log('Document content not found ❌');
      }
    } catch (err) {
      console.log('Error checking for document content', err);
    }

    // Look for any visible error messages
    try {
      const errorMessages = await page.$$eval('*:not(script):not(style):not(html):not(head):not(body)', els => 
        els.map(el => el.textContent)
          .filter(text => 
            text && 
            (text.includes('error') || 
             text.includes('Error') || 
             text.includes('exception') || 
             text.includes('Exception'))
          )
      );
      
      if (errorMessages.length > 0) {
        console.log('Found error messages on page:');
        errorMessages.forEach(msg => console.log(`- ${msg.trim()}`));
      } else {
        console.log('No error messages found on page ✅');
      }
    } catch (err) {
      console.log('Error checking for error messages', err);
    }

    console.log('Basic verification completed!');
    console.log(`Screenshots saved to: ${screenshotsDir}`);
    
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await page.close();
    await browser.close();
  }
}

verifyDocumentCentricView();