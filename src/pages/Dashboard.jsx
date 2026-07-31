import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Trash2 } from 'lucide-react';
import MotivationalReel from '@/components/MotivationalReel';
import StreakCard from '@/components/StreakCard';
import ThemeToggle from '@/components/ThemeToggle';
import QuickNoteModal from '@/components/QuickNoteModal';
import { useApp } from '@/lib/AppContext';
import { getRandomQuote } from '@/lib/quotes';

// ─── Splash helpers ────────────────────────────────────────────────────────

function computeSplash(streak, goal) {
  const SPLASH_KEY = 'love_meee_splash_seen';
  const SESSION_KEY = 'love_meee_session_splash_shown';
  try {
    if (!localStorage.getItem(SPLASH_KEY)) {
      localStorage.setItem(SPLASH_KEY, '1');
      return null;                     // first-ever launch → no splash
    }
    if (sessionStorage.getItem(SESSION_KEY)) return null; // already shown this tab
    sessionStorage.setItem(SESSION_KEY, '1');

    const variant = Math.floor(Math.random() * 3);
    const userName = localStorage.getItem('love_meee_user_name') || '';
    return { variant, userName, quote: getRandomQuote(), streak: streak || 0, goal };
  } catch {
    return null;
  }
}

function SplashOverlay({ splash, onDismiss }) {
  const { variant, userName, quote, streak, goal } = splash;
  const nameStr = userName ? `, ${userName}` : '';
  const goalTitle = goal?.title || goal?.primary_goal || '…';

  const gradText = {
    background: 'linear-gradient(90deg, #e879f9, #f9a8d4, #fde68a)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'linear-gradient(145deg, #09090b 0%, #18051a 55%, #09090b 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 32px',
        cursor: 'pointer',
      }}
    >
      {/* ambient blobs */}
      <div style={{ position:'absolute', top:-128, left:-128, width:320, height:320,
        borderRadius:'50%', background:'radial-gradient(circle,#a855f7,transparent)',
        opacity:0.25, filter:'blur(64px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:-96, right:-96, width:256, height:256,
        borderRadius:'50%', background:'radial-gradient(circle,#ec4899,transparent)',
        opacity:0.2, filter:'blur(48px)', pointerEvents:'none' }} />

      {/* logo */}
      <p style={{ ...gradText, fontSize:12, fontWeight:900, letterSpacing:'0.3em',
        textTransform:'uppercase', marginBottom:48, opacity:0.8 }}>
        LOVE MEEE
      </p>

      {/* content */}
      {variant === 0 && (
        <div style={{ textAlign:'center', maxWidth:300 }}>
          <div style={{ fontSize:56, marginBottom:16 }}>💬</div>
          <p style={{ color:'#fff', fontSize:18, fontWeight:800, lineHeight:1.4,
            marginBottom:12 }}>"{quote?.text}"</p>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:13 }}>— {quote?.author}</p>
        </div>
      )}

      {variant === 1 && (
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:72, marginBottom:8,
            filter:'drop-shadow(0 0 24px #f97316)' }}>🔥</div>
          <p style={{ color:'#fff', fontSize:64, fontWeight:900, lineHeight:1,
            marginBottom:8 }}>{streak}</p>
          <p style={{ color:'#f97316', fontSize:18, fontWeight:700,
            marginBottom:12 }}>Day Streak</p>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:13, maxWidth:220,
            textAlign:'center' }}>
            {streak <= 1 ? 'Day one. The journey begins NOW.'
              : streak < 7 ? "You're building momentum. KEEP GOING!"
              : "You are UNSTOPPABLE. Don't stop now."}
          </p>
        </div>
      )}

      {variant === 2 && (
        <div style={{ textAlign:'center', maxWidth:300 }}>
          <div style={{ fontSize:56, marginBottom:16 }}>🎯</div>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:11, fontWeight:700,
            letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:12 }}>
            Your commitment{nameStr}
          </p>
          <p style={{ ...gradText, fontSize:22, fontWeight:900, lineHeight:1.3,
            marginBottom:16 }}>
            I will {goalTitle}
          </p>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:13 }}>
            Every day you show up is a vote for the person you're becoming.
          </p>
        </div>
      )}

      {/* tap hint */}
      <p style={{ position:'absolute', bottom:40, color:'rgba(255,255,255,0.2)',
        fontSize:11 }}>
        Tap anywhere to continue
      </p>
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { goal, notes, streak, longestStreak, todayLog, loading, deleteNote } = useApp();
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  // Splash: computed once on mount (lazy init), stable across re-renders
  const [splash, setSplash] = useState(() => null); // start null, set after goal loads
  const [splashReady, setSplashReady] = useState(false);

  // Once the goal is loaded, compute the splash exactly once
  useEffect(() => {
    if (splashReady || loading) return;
    setSplashReady(true);
    const s = computeSplash(streak, goal);
    setSplash(s);
    if (s) {
      const t = setTimeout(() => setSplash(null), 3000);
      return () => clearTimeout(t);
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const hour = new Date().getHours();
  const baseName = goal?.user_name || localStorage.getItem('love_meee_user_name') || '';
  const nameStr = baseName ? `, ${baseName}` : '';
  const greeting = (hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening') + nameStr;
  const recentNotes = (notes || []).slice(0, 3);

  return (
    <>
      {/* Splash overlay — pure CSS, no framer-motion, safe */}
      {splash && <SplashOverlay splash={splash} onDismiss={() => setSplash(null)} />}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{greeting} 👋</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <h1 className="font-heading text-2xl font-extrabold text-foreground">
                {goal?.primary_goal || goal?.title || 'Stay focused'}
              </h1>
              <button
                onClick={() => setIsNotesModalOpen(true)}
                className="flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition-all active:scale-95 shadow-sm"
                title="Add Quick Note"
              >
                <Plus className="h-3.5 w-3.5" /> Notes
              </button>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <MotivationalReel />

        <StreakCard streak={streak} longest={longestStreak} todayLevel={todayLog?.productivity_level || 'none'} />

        {/* Recent Notes */}
        {recentNotes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Quick Notes
              </h2>
              <button
                onClick={() => setIsNotesModalOpen(true)}
                className="text-xs font-bold text-primary hover:underline"
              >
                + New Note
              </button>
            </div>
            <div className="grid gap-2">
              {recentNotes.map(n => (
                <div key={n.id} className="rounded-2xl border border-border bg-card p-3.5 space-y-1 relative shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-foreground">{n.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{n.log_date}</span>
                      <button
                        onClick={() => deleteNote(n.id)}
                        className="text-muted-foreground hover:text-rose-500 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {n.content && <p className="text-xs text-muted-foreground line-clamp-2">{n.content}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <QuickNoteModal
          isOpen={isNotesModalOpen}
          onClose={() => setIsNotesModalOpen(false)}
        />
      </motion.div>
    </>
  );
}