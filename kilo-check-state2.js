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
    const ring = btn.querySelector('span[style*="ring-out"]');
    const breathSpan = btn.querySelector('span[style*="breath"]');
    
    // Check if there's any quote data in the page
    const quoteDataEl = document.querySelector('[data-quote-id]');
    const proposalIdEl = document.querySelector('[data-proposal-id]');
    
    return {
      btnAriaLabel: btn.getAttribute('aria-label'),
      hasRingOut: !!ring,
      hasBreathOnSvg: svg ? svg.style.animation.includes('breath') : false,
      hasBreathSpan: !!breathSpan,
      quoteData: quoteDataEl ? quoteDataEl.getAttribute('data-quote-id') : null,
      proposalData: proposalIdEl ? proposalIdEl.getAttribute('data-proposal-id') : null,
    };
  });
  
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
