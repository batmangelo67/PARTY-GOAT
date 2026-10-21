// Draws the PARTY GOAT app icon from the mascot's shape data (src/art/goat-paths.ts) and renders
// every icon file in public/: favicon.svg, apple-touch-icon.png, icon-192/512 and the maskable icon.
// Rasterising uses the Playwright Chromium already installed for the audit (dev only).
// Usage: npm run make:icons
import { writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { GOAT_COLORS as C, GOAT_EARS, GOAT_SHAPES as S } from "../src/art/goat-paths.ts";

const STROKE = `stroke="${C.ink}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
const BACKGROUND = "#17131f";
const GLOW = "#2a2140";

const ellipse = ([cx, cy, rx, ry, rotation], fill, stroked) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" transform="rotate(${rotation} ${cx} ${cy})" ${stroked ? STROKE : ""}/>`;

function goat() {
  return [
    `<path d="${S.hornLeft}" fill="${C.horn}" ${STROKE}/>`,
    `<path d="${S.hornRight}" fill="${C.horn}" ${STROKE}/>`,
    ellipse(GOAT_EARS.left, C.fur, true),
    ellipse(GOAT_EARS.right, C.fur, true),
    ellipse(GOAT_EARS.innerLeft, C.blush),
    ellipse(GOAT_EARS.innerRight, C.blush),
    `<path d="${S.beard}" fill="${C.furShade}" ${STROKE}/>`,
    `<path d="${S.head}" fill="${C.fur}" ${STROKE}/>`,
    `<ellipse cx="60" cy="81" rx="17" ry="13" fill="${C.furShade}"/>`,
    `<ellipse cx="54.5" cy="77" rx="2.2" ry="1.5" fill="${C.ink}"/>`,
    `<ellipse cx="65.5" cy="77" rx="2.2" ry="1.5" fill="${C.ink}"/>`,
    `<ellipse cx="41" cy="68" rx="5" ry="3" fill="${C.blush}" opacity="0.55"/>`,
    `<ellipse cx="79" cy="68" rx="5" ry="3" fill="${C.blush}" opacity="0.55"/>`,
    `<ellipse cx="49" cy="56" rx="4.2" ry="5.2" fill="${C.ink}"/>`,
    `<path d="M66 57 Q71 52 76 57" fill="none" ${STROKE}/>`,
    `<circle cx="50.6" cy="54" r="1.5" fill="#fff"/>`,
    `<path d="${S.smile}" fill="none" ${STROKE}/>`,
    `<g transform="rotate(12 60 31)"><path d="${S.hat}" fill="${C.hat}" ${STROKE}/>`,
    `<path d="${S.hatStripes}" stroke="${C.ink}" stroke-width="2" stroke-linecap="round" opacity="0.45"/>`,
    `<circle cx="62" cy="3" r="4.5" fill="#fff" ${STROKE}/></g>`,
  ].join("");
}

function confetti() {
  return [
    `<rect x="14" y="20" width="5" height="9" rx="1.5" fill="${C.hat}" transform="rotate(-25 16 24)"/>`,
    `<rect x="100" y="34" width="5" height="9" rx="1.5" fill="${C.blush}" transform="rotate(30 102 38)"/>`,
    `<circle cx="18" cy="88" r="3" fill="#5cc8ff"/>`,
    `<circle cx="103" cy="84" r="2.6" fill="#ffd447"/>`,
  ].join("");
}

// scale < 1 leaves the safe zone a maskable icon needs.
function iconSvg({ rounded, scale }) {
  const offset = (120 - 120 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
<rect width="120" height="120" rx="${rounded ? 26 : 0}" fill="${BACKGROUND}"/>
<circle cx="60" cy="56" r="44" fill="${GLOW}"/>
<g transform="translate(${offset} ${offset + 3 * scale}) scale(${scale})">${confetti()}${goat()}</g>
</svg>`;
}

const TARGETS = [
  { file: "apple-touch-icon.png", size: 180, rounded: false, scale: 0.9 },
  { file: "icon-192.png", size: 192, rounded: true, scale: 0.9 },
  { file: "icon-512.png", size: 512, rounded: true, scale: 0.9 },
  { file: "icon-512-maskable.png", size: 512, rounded: false, scale: 0.72 },
];

writeFileSync("public/favicon.svg", iconSvg({ rounded: true, scale: 0.92 }));

const browser = await chromium.launch();
try {
  for (const target of TARGETS) {
    const page = await browser.newPage({ viewport: { width: target.size, height: target.size } });
    const svg = iconSvg(target).replace("<svg ", `<svg width="${target.size}" height="${target.size}" `);
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
    await page.screenshot({ path: `public/${target.file}`, omitBackground: target.rounded });
    await page.close();
  }
} catch (error) {
  console.error(`❌ Icon rendering failed — ${error instanceof Error ? error.message : error} — run "npx playwright install chromium" and try again.`);
  process.exitCode = 1;
} finally {
  await browser.close();
}
