/**
 * LOVE MEEE – Local Video Download Server  v3
 * =============================================
 * Fixes:
 *  - Audio: forces single-stream progressive format (no ffmpeg needed)
 *  - Cookies: tries Edge → Chrome → Firefox → no-cookies fallback
 *  - Priority queue: priority items go to the front
 *  - Clean filenames always end in .mp4
 */

import express from 'express';
import cors from 'cors';
import { exec, execSync } from 'child_process';
import {
  existsSync, mkdirSync, readdirSync, statSync,
  unlinkSync, readFileSync, writeFileSync, renameSync,
} from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const app = express();
const PORT = 3001;
app.use(cors());
app.use(express.json());

// ── Paths ──────────────────────────────────────────────────────────────────
const VIDEOS_DIR    = join(__dirname, 'public', 'videos');
const REGISTRY_FILE = join(VIDEOS_DIR, 'registry.json');
if (!existsSync(VIDEOS_DIR)) mkdirSync(VIDEOS_DIR, { recursive: true });

// ── Registry ───────────────────────────────────────────────────────────────
function loadRegistry() {
  try { return JSON.parse(readFileSync(REGISTRY_FILE, 'utf8')); }
  catch { return {}; }
}
function saveRegistry(reg) {
  writeFileSync(REGISTRY_FILE, JSON.stringify(reg, null, 2), 'utf8');
}

// ── Resolve yt-dlp ────────────────────────────────────────────────────────
const YT_DLP_CANDIDATES = [
  'yt-dlp',
  `${process.env.LOCALAPPDATA}\\Python\\pythoncore-3.14-64\\Scripts\\yt-dlp.exe`,
  `${process.env.LOCALAPPDATA}\\Programs\\Python\\Python313\\Scripts\\yt-dlp.exe`,
  `${process.env.LOCALAPPDATA}\\Programs\\Python\\Python312\\Scripts\\yt-dlp.exe`,
  `${process.env.LOCALAPPDATA}\\Programs\\Python\\Python311\\Scripts\\yt-dlp.exe`,
  'C:\\Python312\\Scripts\\yt-dlp.exe',
  'C:\\Python311\\Scripts\\yt-dlp.exe',
];
function findYtDlp() {
  for (const p of YT_DLP_CANDIDATES) {
    try { execSync(`"${p}" --version`, { stdio: 'pipe' }); return p; }
    catch {}
  }
  return null;
}
const YT_DLP = findYtDlp();

// ── Find a working cookie browser ─────────────────────────────────────────
// Try browsers in order; return the first one whose cookie DB exists
function findCookieBrowser() {
  const browsers = [
    { name: 'edge',    path: `${process.env.LOCALAPPDATA}\\Microsoft\\Edge\\User Data\\Default\\Cookies` },
    { name: 'chrome',  path: `${process.env.LOCALAPPDATA}\\Google\\Chrome\\User Data\\Default\\Cookies` },
    { name: 'firefox', path: `${process.env.APPDATA}\\Mozilla\\Firefox\\Profiles` },
    { name: 'brave',   path: `${process.env.LOCALAPPDATA}\\BraveSoftware\\Brave-Browser\\User Data\\Default\\Cookies` },
  ];
  for (const b of browsers) {
    if (existsSync(b.path)) return b.name;
  }
  return null; // no browser cookies found — try without
}
const COOKIE_BROWSER = findCookieBrowser();

// ── Slug helper ───────────────────────────────────────────────────────────
function makeSlug(title) {
  return (title || 'reel')
    .replace(/[^a-z0-9]/gi, '_').toLowerCase()
    .replace(/__+/g, '_').replace(/^_|_$/g, '')
    .slice(0, 36) + '_' + Date.now();
}

