import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PomodoroTimer from '@/components/PomodoroTimer';
import ThemeToggle from '@/components/ThemeToggle';
import { useApp } from '@/lib/AppContext';
import { getTodayStr } from '@/lib/dayLog';
import { Target, Headphones, Play, Pause, ListMusic, Check, X } from 'lucide-react';

const AMBIENT_CHANNELS = [
  { id: 'rain', name: 'Rain & Thunderstorm', icon: '🌧️', desc: 'Heavy rain & distant thunder for deep focus', ytid: 'mPZkdNFkNps' },
  { id: 'forest', name: 'Forest Nature & Birds', icon: '🌲', desc: 'Peaceful woodland birds & gentle breeze', ytid: 'xNN7iTA57jM' },
  { id: 'lofi', name: 'Lofi Study Beats', icon: '☕', desc: 'Chill lofi hip-hop beats for concentration', ytid: 'jfKfPfyJRdk' },
  { id: 'waves', name: 'Deep Ocean Waves', icon: '🌊', desc: 'Rhythmic ocean surf & calming tide', ytid: 'bn9F19Hi1Lk' },
  { id: 'pink', name: 'Deep Pink Noise', icon: '🧠', desc: 'Consistent sound mask for study & work', ytid: '85LwM-UeGv0' },
  { id: 'river', name: 'Gentle River Stream', icon: '🏞️', desc: 'Flowing mountain stream water sounds', ytid: 'vPhg6sc1Mk4' },
  { id: 'crickets', name: 'Night Crickets', icon: '🌙', desc: 'Soothing summer night ambient soundscape', ytid: 'eKmRkS1os7k' },
  { id: 'fireplace', name: 'Cozy Crackling Fireplace', icon: '🔥', desc: 'Warm wood embers & soft hearth crackle', ytid: 'L_LUpnjgPso' },
  { id: 'bowls', name: 'Tibetan Singing Bowls', icon: '🧘', desc: 'Resonant meditation bowls for clarity', ytid: 'Q5dU6serXHQ' },
  { id: 'coffee', name: 'Espresso Coffee Shop', icon: '☕', desc: 'Subtle cafe chatter & coffee machine hum', ytid: 'h2zkV-l_VbU' },
];

function RelaxingAudioPlayer() {
  const [activeChannel, setActiveChannel] = useState(AMBIENT_CHANNELS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const selectChannel = (ch) => {
    setActiveChannel(ch);
    setIsPlaying(true);
    setShowModal(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Headphones className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading text-xs font-bold text-foreground">Relaxing Ambient Audio</h3>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span>{activeChannel.icon}</span>
              <span className="font-semibold text-foreground">{activeChannel.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/50 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors active:scale-95"
          >
            <ListMusic className="h-3.5 w-3.5" /> Choose Track
          </button>
          <button
            onClick={togglePlay}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
              isPlaying ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
            }`}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
      </div>

      {/* Track Selector Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <ListMusic className="h-5 w-5 text-primary" />
                  <h3 className="font-heading text-base font-extrabold text-foreground">Select Relaxing Audio</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="rounded-full p-1 text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2">
                {AMBIENT_CHANNELS.map(ch => {
                  const isSelected = activeChannel.id === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => selectChannel(ch)}
                      className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition-all active:scale-98 ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-foreground font-bold shadow-xs'
                          : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{ch.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-foreground">{ch.name}</p>
                          <p className="text-[10px] text-muted-foreground">{ch.desc}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden YouTube iFrame (Audio Only) */}
      {isPlaying && (
        <div className="hidden">
          <iframe
            width="1"
            height="1"
            src={`https://www.youtube-nocookie.com/embed/${activeChannel.ytid}?autoplay=1&loop=1&playlist=${activeChannel.ytid}&controls=0`}
            title="Relaxing Audio Stream"
            allow="autoplay"
          />
        </div>
      )}
    </div>
  );
}

export default function Pomodoro() {
  const { goal, sessions, loading, completeFocusSession } = useApp();

  const handleSessionComplete = async (type, durationSeconds) => {
    await completeFocusSession(type, durationSeconds);
  };

  const today = getTodayStr();
  const todaySessions = sessions.filter(s => s.session_date === today);
  const todayMinutes = todaySessions.reduce((sum, s) => sum + Math.round((s.duration_seconds || 0) / 60), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold text-foreground">Focus</h1>
        <ThemeToggle />
      </div>

      {goal && (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Your primary goal</p>
            <p className="text-sm font-bold text-foreground">{goal.primary_goal || goal.title}</p>
          </div>
        </div>
      )}

      <RelaxingAudioPlayer />

      <PomodoroTimer
        workInterval={goal?.work_interval || 25}
        breakInterval={goal?.break_interval || 5}
        onSessionComplete={handleSessionComplete}
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <p className="text-3xl font-heading font-extrabold text-primary">{todaySessions.length}</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sessions Today</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <p className="text-3xl font-heading font-extrabold text-primary">{todayMinutes}</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Focus Minutes</p>
        </div>
      </div>
    </motion.div>
  );
}