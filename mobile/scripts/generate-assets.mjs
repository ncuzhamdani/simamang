import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const OUT = path.resolve("assets");
if (!existsSync(OUT)) await mkdir(OUT, { recursive: true });

const icon = (size, radius = 0.22) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#28a668"/>
      <stop offset="100%" stop-color="#166b45"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * radius)}" fill="url(#bg)"/>
  <text x="${size / 2}" y="${size * 0.66}" text-anchor="middle"
    font-family="ui-sans-serif, Inter, system-ui, -apple-system, Segoe UI, Arial, sans-serif"
    font-weight="800" font-size="${Math.round(size * 0.46)}"
    fill="#ffffff" letter-spacing="${-size * 0.015}">Rp</text>
</svg>`;

const adaptive = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="transparent"/>
  <text x="${size / 2}" y="${size * 0.6}" text-anchor="middle"
    font-family="ui-sans-serif, Inter, system-ui, -apple-system, Segoe UI, Arial, sans-serif"
    font-weight="800" font-size="${Math.round(size * 0.32)}"
    fill="#ffffff" letter-spacing="${-size * 0.01}">Rp</text>
</svg>`;

const splash = (w, h) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="#28a668"/>
  <g transform="translate(${w / 2 - 120}, ${h / 2 - 120})">
    <rect width="240" height="240" rx="52" fill="#ffffff" fill-opacity="0.14"/>
    <text x="120" y="164" text-anchor="middle"
      font-family="ui-sans-serif, Inter, system-ui, -apple-system, Segoe UI, Arial, sans-serif"
      font-weight="800" font-size="112" fill="#ffffff" letter-spacing="-3">Rp</text>
  </g>
</svg>`;

async function toPng(svg, w, h, filename) {
  const buf = Buffer.from(svg);
  const out = await sharp(buf, { density: 384 }).resize(w, h).png().toBuffer();
  await writeFile(path.join(OUT, filename), out);
  console.log("wrote", filename);
}

await toPng(icon(1024), 1024, 1024, "icon.png");
await toPng(icon(1024, 0), 1024, 1024, "adaptive-icon.png");
await toPng(adaptive(1024), 1024, 1024, "notification-icon.png");
await toPng(splash(1284, 2778), 1284, 2778, "splash.png");
await toPng(icon(32, 0.22), 32, 32, "favicon.png");
console.log("done");
