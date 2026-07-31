/**
 * SplashScreen — pure display component.
 * Timing (auto-dismiss) is controlled entirely by the parent (AppLayout).
 * Tap anywhere to dismiss early.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomQuote } from '@/lib/quotes';

// ── Sub-screens ────────────────────────────────────────────────────────────
function QuoteScreen({ quote }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-8 text-center space-y-4">
      <div className="text-5xl mb-2">💬</div>
      <p className="text-xl font-black leading-snug text-white drop-shadow-lg">"{quote.text}"</p>
      <p className="text-sm font-semibold text-white/50">— {quote.author}</p>
    </div>
  );
}

function StreakScreen({ streak }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center space-y-3">
      <motion.div
        animate={{ scale: [1, 1.15, 1], rotate: [-5, 5, -5, 5, 0] }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
        className="text-7xl mb-2 select-none"
        style={{ filter: 'drop-shadow(0 0 24px #f97316)' }}
      >
        🔥
      </motion.div>
      <p className="text-6xl font-black text-white">{streak}</p>
      <p className="text-lg font-bold text-orange-400">Day Streak</p>
      <p className="text-sm text-white/50 max-w-[220px] leading-relaxed px-4">
        {streak <= 1
          ? 'Day one. The journey begins NOW.'
          : streak < 7
          ? "You're building momentum. KEEP GOING!"
          : streak < 30
          ? 'Consistency is your superpower. DON\'T STOP!'
          : 'You are UNSTOPPABLE. Legends are made like this.'}
      </p>
    </div>
  );
}

function GoalScreen({ goalTitle, userName }) {
  const nameStr = userName ? `, ${userName}` : '';
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-8 text-center space-y-4">
      <div className="text-5xl mb-2">🎯</div>
      <p className="text-sm font-bold uppercase tracking-widest text-white/40">
        Your commitment{nameStr}
      </p>
      <p
        className="text-2xl font-black leading-tight"
        style={{
          background: 'linear-gradient(90deg, #e879f9, #f9a8d4, #fde68a)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        I will {goalTitle || '…'}
      </p>
      <p className="text-sm text-white/50 leading-relaxed max-w-[260px]">
        Every day you show up is a vote for the person you're becoming.
      </p>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function SplashScreen({ show, streak, goalTitle, onDismiss }) {
  // Variant and quote are fixed for the lifetime of this component instance
  const [variant] = useState(() => Math.floor(Math.random() * 3));
  const [quote] = useState(() => getRandomQuote());
  const userName = localStorage.getItem('love_meee_user_name') || '';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[100] flex flex-col"
          style={{
            background: 'linear-gradient(145deg, #09090b 0%, #18051a 55%, #09090b 100%)',
          }}
          onClick={onDismiss}
        >
          {/* Glow blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-25 blur-3xl"
              style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
            <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full opacity-20 blur-3xl"
              style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }} />
          </div>

          {/* Logo */}
          <div className="relative z-10 pt-14 text-center">
            <p
              className="text-sm font-black tracking-[0.3em] uppercase"
              style={{
                background: 'linear-gradient(90deg, #e879f9, #f9a8d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              LOVE MEEE
            </p>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col flex-1">
            {variant === 0 && <QuoteScreen quote={quote} />}
            {variant === 1 && <StreakScreen streak={streak || 0} />}
            {variant === 2 && <GoalScreen goalTitle={goalTitle} userName={userName} />}
          </div>

          {/* Tap hint */}
          <motion.p
            className="relative z-10 pb-10 text-center text-[11px] text-white/25"
            animate={{ opacity: [0.25, 0.6, 0.25] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            Tap anywhere to continue
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
