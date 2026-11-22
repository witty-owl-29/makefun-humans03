// make.fun bring-the-humans-03 — safe version (v2) entry program.
//
// The video itself is the entry and the house reads it from TikTok, so
// this program only hands VIDEO.json (the video's TikTok address) to the
// output directory. Run it as:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const repoDir = process.env.MAKEFUN_BOT_DIR ?? '.';
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? 'out';

function loadVideoAddress(): string {
  const raw = readFileSync(join(repoDir, 'VIDEO.json'), 'utf8');
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('VIDEO.json is not a JSON object.');
  }
  const url = (parsed as { url?: unknown }).url;
  if (typeof url !== 'string' || url.length === 0) {
    throw new Error('VIDEO.json has no string url field.');
  }
  return url;
}

const address = loadVideoAddress();
const looksLikeVideo =
  /^https:\/\/(www\.|m\.)?tiktok\.com\/@[^/]+\/video\/\d+$/.test(address);
if (!looksLikeVideo) {
  console.error(
    'WARNING: VIDEO.json does not hold a full TikTok video address yet.'
  );
}
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'VIDEO.json');
copyFileSync(join(repoDir, 'VIDEO.json'), outPath);
console.log(`Handed in video: ${address} (${statSync(outPath).size} bytes)`);
