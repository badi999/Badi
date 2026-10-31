// Exports the enhanced (AI) theme as a clean still: output/theme-ai.jpg
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.join(__dirname, 'scene.html'));
  await p.waitForFunction(() => window.READY === true);
  await p.evaluate(() => window.seek(60));
  await p.addStyleTag({ content: '.scene,#brand,#progress,#cap,#flash,#veil{display:none!important}' });
  await p.screenshot({ path: path.join(__dirname, 'output', 'theme-ai.jpg'), type: 'jpeg', quality: 94 });
  await b.close();
})();
