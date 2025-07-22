const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1200, height: 800 });
  
  try {
    await page.goto('http://localhost:3001/sites/f77e582f-69ed-4565-a07d-521693d25095/preview/', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Wait a bit for any dynamic content
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'images/nextjs/nextjs_preview_current.png',
      fullPage: false 
    });
    
    console.log('Screenshot saved to images/nextjs/nextjs_preview_current.png');
  } catch (error) {
    console.error('Error:', error);
  }
  
  await browser.close();
})();