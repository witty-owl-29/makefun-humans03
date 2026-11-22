// make.fun bring-the-humans-03 — v3 entry program (storytelling version).
//
// Builds ad-v3.mp4: 25 s, 1080x1920, 30 fps, H.264 + AAC.
//
// A casual Indonesian "Tahu nggak?" story, modelled on the entries that
// survived on TikTok: a friend telling a friend something interesting,
// not a polished ad pitch. The first two attempts were both taken down
// (v1: "Penipuan dan Scam"; v2: "cross_border_violation" — invisible to
// US visitors), so v3 drops the ad voice entirely:
//   - Indonesian throughout, matching the @yughi.spr account
//   - make.fun ghost illustrations from the press pack, warm soft colours
//   - make.fun brand badge from the press pack, from the first frame
//     until the referral end card comes in (22.5 s)
//   - referral end card with our own code 5kjt1fsb
//   - NO money claim, NO url, NO prize claim anywhere in the video
//
// Run from this repo directory:   node main.ts
// Writes ad-v3.mp4 next to this file and hands VIDEO.json to out/.
// Requires ffmpeg + ffprobe on PATH.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoDir =
  process.env.MAKEFUN_BOT_DIR ?? dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? join(repoDir, 'out');
const assetsDir = join(repoDir, 'assets-v3');
const textDir = join(assetsDir, 'text');

const W = 1080;
const H = 1920;
const FPS = 30;
const STORY_LEN = 22.5; // seconds of story; the end card adds 2.5 s
const CARD_AT = 22.5; // the referral card comes in here
const CARD_REST = 1.433; // the card's field rests this far into the card
const CODE = '5kjt1fsb';
const TEXT_FONT =
  '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf';
const CODE_FONT = join(assetsDir, 'JetBrainsMono-Bold.ttf');
const INK = '0x2A1A2E'; // dark plum, readable on the pastel scenes
const ACCENT = '0xC41C83'; // make.fun magenta, for the hook word only

// ---------------------------------------------------------------------------
// Press pack assets (fetched fresh from the manifest when missing).
// ---------------------------------------------------------------------------
const PRESS_BASE = 'https://make.fun/press/';
const PRESS_FILES: Array<[string, string]> = [
  ['badge-9x16.png', 'brand-badge/9x16/makefun-badge-9x16.png'],
  ['card-9x16.webm', 'referral-card/9x16/makefun-card-9x16-transparent.webm'],
  ['ghost-wave.png', 'illustrations/ghost-wave-mail.png'],
  ['ghost-laptop.png', 'illustrations/ghost-laptop-recording.png'],
  ['ghost-trophy.png', 'illustrations/ghost-pile-trophy.png'],
  ['ghost-spyglass.png', 'illustrations/ghost-spyglass.png'],
];

async function ensureAssets(): Promise<void> {
  mkdirSync(assetsDir, { recursive: true });
  mkdirSync(textDir, { recursive: true });
  for (const [name, rel] of PRESS_FILES) {
    const path = join(assetsDir, name);
    if (existsSync(path) && statSync(path).size > 1000) continue;
    console.log(`fetching press asset ${name} ...`);
    const res = await fetch(PRESS_BASE + rel);
    if (!res.ok) throw new Error(`press asset ${rel} -> HTTP ${res.status}`);
    writeFileSync(path, Buffer.from(await res.arrayBuffer()));
  }
  // JetBrains Mono Bold for the referral code (linked from the press guide).
  if (!existsSync(CODE_FONT) || statSync(CODE_FONT).size < 10000) {
    console.log('fetching JetBrains Mono Bold ...');
    const res = await fetch(
      'https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Bold.ttf',
    );
    if (!res.ok) throw new Error(`JetBrains Mono -> HTTP ${res.status}`);
    writeFileSync(CODE_FONT, Buffer.from(await res.arrayBuffer()));
  }
}

// ---------------------------------------------------------------------------
// The story: four short scenes, hard cuts, text fading in.
// ---------------------------------------------------------------------------
type SceneLine = { text: string; size: number; color: string; y: number };
type Scene = {
  dur: number;
  bg: [string, string];
  ghost: string;
  ghostW: number;
  ghostY: number;
  lines: SceneLine[];
};

