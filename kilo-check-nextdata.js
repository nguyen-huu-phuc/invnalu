const { chromium } = require('/home/hp/nalu/invnalu/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:3032/plant/plant-mseifbr4-fw3wkf');
  await page.waitForTimeout(2000);
  
  const nextData = await page.evaluate(() => {
    return window.__NEXT_DATA__ || null;
  });
  
  if (nextData) {
    console.log(JSON.stringify(nextData, null, 2).substring(0, 3000));
  } else {
    console.log('No __NEXT_DATA__ found');
  }
  
  await browser.close();
})();
