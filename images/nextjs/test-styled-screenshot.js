import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1200, height: 800 });
  
  try {
    await page.goto('http://localhost:3001/test-styled/', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Wait a bit for any dynamic content
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'images/nextjs/nextjs_test_styled.png',
      fullPage: false 
    });
    
    console.log('Screenshot saved to images/nextjs/nextjs_test_styled.png');
  } catch (error) {
    console.error('Error:', error);
  }
  
  await browser.close();
})();