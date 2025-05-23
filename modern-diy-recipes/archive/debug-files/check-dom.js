const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Get the full DOM structure
  const domInfo = await page.evaluate(() => {
    // Find all elements between body and our terminal container
    const terminal = document.querySelector('.h-screen.w-screen');
    const path = [];
    let current = terminal;
    
    while (current && current !== document.body) {
      current = current.parentElement;
      if (current && current !== document.body) {
        const styles = window.getComputedStyle(current);
        path.push({
          tag: current.tagName,
          id: current.id,
          className: current.className,
          display: styles.display,
          width: styles.width,
          maxWidth: styles.maxWidth
        });
      }
    }
    
    // Also check for any wrapping divs
    const allDivs = Array.from(document.querySelectorAll('div')).slice(0, 10);
    const structure = allDivs.map(div => {
      const styles = window.getComputedStyle(div);
      return {
        className: div.className.substring(0, 50),
        display: styles.display,
        width: styles.width
      };
    });
    
    return {
      pathToTerminal: path,
      topLevelStructure: structure
    };
  });
  
  console.log('Path from terminal to body:');
  console.log(JSON.stringify(domInfo.pathToTerminal, null, 2));
  console.log('\nTop level divs:');
  console.log(JSON.stringify(domInfo.topLevelStructure, null, 2));
  
  await browser.close();
})();