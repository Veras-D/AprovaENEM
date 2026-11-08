import pkg from '../node_modules/@playwright/test/index.js';
const { chromium } = pkg;
import path from 'node:path';

async function generatePdf() {
  console.log('🚀 Launching Chromium for Presentation PDF export...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const htmlPath = path.resolve('docs/presentation/index.html');
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const pdfPath = path.resolve('docs/presentation/aprovaenem-presentation.pdf');
  await page.pdf({
    path: pdfPath,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
  });

  console.log('✅ Presentation PDF generated successfully at:', pdfPath);
  await browser.close();
}

generatePdf().catch((err) => {
  console.error('❌ Error generating PDF:', err);
  process.exit(1);
});
