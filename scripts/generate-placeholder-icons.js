#! /usr/bin/env bun
/**
 * @license SPDX-License-Identifier: MIT
 * @author Andrew Velez 2026
 * @desc Generates flat-color placeholder PNG icons for the Link-Up PWA
 *       manifest and service worker precache list. Re-run after real
 *       branded icons are designed, to replace these placeholders.
 */

import { deflateSync, crc32 } from "node:zlib";

const FILL = [0x10, 0x20, 0x1c]; // #10201C, matches manifest theme_color
const OUT_DIR = new URL("../web/icons/", import.meta.url);

const ICONS = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "icon-maskable-512.png", size: 512 },
  { name: "favicon-64.png", size: 64 },
];

function chunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])) >>> 0, 0);
  return Buffer.concat([length, typeBytes, data, crc]);
}

function flatColorPng(size, [r, g, b]) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type: truecolor RGB
  ihdrData[10] = 0; // compression method
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // interlace method

  const row = Buffer.alloc(1 + size * 3); // leading byte per row: filter type 0 (none)
  for (let x = 0; x < size; x++) {
    row[1 + x * 3] = r;
    row[1 + x * 3 + 1] = g;
    row[1 + x * 3 + 2] = b;
  }
  const raw = Buffer.concat(Array.from({ length: size }, () => row));
  const idatData = deflateSync(raw);

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdrData),
    chunk("IDAT", idatData),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

for (const { name, size } of ICONS) {
  const png = flatColorPng(size, FILL);
  await Bun.write(new URL(name, OUT_DIR), png);
  console.log(`wrote ${name} (${size}x${size}, ${png.length} bytes)`);
}
