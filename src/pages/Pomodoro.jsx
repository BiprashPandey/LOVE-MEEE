import { motion } from 'framer-motion';
import PomodoroTimer from '@/components/PomodoroTimer';
import ThemeToggle from '@/components/ThemeToggle';
import { useApp } from '@/lib/AppContext';
import { getTodayStr } from '@/lib/dayLog';
import { Target, Flame } from 'lucide-react';

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
            <p className="text-sm font-bold text-foreground">{goal.primary_goal}</p>
          </div>
        </div>
      )}

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