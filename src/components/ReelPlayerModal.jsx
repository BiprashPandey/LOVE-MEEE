/**
 * ReelPlayerModal — Full-screen video player for locally downloaded reels.
 * Used when playing a reel from the local library (not the main card).
 */
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Sparkles, HardDrive } from 'lucide-react';

export function getInstagramShortcode(url) {
  if (!url) return null;
  const match = url.match(/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

function toYouTubeEmbedUrl(url) {
  try {
    const u = new URL(url);
    let videoId = u.searchParams.get('v');
    if (!videoId) videoId = u.pathname.split('/').filter(Boolean).pop();
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  } catch { return url; }
}

function detectType(url) {
  if (!url) return 'unknown';
  try {
    const host = new URL(url).hostname.replace('www.', '');
    if (host === 'youtube.com' || host === 'youtu.be') return 'youtube';
    if (host === 'instagram.com') return 'instagram';
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) return 'video';
  } catch {}
  return 'unknown';
}

export default function ReelPlayerModal({ isOpen, onClose, videoSrc, reelUrl, title, author }) {
  if (!isOpen) return null;

  const type = videoSrc ? 'video' : detectType(reelUrl);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative w-full max-w-sm rounded-3xl bg-zinc-950 border border-white/10 overflow-hidden shadow-2xl flex flex-col"
          style={{ maxHeight: '90vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10"
            style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0.3) 0%, rgba(219,39,119,0.2) 100%)' }}>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full shadow-lg"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                <Sparkles className="h-4 w-4 text-white" />
              </span>
              <span className="font-bold text-sm text-white truncate max-w-[190px]">
                {title || 'Motivational Reel'}
              </span>
            </div>
            <button onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all active:scale-90">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Player */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {(type === 'video') && videoSrc && (
              <video
                src={videoSrc}
                className="w-full flex-1 object-contain bg-black"
                style={{ maxHeight: '70vh' }}
                autoPlay playsInline controls
              />
            )}

            {type === 'youtube' && (
              <div className="w-full flex-1" style={{ minHeight: '300px' }}>
                <iframe
                  src={toYouTubeEmbedUrl(reelUrl)}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen title="YouTube Player"
                  style={{ minHeight: '300px' }}
                />
              </div>
            )}

            {type === 'instagram' && !videoSrc && (
              <div className="flex flex-col items-center gap-5 px-6 py-10 text-center">
                <div className="h-20 w-20 rounded-3xl flex items-center justify-center shadow-2xl"
                  style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                  <HardDrive className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Not yet downloaded</h3>
                  <p className="text-white/50 text-xs mt-1 max-w-[220px]">
                    Make sure the download server is running — the video will download automatically.
                  </p>
                </div>
                <button onClick={() => window.open(reelUrl, '_blank', 'noopener')}
                  className="flex items-center gap-2 rounded-2xl py-3 px-6 font-bold text-white text-sm"
                  style={{ background: 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)' }}>
                  <ExternalLink className="h-4 w-4" /> Open on Instagram
                </button>
              </div>
            )}
          </div>

          {/* Attribution footer */}
          <div className="px-4 py-3 bg-white/5 border-t border-white/10 flex items-center justify-between">
            <a href={reelUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors">
              <ExternalLink className="h-3 w-3" />
              {author ? `Credit: ${author}` : 'View original'}
            </a>
            <button onClick={onClose}
              className="rounded-xl bg-white/10 hover:bg-white/20 px-5 py-2 text-xs font-bold text-white transition-all active:scale-95">
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
