import m from '../node_modules/qrcode/lib/server.js';
const QRCode = m.default || m;
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('docs/presentation/images');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function renderCustomQrSvg(url, brandColor, centerIconSvg) {
  const qr = QRCode.create(url, { errorCorrectionLevel: 'H' });
  const size = qr.modules.size;
  const cellSize = 10;
  const margin = 20;
  const totalDim = size * cellSize + margin * 2;

  // Center area reserved for logo
  const centerStart = Math.floor(size / 2) - 4;
  const centerEnd = Math.floor(size / 2) + 4;

  let rects = '';

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip cells in center logo zone
      if (r >= centerStart && r <= centerEnd && c >= centerStart && c <= centerEnd) {
        continue;
      }

      // Check if this cell is inside one of the 3 corner finder patterns (7x7 zones)
      const isTopLeftFinder = r < 7 && c < 7;
      const isTopRightFinder = r < 7 && c >= size - 7;
      const isBottomLeftFinder = r >= size - 7 && c < 7;

      if (qr.modules.get(r, c)) {
        const x = margin + c * cellSize;
        const y = margin + r * cellSize;

        if (isTopLeftFinder || isTopRightFinder || isBottomLeftFinder) {
          // Finder elements
          rects += `<rect x="${x}" y="${y}" width="${cellSize - 0.5}" height="${cellSize - 0.5}" rx="2" fill="${brandColor}" />\n`;
        } else {
          // Regular data modules: smooth rounded dots
          rects += `<rect x="${x + 0.8}" y="${y + 0.8}" width="${cellSize - 1.6}" height="${cellSize - 1.6}" rx="3" fill="${brandColor}" />\n`;
        }
      }
    }
  }

  // Center logo badge
  const centerBadgeSize = 8.5 * cellSize;
  const centerBadgeX = (totalDim - centerBadgeSize) / 2;
  const centerBadgeY = (totalDim - centerBadgeSize) / 2;
  const iconSize = 46;
  const iconX = (totalDim - iconSize) / 2;
  const iconY = (totalDim - iconSize) / 2;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalDim} ${totalDim}" width="220" height="220">
  <defs>
    <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.18" />
    </filter>
  </defs>
  <!-- Background Card -->
  <rect width="${totalDim}" height="${totalDim}" rx="16" fill="#FFFFFF" />
  
  <!-- Data Modules -->
  ${rects}

  <!-- Center Logo Badge -->
  <rect x="${centerBadgeX}" y="${centerBadgeY}" width="${centerBadgeSize}" height="${centerBadgeSize}" rx="12" fill="#FFFFFF" filter="url(#badgeShadow)" stroke="#F1F5F9" stroke-width="2" />
  <g transform="translate(${iconX}, ${iconY})">
    ${centerIconSvg}
  </g>
</svg>`;

  return svg;
}

// 1. GitHub Icon
const githubIconSvg = `
<svg width="46" height="46" viewBox="0 0 24 24" fill="#181717">
  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
</svg>`;

// 2. LinkedIn Icon
const linkedinIconSvg = `
<svg width="46" height="46" viewBox="0 0 24 24" fill="#0A66C2">
  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
</svg>`;

// 3. Web Portfolio Icon (Rocket & Spark)
const webIconSvg = `
<svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10" stroke="#059669" stroke-width="2" fill="#ECFDF5"/>
  <line x1="2" y1="12" x2="22" y2="12" />
  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
</svg>`;

const ghSvg = renderCustomQrSvg('https://github.com/Veras-D', '#7C3AED', githubIconSvg);
const liSvg = renderCustomQrSvg('https://www.linkedin.com/in/veras-d/', '#0A66C2', linkedinIconSvg);
const webSvg = renderCustomQrSvg('https://veras-app.netlify.app/', '#059669', webIconSvg);

fs.writeFileSync(path.join(outDir, 'qr-github.svg'), ghSvg);
fs.writeFileSync(path.join(outDir, 'qr-linkedin.svg'), liSvg);
fs.writeFileSync(path.join(outDir, 'qr-portfolio.svg'), webSvg);

console.log('✅ Stylish branded QR codes generated successfully!');
