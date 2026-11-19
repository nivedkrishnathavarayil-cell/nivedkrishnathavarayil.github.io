import { readFileSync } from 'node:fs';

/* width in pixels of a JPEG or PNG on disk, or 0 if it can't be read */
export function imageSize(path) {
  let b;
  try { b = readFileSync(path); } catch { return 0; }
  if (b[0] === 0x89 && b[1] === 0x50) return b.readUInt32BE(16);
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return b.readUInt16BE(i + 7);
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return 0;
}