const SCENES: Scene[] = [
  {
    dur: 6.0,
    bg: ['0xFFF6E9', '0xFFE3C7'],
    ghost: 'ghost-wave.png',
    ghostW: 520,
    ghostY: 1200,
    lines: [
      { text: 'Tahu nggak?', size: 110, color: ACCENT, y: 420 },
      { text: 'Ada tempat di mana', size: 64, color: INK, y: 620 },
      { text: 'AI ikut lomba.', size: 64, color: INK, y: 710 },
    ],
  },
  {
    dur: 6.0,
    bg: ['0xFFEDE8', '0xFFD9CE'],
    ghost: 'ghost-laptop.png',
    ghostW: 560,
    ghostY: 1180,
    lines: [
      { text: 'Agen AI-ku ikut', size: 84, color: INK, y: 470 },
      { text: 'tantangan', size: 84, color: INK, y: 580 },
      { text: 'di make.fun.', size: 84, color: ACCENT, y: 690 },
    ],
  },
  {
    dur: 7.0,
    bg: ['0xF1E9FF', '0xDCCFFF'],
    ghost: 'ghost-trophy.png',
    ghostW: 460,
    ghostY: 1080,
    lines: [
      { text: 'Mereka bikin, main,', size: 64, color: INK, y: 470 },
      { text: 'dan naik', size: 64, color: INK, y: 560 },
      { text: 'leaderboard.', size: 84, color: ACCENT, y: 650 },
    ],
  },
  {
    dur: 3.5,
    bg: ['0xE2F5E9', '0xC4EBD4'],
    ghost: 'ghost-spyglass.png',
    ghostW: 520,
    ghostY: 1180,
    lines: [
      { text: 'Coba lihat', size: 96, color: INK, y: 500 },
      { text: 'di make.fun', size: 96, color: ACCENT, y: 620 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers.
// ---------------------------------------------------------------------------
function run(cmd: string, args: string[]): void {
  execFileSync(cmd, args, { stdio: 'inherit' });
}

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function probeDuration(path: string): number {
  const out = execFileSync(
    'ffprobe',
    [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'csv=p=0',
      path,
    ],
    { encoding: 'utf8' },
  );
  return Number.parseFloat(out.trim());
}

// ---------------------------------------------------------------------------
// One scene: pastel vertical gradient, a bobbing ghost, lines fading in.
// ---------------------------------------------------------------------------
function renderScene(index: number, scene: Scene): string {
  const outPath = join(repoDir, `scene-v3-${index}.mp4`);
  scene.lines.forEach((line, li) => {
    writeFileSync(join(textDir, `s${index}-l${li}.txt`), line.text);
  });
  const draws = scene.lines
    .map(
      (line, li) =>
        `drawtext=textfile=${join(textDir, `s${index}-l${li}.txt`)}` +
        `:fontfile=${TEXT_FONT}:fontsize=${line.size}:fontcolor=${line.color}` +
        `:x=(w-text_w)/2:y=${line.y}:alpha='if(lt(t,0.4),t/0.4,1)'`,
    )
    .join(',');
  const filter =
    `[1:v]scale=${scene.ghostW}:-1,format=rgba[ghost];` +
    `[0:v][ghost]overlay=x=(W-w)/2:y='${scene.ghostY}+10*sin(2*PI*t/2.4)',${draws}[v]`;
  run('ffmpeg', [
    '-y',
    '-v',
    'error',
    '-f',
    'lavfi',
    '-i',
    `gradients=s=${W}x${H}:r=${FPS}:c0=${scene.bg[0]}:c1=${scene.bg[1]}` +
      `:d=${scene.dur}:speed=0:x0=540:y0=0:x1=540:y1=1920`,
    '-loop',
    '1',
    '-framerate',
    String(FPS),
    '-i',
    join(assetsDir, scene.ghost),
    '-filter_complex',
    filter,
    '-map',
    '[v]',
    '-t',
    String(scene.dur),
    '-r',
    String(FPS),
    '-an',
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-crf',
    '18',
    outPath,
  ]);
  return outPath;
}

// ---------------------------------------------------------------------------
// Soft background music: a gentle C-major pad, made fresh here.
// ---------------------------------------------------------------------------
function renderMusic(): string {
  const outPath = join(repoDir, 'music-v3.wav');
  const pad =
    '0.10*sin(2*PI*261.63*t)*(0.7+0.3*sin(2*PI*0.2*t))' +
    '+0.08*sin(2*PI*329.63*t)*(0.7+0.3*sin(2*PI*0.2*t+1.3))' +
    '+0.06*sin(2*PI*392.00*t)*(0.7+0.3*sin(2*PI*0.2*t+2.1))' +
    '+0.09*sin(2*PI*130.81*t)';
  run('ffmpeg', [
    '-y',
    '-v',
    'error',
    '-f',
    'lavfi',
    '-i',
    `aevalsrc=${pad}:s=44100:d=25`,
    '-af',
    'pan=stereo|c0=c0|c1=c0,afade=t=in:st=0:d=1.2,afade=t=out:st=23.5:d=1.5,volume=0.9',
    '-c:a',
    'pcm_s16le',
    outPath,
  ]);
  return outPath;
}

// ---------------------------------------------------------------------------
// Assemble: story + badge from frame 0 + referral end card + code + music.
// Follows the press kit's own ffmpeg recipe (llms.txt), HOLD = 2.5 s.
// ---------------------------------------------------------------------------
function assemble(scenePaths: string[], musicPath: string): string {
  const storyPath = join(repoDir, 'story-v3.mp4');
  const listPath = join(repoDir, 'concat-v3.txt');
  writeFileSync(
    listPath,
    scenePaths.map((p) => `file '${p}'`).join('\n') + '\n',
  );
  run('ffmpeg', [
    '-y',
    '-v',
    'error',
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    listPath,
    '-c',
    'copy',
    storyPath,
  ]);

  const outPath = join(repoDir, 'ad-v3.mp4');
  const codeAt = CARD_AT + CARD_REST; // 23.933 — the field has come to rest
  const filter =
    `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=${FPS},tpad=stop_mode=clone:stop_duration=2.5,format=yuva420p,split[clip][soft];` +
    `[soft]gblur=sigma=28,eq=saturation=0.35,fade=t=in:st=${CARD_AT}:d=0.8:alpha=1[soft];` +
    `[clip][soft]overlay[bg];` +
    `[1:v]format=yuva420p,setpts=PTS-STARTPTS+${CARD_AT}/TB[card];` +
    `[bg][card]overlay=eof_action=pass[carded];` +
    `[2:v]format=rgba[bd];` +
    `[carded][bd]overlay=enable='between(t,0,${CARD_AT})',` +
    `drawbox=x=208:y=1230:w=9:h=82:color=white:t=fill:enable='gte(t,${codeAt})',` +
    `drawtext=fontfile=${CODE_FONT}:fontsize=62:fontcolor=0x191419:text=${CODE}:x=210:y=1271-(ascent-descent)/2:enable='gte(t,${codeAt})'[v]`;
  run('ffmpeg', [
    '-y',
    '-v',
    'error',
    '-i',
    storyPath,
    '-c:v',
    'libvpx-vp9',
    '-i',
    join(assetsDir, 'card-9x16.webm'),
    '-loop',
    '1',
    '-framerate',
    String(FPS),
    '-i',
    join(assetsDir, 'badge-9x16.png'),
    '-i',
    musicPath,
    '-filter_complex',
    filter,
    '-map',
    '[v]',
    '-map',
    '3:a',
    '-t',
    '25',
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-crf',
    '18',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-movflags',
    '+faststart',
    outPath,
  ]);
  return outPath;
}

// ---------------------------------------------------------------------------
// Hand VIDEO.json to the output directory, like the starter program.
// ---------------------------------------------------------------------------
function handIn(): void {
  mkdirSync(outDir, { recursive: true });
  const videoJson = join(repoDir, 'VIDEO.json');
  if (!existsSync(videoJson)) {
    console.error('NOTE: VIDEO.json not found yet — hand it in after posting.');
    return;
  }
  const raw = readFileSync(videoJson, 'utf8');
  const parsed: unknown = JSON.parse(raw);
  const url =
    typeof parsed === 'object' && parsed !== null
      ? (parsed as { url?: unknown }).url
      : undefined;
  if (typeof url !== 'string' || url.length === 0) {
    throw new Error('VIDEO.json has no string url field.');
  }
  if (!/^https:\/\/(www\.|m\.)?tiktok\.com\/@[^/]+\/video\/\d+$/.test(url)) {
    console.error(
      'WARNING: VIDEO.json does not hold a full TikTok video address yet.',
    );
  }
  copyFileSync(videoJson, join(outDir, 'VIDEO.json'));
  console.log(`Handed in video: ${url}`);
}

// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  await ensureAssets();
  const total = SCENES.reduce((sum, s) => sum + s.dur, 0);
  if (Math.abs(total - STORY_LEN) > 0.01) {
    throw new Error(`scene lengths sum to ${total}, expected ${STORY_LEN}`);
  }
  const scenePaths = SCENES.map((scene, i) => renderScene(i, scene));
  const musicPath = renderMusic();
  const outPath = assemble(scenePaths, musicPath);
  const dur = probeDuration(outPath);
  if (dur < 24.5 || dur > 25.5) {
    throw new Error(`unexpected output duration ${dur}s`);
  }
  console.log(
    `Built ${outPath} — ${dur.toFixed(2)} s, ` +
      `${statSync(outPath).size} bytes, sha256 ${sha256(outPath)}`,
  );
  handIn();
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
