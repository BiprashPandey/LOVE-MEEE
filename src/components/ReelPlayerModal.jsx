import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Play, Heart, Sparkles } from 'lucide-react';

export function getInstagramShortcode(url) {
  if (!url) return null;
  const match = url.match(/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

export default function ReelPlayerModal({ isOpen, onClose, reelUrl, title }) {
  if (!isOpen || !reelUrl) return null;

  const shortcode = getInstagramShortcode(reelUrl);
  const embedUrl = shortcode
    ? `https://www.instagram.com/reel/${shortcode}/embed/`
    : reelUrl;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-sm h-[80vh] rounded-3xl bg-black border border-white/20 overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="font-heading text-xs font-bold text-white tracking-wide">
                {title || 'LOVE MEEE Motivational Reel'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30 transition-transform active:scale-90"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Embedded Instagram Reel Frame */}
          <div className="flex-1 w-full h-full pt-12 pb-4 bg-black flex items-center justify-center">
            <iframe
              src={embedUrl}
              className="w-full h-full border-0 rounded-2xl"
              allowFullScreen
              scrolling="no"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              title="Instagram Reel Player"
            />
          </div>

          {/* Bottom Controls Bar */}
          <div className="p-3 bg-card border-t border-border flex items-center justify-between">
            <a
              href={reelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              Open in Instagram <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              onClick={onClose}
              className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-sm"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