// ── Core downloader ────────────────────────────────────────────────────────
//
// FORMAT STRATEGY (no ffmpeg required):
//   1. best[ext=mp4][vcodec!=none][acodec!=none]  ← single-stream MP4 with audio+video
//   2. best[vcodec!=none][acodec!=none]            ← any single-stream with audio+video
//   3. best[ext=mp4]                               ← any mp4 fallback
//   4. best                                        ← last resort
//
function downloadVideo(url, title) {
  return new Promise((resolve, reject) => {
    if (!YT_DLP) return reject(new Error('yt-dlp not found'));

    const slug = makeSlug(title);
    const outTemplate = join(VIDEOS_DIR, `${slug}.%(ext)s`);

    const cookieFlag = COOKIE_BROWSER
      ? `--cookies-from-browser ${COOKIE_BROWSER}`
      : '--no-cookies'; // no cookie file at all (works for public reels)

    const formatSelector = [
      'best[ext=mp4][vcodec!=none][acodec!=none]',
      'best[vcodec!=none][acodec!=none]',
      'best[ext=mp4]',
      'best',
    ].join('/');

    const cmd = [
      `"${YT_DLP}"`,
      `"${url}"`,
      `-f "${formatSelector}"`,
      cookieFlag,
      `--no-playlist`,
      `--no-warnings`,
      `--no-progress`,
      `-o "${outTemplate}"`,
    ].join(' ');

    console.log(`[↓] ${title || url}  [cookies: ${COOKIE_BROWSER || 'none'}]`);

    exec(cmd, { timeout: 180_000 }, (err, stdout, stderr) => {
      // Find written file
      let files = [];
      try {
        files = readdirSync(VIDEOS_DIR).filter(f =>
          f.startsWith(slug.slice(0, -14)) && // prefix without timestamp
          /\.(mp4|webm|mkv|mov|m4v)$/i.test(f)
        );
        if (!files.length) {
          // broader search using last part of slug
          const ts = slug.split('_').pop();
          files = readdirSync(VIDEOS_DIR).filter(f => f.includes(ts));
        }
      } catch {}

      if (err && !files.length) {
        const msg = (stderr || err.message).split('\n')[0];
        console.error(`[✗] ${title}: ${msg}`);
        return reject(new Error(msg));
      }
      if (!files.length) return reject(new Error('No output file found after download'));

      // Rename to clean slug.mp4
      const rawFile = files[0];
      const cleanName = slug + '.mp4';
      const cleanPath = join(VIDEOS_DIR, cleanName);
      try {
        if (rawFile !== cleanName) renameSync(join(VIDEOS_DIR, rawFile), cleanPath);
        console.log(`[✓] Saved: ${cleanName}`);
        resolve(cleanName);
      } catch {
        console.log(`[✓] Saved (raw): ${rawFile}`);
        resolve(rawFile);
      }
    });
  });
}

// ── Priority download queue ────────────────────────────────────────────────
const downloadQueue = [];
let isProcessingQueue = false;
const failedAttempts = new Map(); // url -> failure count (max 3)

function enqueue(items) {
  for (const item of items) {
    const { url, title, priority } = item;
    // Skip if permanently failed
    if ((failedAttempts.get(url) || 0) >= 3) continue;
    // Skip if already in the queue
    if (downloadQueue.some(q => q.url === url)) continue;
    // Skip if already in the registry and file exists
    const reg = loadRegistry();
    if (reg[url]?.filename && existsSync(join(VIDEOS_DIR, reg[url].filename))) continue;

    if (priority) downloadQueue.unshift({ url, title, priority });
    else downloadQueue.push({ url, title });
  }
}


async function processQueue() {
  if (isProcessingQueue || !downloadQueue.length) return;
  isProcessingQueue = true;

  while (downloadQueue.length) {
    const item = downloadQueue.shift();
    const { url, title } = item;

    // Skip permanently-failed URLs
    if ((failedAttempts.get(url) || 0) >= 3) {
      console.log(`[skip] Max retries reached: ${title || url}`);
      continue;
    }

    const reg = loadRegistry();
    if (reg[url]?.filename && existsSync(join(VIDEOS_DIR, reg[url].filename))) {
      console.log(`[=] Already local: ${title}`);
      continue;
    }

    try {
      const filename = await downloadVideo(url, title);
      const updated = loadRegistry();
      updated[url] = {
        filename,
        localUrl: `/videos/${filename}`,
        title,
        originalUrl: url,
        downloadedAt: new Date().toISOString(),
      };
      saveRegistry(updated);
      // Reset failure count on success
      failedAttempts.delete(url);
    } catch (e) {
      const attempts = (failedAttempts.get(url) || 0) + 1;
      failedAttempts.set(url, attempts);
      console.error(`[queue error ${attempts}/3] ${url}:`, e.message.split('\n')[0]);
    }

    await new Promise(r => setTimeout(r, 1500));
  }

  isProcessingQueue = false;
}

