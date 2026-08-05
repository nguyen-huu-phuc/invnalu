const { chromium } = require('/home/hp/nalu/invnalu/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:3032/plant/plant-mseifbr4-fw3wkf');
  await page.waitForTimeout(2000);
  
  const result = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Chốt báo giá"]');
    if (!btn) return 'BUTTON_NOT_FOUND';
    
    // Try to find React props from the component
    const root = document.querySelector('#__next') || document.querySelector('[data-reactroot]') || document.querySelector('.react-root');
    
    // Check if there's any quote selected state in the DOM
    const quoteSelectedEl = document.querySelector('[data-quote-selected]');
    const selectedQuoteEl = document.querySelector('[data-selected-quote-id]');
    
    return {
      btnAriaLabel: btn.getAttribute('aria-label'),
      hasQuoteSelectedEl: !!quoteSelectedEl,
      hasSelectedQuoteEl: !!selectedQuoteEl,
      btnDisabled: btn.disabled,
      btnHTML: btn.innerHTML.substring(0, 500)
    };
  });
  
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
