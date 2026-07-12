import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const OUT = path.resolve("public/icons");
if (!existsSync(OUT)) await mkdir(OUT, { recursive: true });

const rounded = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#28a668"/>
      <stop offset="100%" stop-color="#166b45"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="url(#bg)"/>
  <text x="${size / 2}" y="${size * 0.66}" text-anchor="middle"
    font-family="ui-sans-serif, Inter, system-ui, -apple-system, Segoe UI, Arial, sans-serif"
    font-weight="800" font-size="${Math.round(size * 0.46)}"
    fill="#ffffff" letter-spacing="${-size * 0.015}">Rp</text>
</svg>`;

const maskable = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#28a668"/>
      <stop offset="100%" stop-color="#166b45"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  <text x="${size / 2}" y="${size * 0.62}" text-anchor="middle"
    font-family="ui-sans-serif, Inter, system-ui, -apple-system, Segoe UI, Arial, sans-serif"
    font-weight="800" font-size="${Math.round(size * 0.32)}"
    fill="#ffffff" letter-spacing="${-size * 0.01}">Rp</text>
</svg>`;

async function toPng(svg, size, filename) {
  const buf = Buffer.from(svg);
  const out = await sharp(buf, { density: 384 }).resize(size, size).png().toBuffer();
  await writeFile(path.join(OUT, filename), out);
  console.log("wrote", filename);
}

await toPng(rounded(192), 192, "icon-192.png");
await toPng(rounded(512), 512, "icon-512.png");
await toPng(rounded(180), 180, "apple-touch-icon.png");
await toPng(rounded(120), 120, "apple-touch-icon-120.png");
await toPng(rounded(152), 152, "apple-touch-icon-152.png");
await toPng(rounded(167), 167, "apple-touch-icon-167.png");
await toPng(maskable(512), 512, "maskable-512.png");
await toPng(rounded(32), 32, "favicon-32.png");
await toPng(rounded(16), 16, "favicon-16.png");

// Simple mobile screenshot placeholder for manifest
const screenshot = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 1080">
  <rect width="540" height="1080" fill="#f8fafc"/>
  <rect x="20" y="60" width="500" height="72" rx="16" fill="#ffffff" stroke="#e2e8f0"/>
  <text x="40" y="105" font-family="Inter, sans-serif" font-size="24" font-weight="700" fill="#0f172a">SiMamang</text>
  <rect x="20" y="150" width="500" height="120" rx="16" fill="#28a668"/>
  <text x="40" y="200" font-family="Inter, sans-serif" font-size="16" fill="#dcfce7">Kekayaan Bersih</text>
  <text x="40" y="240" font-family="Inter, sans-serif" font-size="32" font-weight="800" fill="#ffffff">Rp 35.926.000</text>
  <rect x="20" y="290" width="240" height="100" rx="16" fill="#ffffff" stroke="#e2e8f0"/>
  <rect x="280" y="290" width="240" height="100" rx="16" fill="#ffffff" stroke="#e2e8f0"/>
  <text x="40" y="330" font-family="Inter, sans-serif" font-size="14" fill="#64748b">Pemasukan</text>
  <text x="40" y="365" font-family="Inter, sans-serif" font-size="22" font-weight="700" fill="#16a34a">Rp 14.850.000</text>
  <text x="300" y="330" font-family="Inter, sans-serif" font-size="14" fill="#64748b">Pengeluaran</text>
  <text x="300" y="365" font-family="Inter, sans-serif" font-size="22" font-weight="700" fill="#ef4444">Rp 5.754.000</text>
</svg>`;
await writeFile(path.join(OUT, "screenshot-mobile.svg"), screenshot);
console.log("done");
