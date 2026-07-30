import { useState, useEffect } from 'react';
import { Play, Heart, Plus, Film, Trash2, X, Loader, CheckCircle, HardDrive, Instagram, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDailyQuote } from '@/lib/quotes';
import { useApp } from '@/lib/AppContext';
import { DEFAULT_REELS } from '@/lib/defaultReels';

const REEL_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
];

const DOWNLOAD_SERVER = 'http://localhost:3001';

// ── Inline video overlay plays on the card itself ─────────────────────────
function VideoOverlay({ src, title, originalUrl, author, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 z-30 bg-black flex flex-col rounded-3xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2 }}
      >
        <video
          src={src}
          className="flex-1 w-full object-contain bg-black"
          autoPlay
          playsInline
          controls
          style={{ maxHeight: 'calc(100% - 48px)' }}
        />

        {/* Attribution bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950 border-t border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] text-white/40 font-medium flex-shrink-0">Credit:</span>
            <a
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 truncate max-w-[160px] transition-colors"
            >
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
              {author || 'Instagram'}
              <span className="text-white/30 ml-1 truncate">· {title}</span>
            </a>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all active:scale-90 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === 'local') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
        <CheckCircle className="h-3 w-3" /> Saved
      </span>
    );
  }
  if (status === 'downloading') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/40 px-2 py-0.5 text-[10px] font-bold text-fuchsia-400">
        <Loader className="h-3 w-3 animate-spin" /> Downloading…
      </span>
    );
  }
  if (status === 'queued') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-400">
        ⏳ Queued
      </span>
    );
  }
  return null;
}

export default function MotivationalReel() {
  const { reels, addReel, deleteReel, reelRegistry, refreshRegistry } = useApp();
  const [liked, setLiked] = useState(false);
  const [activeReel, setActiveReel] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showManagePool, setShowManagePool] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [serverStatus, setServerStatus] = useState(null);

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const img = REEL_IMAGES[dayOfYear % REEL_IMAGES.length];
  const quote = getDailyQuote();

  // Pick active reel: priority (first) reel shown on home if locally saved; else random
  useEffect(() => {
    if (!reels?.length) return;

    // Prefer the priority reel if it's already downloaded
    const priorityReel = reels.find(r => r.priority || r.url === DEFAULT_REELS[0]?.url);
    const priorityEntry = priorityReel ? reelRegistry?.[priorityReel.url] : null;

    if (priorityReel && priorityEntry?.filename) {
      setActiveReel(priorityReel);
    } else {
      // Fall back to a random locally-saved reel, or any reel
      const localReels = reels.filter(r => reelRegistry?.[r.url]?.filename);
      if (localReels.length) {
        setActiveReel(localReels[Math.floor(Math.random() * localReels.length)]);
      } else {
        setActiveReel(reels[0]);
      }
    }
  }, [reels, reelRegistry]);

  // Poll server status every 5s to update badges
  useEffect(() => {
    async function checkServer() {
      try {
        const res = await fetch(`${DOWNLOAD_SERVER}/status`, { signal: AbortSignal.timeout(2000) });
        if (res.ok) setServerStatus(await res.json());
      } catch { setServerStatus(null); }
    }
    checkServer();
    const id = setInterval(checkServer, 5000);
    return () => clearInterval(id);
  }, []);

  function getReelStatus(url) {
    if (reelRegistry?.[url]?.filename) return 'local';
    if (serverStatus?.isDownloading) return 'downloading';
    if (serverStatus?.queueLength > 0) return 'queued';
    return 'pending';
  }

  const activeEntry  = activeReel ? reelRegistry?.[activeReel.url] : null;
  const activeStatus = activeReel ? getReelStatus(activeReel.url) : 'pending';
  // Serve video from Vite's public/ folder
  const videoSrc = activeEntry?.filename
    ? `http://localhost:5173/videos/${activeEntry.filename}`
    : null;

  // Enrich reel with author/originalUrl info from DEFAULT_REELS if not stored
  function enrichReel(reel) {
    const def = DEFAULT_REELS.find(d => d.url === reel.url);
    return {
      ...reel,
      author: reel.author || def?.author || 'Instagram',
      originalUrl: reel.url,
    };
  }

  const handlePlayClick = () => {
    if (videoSrc) {
      setIsPlaying(true);
    } else {
      setShowManagePool(true);
    }
  };

  const handleAddCustomReel = async (e) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    await addReel(newUrl, newTitle || 'Custom Reel');
    setNewUrl('');
    setNewTitle('');
    setTimeout(refreshRegistry, 3000);
  };

  const enrichedActive = activeReel ? enrichReel(activeReel) : null;

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl aspect-[4/5] shadow-xl shadow-black/10">
        <img src={img} alt="Daily motivation" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

        {/* Inline video overlay — plays directly on the card */}
        {isPlaying && videoSrc && enrichedActive && (
          <VideoOverlay
            src={videoSrc}
            title={enrichedActive.title}
            originalUrl={enrichedActive.originalUrl}
            author={enrichedActive.author}
            onClose={() => setIsPlaying(false)}
          />
        )}

        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white flex items-center gap-1.5">
            <Film className="h-3.5 w-3.5" /> DAILY REEL
          </span>
          <div className="flex items-center gap-2">
            {activeStatus && activeStatus !== 'pending' && <StatusBadge status={activeStatus} />}
            <button
              onClick={() => setShowManagePool(true)}
              className="rounded-full bg-white/20 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-white/30 transition-all flex items-center gap-1"
            >
              <HardDrive className="h-3 w-3" /> {reels.length}
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-transform active:scale-90"
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
            </button>
          </div>
        </div>

        {/* Center play button */}
        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <motion.button
              onClick={handlePlayClick}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              className="flex h-16 w-16 items-center justify-center rounded-full backdrop-blur-md shadow-lg transition-all"
              style={{
                background: videoSrc
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'rgba(255,255,255,0.25)',
                boxShadow: videoSrc ? '0 0 40px rgba(16,185,129,0.6)' : undefined,
              }}
            >
              {activeStatus === 'downloading'
                ? <Loader className="h-7 w-7 text-white animate-spin" />
                : <Play className="h-7 w-7 fill-white text-white ml-1" />
              }
            </motion.button>
            <span className="mt-3 text-xs font-bold text-white/90 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
              {videoSrc
                ? `▶ ${activeReel?.title || 'Play reel'}`
                : activeStatus === 'downloading' ? 'Downloading…'
                : activeStatus === 'queued' ? 'In queue…'
                : 'Open pool to add reels'
              }
            </span>

            {/* Attribution link below play button when reel is known */}
            {activeReel && (
              <a
                href={activeReel.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="mt-2 flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 transition-colors"
              >
                <ExternalLink className="h-2.5 w-2.5" /> View original on Instagram
              </a>
            )}
          </div>
        )}

        {/* Bottom quote */}
        {!isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
            <p className="font-heading text-lg font-bold leading-snug text-white drop-shadow">"{quote.text}"</p>
            <p className="mt-1 text-sm font-medium text-white/70">— {quote.author}</p>
          </div>
        )}
      </div>

      {/* Reels Pool Modal */}
      {showManagePool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-primary" /> Reels Pool ({reels.length})
                {serverStatus?.isDownloading && (
                  <span className="text-[10px] text-fuchsia-400 flex items-center gap-1">
                    <Loader className="h-3 w-3 animate-spin" /> {serverStatus.queueLength} left
                  </span>
                )}
              </h3>
              <button onClick={() => setShowManagePool(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Add reel form */}
            <form onSubmit={handleAddCustomReel} className="space-y-3 bg-muted/40 p-4 rounded-2xl border border-border">
              <p className="text-xs font-bold text-foreground">Add New Reel</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Paste an Instagram, YouTube Shorts, or TikTok link. It downloads automatically and plays locally.
              </p>
              <input type="url" value={newUrl} onChange={e => setNewUrl(e.target.value)}
                placeholder="https://www.instagram.com/p/..." required
                className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                placeholder="Title (optional)"
                className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              <button type="submit" disabled={!newUrl.trim()}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-40">
                <Plus className="h-4 w-4" /> Add & Download
              </button>
            </form>

            {/* Reel list */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">All Reels ({reels.length}):</p>
              {reels.map(r => {
                const status = getReelStatus(r.url);
                const def = DEFAULT_REELS.find(d => d.url === r.url);
                const entry = reelRegistry?.[r.url];
                const localSrc = entry?.filename ? `http://localhost:5173/videos/${entry.filename}` : null;

                return (
                  <div key={r.id} className="rounded-xl border border-border bg-card p-3 text-xs space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {r.priority && <span className="text-amber-400 text-[10px] font-bold">★ MAIN</span>}
                          <p className="font-bold text-foreground truncate">{r.title || 'Motivational Reel'}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground">by {r.author || def?.author || 'Instagram'}</p>
                        <StatusBadge status={status} />
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                        {status === 'local' && localSrc && (
                          <button
                            onClick={() => { setActiveReel(r); setShowManagePool(false); setIsPlaying(true); }}
                            className="text-emerald-500 font-bold text-[11px] px-2 py-1 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 transition-all"
                          >
                            Play
                          </button>
                        )}
                        <a href={r.url} target="_blank" rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-blue-400 p-1 transition-colors" title="View original">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button onClick={() => deleteReel(r.id)}
                          className="text-muted-foreground hover:text-rose-500 p-1 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    {/* Original link credit */}
                    <p className="text-[10px] text-muted-foreground truncate">
                      🔗 <a href={r.url} target="_blank" rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors">{r.url}</a>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}