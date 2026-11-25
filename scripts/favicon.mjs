// Generates public/favicon.ico from public/favicon.svg.
// Usage: node scripts/favicon.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";

const SIZES = [16, 32, 48];

const svg = readFileSync("public/favicon.svg");

const pngs = SIZES.map((size) =>
  new Resvg(svg, { fitTo: { mode: "width", value: size } }).render().asPng(),
);

// ICO layout: 6-byte header, a 16-byte directory entry per image, then the
// PNG data. Modern ICO readers accept embedded PNGs as-is.
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(pngs.length, 4);

let offset = header.length + 16 * pngs.length;

const entries = pngs.map((png, i) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(SIZES[i] % 256, 0); // width (0 means 256)
  entry.writeUInt8(SIZES[i] % 256, 1); // height
  entry.writeUInt8(0, 2); // palette colours
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += png.length;
  return entry;
});

writeFileSync("public/favicon.ico", Buffer.concat([header, ...entries, ...pngs]));

console.log(`Wrote public/favicon.ico (${SIZES.join(", ")}px)`);