// ── Routes ─────────────────────────────────────────────────────────────────

app.get('/status', (req, res) => {
  res.json({
    ok: true,
    ytDlp: !!YT_DLP,
    ytDlpPath: YT_DLP || null,
    cookieBrowser: COOKIE_BROWSER || 'none',
    queueLength: downloadQueue.length,
    isDownloading: isProcessingQueue,
  });
});

app.get('/registry', (req, res) => res.json(loadRegistry()));

app.get('/videos', (req, res) => {
  try {
    const files = readdirSync(VIDEOS_DIR)
      .filter(f => /\.(mp4|webm|mkv|mov|m4v)$/i.test(f))
      .map(f => ({ filename: f, url: `/videos/${f}`, size: statSync(join(VIDEOS_DIR, f)).size }));
    res.json({ videos: files });
  } catch { res.json({ videos: [] }); }
});

// Sync: called on app start with all saved reels
// Body: { reels: [{url, title, priority?}] }
app.post('/sync-reels', (req, res) => {
  const { reels = [] } = req.body;
  if (!reels.length) return res.json({ queued: 0, alreadyLocal: 0 });

  const registry = loadRegistry();
  const toDownload = [];
  let alreadyLocal = 0;

  for (const reel of reels) {
    const { url, title, priority } = reel;
    if (!url) continue;
    const existing = registry[url];
    if (existing?.filename && existsSync(join(VIDEOS_DIR, existing.filename))) {
      alreadyLocal++;
      continue;
    }
    toDownload.push({ url, title, priority: !!priority });
  }

  if (toDownload.length) {
    enqueue(toDownload);
    processQueue();
  }

  res.json({ queued: toDownload.length, alreadyLocal, queueLength: downloadQueue.length });
});

// On-demand single download
app.post('/download', async (req, res) => {
  const { url, title, priority } = req.body;
  if (!url) return res.status(400).json({ error: 'url is required' });
  if (!YT_DLP) return res.status(503).json({ error: 'yt-dlp not installed' });

  // Check registry first
  const reg = loadRegistry();
  if (reg[url]?.filename && existsSync(join(VIDEOS_DIR, reg[url].filename))) {
    return res.json({ ok: true, cached: true, ...reg[url] });
  }

  try {
    const filename = await downloadVideo(url, title);
    const updated = loadRegistry();
    updated[url] = { filename, localUrl: `/videos/${filename}`, title, originalUrl: url, downloadedAt: new Date().toISOString() };
    saveRegistry(updated);
    res.json({ ok: true, filename, url: `/videos/${filename}`, size: statSync(join(VIDEOS_DIR, filename)).size });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/videos/:filename', (req, res) => {
  const safeName = basename(req.params.filename);
  const filePath = join(VIDEOS_DIR, safeName);
  if (!existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  try {
    unlinkSync(filePath);
    const reg = loadRegistry();
    for (const [url, entry] of Object.entries(reg)) {
      if (entry.filename === safeName) delete reg[url];
    }
    saveRegistry(reg);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Start (bind 0.0.0.0 so phone on same WiFi can reach it) ───────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎬  LOVE MEEE Download Server — http://localhost:${PORT}`);
  console.log(`    yt-dlp  : ${YT_DLP ? `✓ ${YT_DLP}` : '✗ NOT FOUND — pip install yt-dlp'}`);
  console.log(`    cookies : ${COOKIE_BROWSER ? `✓ ${COOKIE_BROWSER}` : '⚠ no browser found — public reels only'}`);
  console.log(`    videos  : ${VIDEOS_DIR}\n`);
});
