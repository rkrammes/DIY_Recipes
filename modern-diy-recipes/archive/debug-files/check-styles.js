const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Check styles on the main container
  const styles = await page.evaluate(() => {
    const container = document.querySelector('.h-screen.w-screen');
    if (!container) return null;
    
    // Get all stylesheets
    const styleSheets = Array.from(document.styleSheets);
    const rules = [];
    
    // Check which CSS rules are applying to this element
    styleSheets.forEach((sheet, index) => {
      try {
        const cssRules = Array.from(sheet.cssRules || []);
        cssRules.forEach(rule => {
          if (rule.selectorText && container.matches(rule.selectorText)) {
            rules.push({
              selector: rule.selectorText,
              styles: rule.style.cssText,
              sheet: index
            });
          }
        });
      } catch (e) {
        // Ignore cross-origin stylesheets
      }
    });
    
    const computed = window.getComputedStyle(container);
    
    return {
      className: container.className,
      computedDisplay: computed.display,
      computedWidth: computed.width,
      computedHeight: computed.height,
      appliedRules: rules.slice(0, 10),
      // Check if flex class exists
      hasFlexClass: container.classList.contains('flex'),
      allClasses: Array.from(container.classList)
    };
  });
  
  console.log(JSON.stringify(styles, null, 2));
  
  // Also check the Tailwind generated styles
  const tailwindCheck = await page.evaluate(() => {
    // Find any style tags that might contain Tailwind CSS
    const styleTags = Array.from(document.querySelectorAll('style'));
    const tailwindStyles = styleTags.map(tag => tag.textContent.substring(0, 200)).filter(text => text.includes('.flex'));
    return tailwindStyles;
  });
  
  console.log('\nTailwind flex styles found:', tailwindCheck.length > 0);
  
  await browser.close();
})();