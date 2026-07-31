import { useState, useEffect } from 'react';
import { Play, Heart, Film, X, Loader, CheckCircle, HardDrive } from 'lucide-react';
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

// Dynamic server URL — works on both localhost and phone WiFi (http://192.168.x.x)
const DOWNLOAD_SERVER = `${window.location.protocol}//${window.location.hostname}:3001`;

// ── Inline video overlay plays on the card itself ─────────────────────────
function VideoOverlay({ src, title, originalUrl, author, isLiked, onToggleLike, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 z-30 bg-black flex flex-col rounded-3xl overflow-hidden relative"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2 }}
      >
        {/* Like button right over the playing reel video */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleLike?.(); }}
          className="absolute top-4 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-md transition-transform active:scale-90"
          title={isLiked ? 'Unlike' : 'Like this reel'}
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
        </button>

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
            <span className="text-[11px] font-semibold text-rose-400 truncate max-w-[200px]">
              {author || 'Instagram'}
              <span className="text-white/30 ml-1">· {title}</span>
            </span>
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
  const { reels, reelRegistry } = useApp();
  // Liked reels stored in localStorage for weighted random selection
  const [likedUrls, setLikedUrls] = useState(() => {
    try { return JSON.parse(localStorage.getItem('love_meee_liked_reels') || '[]'); }
    catch { return []; }
  });
  const [activeReel, setActiveReel] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);
  // Auto-play triggered by notification click
  const [pendingAutoplay, setPendingAutoplay] = useState(() => {
    const flag = sessionStorage.getItem('love_meee_autoplay_reel');
    if (flag) sessionStorage.removeItem('love_meee_autoplay_reel');
    return !!flag;
  });

  const isLiked = activeReel ? likedUrls.includes(activeReel.url) : false;

  const toggleLike = () => {
    if (!activeReel) return;
    setLikedUrls(prev => {
      const next = prev.includes(activeReel.url)
        ? prev.filter(u => u !== activeReel.url)
        : [...prev, activeReel.url];
      localStorage.setItem('love_meee_liked_reels', JSON.stringify(next));
      return next;
    });
  };

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const img = REEL_IMAGES[dayOfYear % REEL_IMAGES.length];
  const quote = getDailyQuote();

  const [reelPicked, setReelPicked] = useState(false);

  useEffect(() => {
    if (!reels?.length || reelPicked) return;

    const SESSION_KEY = 'love_meee_session_started';
    const isFirstOpen = !sessionStorage.getItem(SESSION_KEY);

    if (isFirstOpen) {
      sessionStorage.setItem(SESSION_KEY, '1');
      const priorityReel = reels.find(r => r.priority || r.url === DEFAULT_REELS[0]?.url) || reels[0];
      setActiveReel(priorityReel);
    } else {
      const localReels = reels.filter(r => reelRegistry?.[r.url]?.filename);
      const pool = localReels.length ? localReels : reels;
      const likedSet = (() => { try { return JSON.parse(localStorage.getItem('love_meee_liked_reels') || '[]'); } catch { return []; } })();
      const weighted = pool.flatMap(r => likedSet.includes(r.url) ? [r, r, r] : [r]);
      setActiveReel(weighted[Math.floor(Math.random() * weighted.length)]);
    }

    setReelPicked(true);
  }, [reels]);

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

  const videoSrc = activeEntry?.filename
    ? `${window.location.origin}/videos/${activeEntry.filename}`
    : null;

  // Auto-play when pendingAutoplay is set and video is ready
  useEffect(() => {
    if (pendingAutoplay && videoSrc) {
      setPendingAutoplay(false);
      setIsPlaying(true);
    }
  }, [pendingAutoplay, videoSrc]);

  // Listen for notification-triggered play event
  useEffect(() => {
    const handler = () => {
      if (videoSrc) setIsPlaying(true);
      else setPendingAutoplay(true);
    };
    window.addEventListener('love-meee-play-reel', handler);
    return () => window.removeEventListener('love-meee-play-reel', handler);
  }, [videoSrc]);

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
    }
  };

  const enrichedActive = activeReel ? enrichReel(activeReel) : null;

  return (
    <div className="relative overflow-hidden rounded-3xl aspect-[4/5] shadow-xl shadow-black/10">
      <img src={img} alt="Daily motivation" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

      {/* Inline video overlay — plays directly on the card with Heart button on top */}
      {isPlaying && videoSrc && enrichedActive && (
        <VideoOverlay
          src={videoSrc}
          title={enrichedActive.title}
          originalUrl={enrichedActive.originalUrl}
          author={enrichedActive.author}
          isLiked={isLiked}
          onToggleLike={toggleLike}
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
          <span className="rounded-full bg-white/20 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white flex items-center gap-1">
            <HardDrive className="h-3 w-3" /> {reels.length}
          </span>
          <button
            onClick={toggleLike}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-transform active:scale-90"
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
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
              : 'Reel ready'
            }
          </span>
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
  );
}