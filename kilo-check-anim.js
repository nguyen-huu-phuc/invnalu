const { chromium } = require('/home/hp/nalu/invnalu/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:3032/plant/plant-mseifbr4-fw3wkf');
  await page.waitForTimeout(2000);
  
  const result = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Chốt báo giá"]');
    if (!btn) return 'BUTTON_NOT_FOUND';
    
    const svg = btn.querySelector('svg');
    const spans = Array.from(btn.querySelectorAll('span'));
    
    return {
      btnAriaLabel: btn.getAttribute('aria-label'),
      svgAnimation: svg ? svg.style.animation : null,
      spanCount: spans.length,
      spans: spans.map(s => ({
        className: s.className,
        style: s.getAttribute('style')
      })),
      computedSvgAnimation: svg ? window.getComputedStyle(svg).animation : null,
      computedSpan0Animation: spans[0] ? window.getComputedStyle(spans[0]).animation : null,
      computedSpan1Animation: spans[1] ? window.getComputedStyle(spans[1]).animation : null,
    };
  });
  
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
