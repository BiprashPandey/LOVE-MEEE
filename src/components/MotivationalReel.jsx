import { useState, useEffect } from 'react';
import { Play, Heart, Plus, Film, Trash2, X } from 'lucide-react';
import { getDailyQuote } from '@/lib/quotes';
import { useApp } from '@/lib/AppContext';
import ReelPlayerModal from './ReelPlayerModal';

const REEL_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
];

export default function MotivationalReel() {
  const { reels, addReel, deleteReel } = useApp();
  const [liked, setLiked] = useState(false);
  const [activeReel, setActiveReel] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showManagePool, setShowManagePool] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const img = REEL_IMAGES[dayOfYear % REEL_IMAGES.length];
  const quote = getDailyQuote();

  useEffect(() => {
    if (reels && reels.length > 0) {
      const randomIndex = Math.floor(Math.random() * reels.length);
      setActiveReel(reels[randomIndex]);
    } else {
      setActiveReel({
        url: 'https://www.instagram.com/reels/DY95pVyT82B/',
        title: 'Daily Motivation Reel',
      });
    }
  }, [reels]);

  const handleAddCustomReel = async (e) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    await addReel(newUrl, newTitle || 'Custom Reel');
    setNewUrl('');
    setNewTitle('');
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl aspect-[4/5] shadow-xl shadow-black/10">
        <img src={img} alt="Daily motivation" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

        {/* Top Header */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white flex items-center gap-1.5">
            <Film className="h-3.5 w-3.5" /> DAILY REEL
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowManagePool(true)}
              className="rounded-full bg-white/20 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-white/30 transition-all"
              title="Manage Saved Reels"
            >
              Reels Pool ({reels.length})
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-transform active:scale-90"
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
            </button>
          </div>
        </div>

        {/* Center In-App Play Button */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <button
            onClick={() => setIsPlaying(true)}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white/25 backdrop-blur-md transition-transform active:scale-90 hover:scale-105 shadow-lg"
          >
            <Play className="h-7 w-7 fill-white text-white ml-1" />
          </button>
          <span className="mt-3 text-xs font-bold text-white/90 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
            Play In-App Reel 🎬
          </span>
        </div>

        {/* Bottom Quote Banner */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="font-heading text-lg font-bold leading-snug text-white drop-shadow">
            "{quote.text}"
          </p>
          <p className="mt-1 text-sm font-medium text-white/70">— {quote.author}</p>
        </div>
      </div>

      {/* In-App Reel Video Player Modal */}
      <ReelPlayerModal
        isOpen={isPlaying}
        onClose={() => setIsPlaying(false)}
        reelUrl={activeReel?.url}
        title={activeReel?.title}
      />

      {/* Reels Pool Management Modal */}
      {showManagePool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                <Film className="h-5 w-5 text-primary" /> Saved Reels Pool ({reels.length})
              </h3>
              <button
                onClick={() => setShowManagePool(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomReel} className="space-y-3 bg-muted/40 p-4 rounded-2xl border border-border">
              <p className="text-xs font-bold text-foreground">Add New Instagram Reel Link</p>
              <input
                type="url"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/..."
                className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Reel Title (e.g. Morning Discipline)"
                className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={!newUrl.trim()}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-sm disabled:opacity-40"
              >
                <Plus className="h-4 w-4" /> Add Reel
              </button>
            </form>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Saved Reels List:</p>
              {reels.map(r => (
                <div key={r.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-xs">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-bold text-foreground truncate">{r.title || 'Motivational Reel'}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{r.url}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setActiveReel(r);
                        setShowManagePool(false);
                        setIsPlaying(true);
                      }}
                      className="text-primary hover:underline font-bold text-[11px] px-2 py-1 bg-primary/10 rounded-lg"
                    >
                      Play
                    </button>
                    <button
                      onClick={() => deleteReel(r.id)}
                      className="text-muted-foreground hover:text-rose-500 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}