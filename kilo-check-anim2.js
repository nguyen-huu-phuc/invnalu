const { chromium } = require('/home/hp/nalu/invnalu/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:3032/plant/plant-mseifbr4-fw3wkf');
  await page.waitForTimeout(3000);
  
  const samples = [];
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(500);
    const data = await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label="Chốt báo giá"]');
      if (!btn) return null;
      const svg = btn.querySelector('svg');
      const ring = btn.querySelector('span[style*="ring-out"]');
      return {
        svgTransform: svg ? window.getComputedStyle(svg).transform : null,
        svgOpacity: svg ? window.getComputedStyle(svg).opacity : null,
        ringTransform: ring ? window.getComputedStyle(ring).transform : null,
        ringOpacity: ring ? window.getComputedStyle(ring).opacity : null,
      };
    });
    samples.push(data);
  }
  
  console.log(JSON.stringify(samples, null, 2));
  await browser.close();
})();
