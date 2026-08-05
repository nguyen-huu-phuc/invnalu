const { chromium } = require('/home/hp/nalu/invnalu/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:3032/plant/plant-mseifbr4-fw3wkf');
  await page.waitForTimeout(2000);
  
  // Check if there's a "Đã chốt" indicator anywhere
  const hasAcceptedText = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const texts = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.includes('Đã chốt')) {
        texts.push(node.textContent.trim().substring(0, 100));
      }
    }
    return texts;
  });
  
  console.log('Texts containing "Đã chốt":', JSON.stringify(hasAcceptedText, null, 2));
  
  // Also check the MobileIndicator to see activeIndex/totalCount
  const mobileIndicator = await page.$('.mobile-indicator, [data-active-index]');
  if (mobileIndicator) {
    const text = await mobileIndicator.textContent();
    console.log('MobileIndicator:', text);
  }
  
  await browser.close();
})();
