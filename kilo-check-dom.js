const { chromium } = require('/home/hp/nalu/invnalu/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:3032/plant/plant-mseifbr4-fw3wkf');
  await page.waitForTimeout(2000);
  
  const btn = await page.$('button[aria-label="Chốt báo giá"]');
  if (!btn) {
    console.log('BUTTON_NOT_FOUND');
    await browser.close();
    return;
  }
  
  const info = await btn.evaluate(el => {
    const svg = el.querySelector('svg');
    const spans = Array.from(el.querySelectorAll('span'));
    return {
      btnClass: el.className,
      svgClass: svg ? svg.className.baseVal : null,
      svgStyle: svg ? svg.getAttribute('style') : null,
      spanCount: spans.length,
      spans: spans.map(s => ({
        classes: s.className.baseVal,
        style: s.getAttribute('style')
      }))
    };
  });
  
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
