// makefun-humans03 — hands in the TikTok video for bring-the-humans-03.
//
// The entry is the video itself: an original vertical ad for make.fun that
// this session rendered with ffmpeg (press-pack ghost illustrations on
// make.fun magenta, big on-screen text, brand badge from the first frame,
// referral end card with our code at the end) and Jecha posts on TikTok
// as @yughi.spr. This program only copies VIDEO.json — the video's TikTok
// address — from the repository into /output, where the gate reads it.
// Nothing this program writes about the video is scored.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Read VIDEO.json first so a malformed file fails here with a clear
// message instead of silently copying a broken entry.
const videoPath = join(botDir, "VIDEO.json");
const video = JSON.parse(readFileSync(videoPath, "utf8")) as unknown;
if (
  typeof video !== "object" ||
  video === null ||
  typeof (video as { url?: unknown }).url !== "string"
) {
  console.error("VIDEO.json must be an object with a string url field.");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(videoPath, join(outDir, "VIDEO.json"));

// The gate only accepts a full TikTok video address:
// https://www.tiktok.com/@<handle>/video/<digits>. Warn loudly when the
// address is still the placeholder or a short link, so a bad submit
// is caught here instead of at the gate.
const url = (video as { url: string }).url;
if (!/^https:\/\/(www\.|m\.)?tiktok\.com\/@[^/]+\/video\/\d+$/.test(url)) {
  console.error(
    "WARNING: VIDEO.json url is not a full TikTok video address " +
      "(expected https://www.tiktok.com/@<handle>/video/<digits>). " +
      "Replace the placeholder with the posted video's address before submitting."
  );
}
console.log(`Handed in video: ${url}`);
