import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckSquare, ChevronRight, FileText, Plus, Trash2 } from 'lucide-react';
import MotivationalReel from '@/components/MotivationalReel';
import StreakCard from '@/components/StreakCard';
import SleepSchedule from '@/components/SleepSchedule';
import QuoteCard from '@/components/QuoteCard';
import ThemeToggle from '@/components/ThemeToggle';
import DistractionMonitor from '@/components/DistractionMonitor';
import QuickNoteModal from '@/components/QuickNoteModal';
import { useApp } from '@/lib/AppContext';
import { getTodayStr } from '@/lib/dayLog';

export default function Dashboard() {
  const { goal, tasks, dayLogs, notes, streak, longestStreak, todayLog, loading, deleteNote } = useApp();
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = getTodayStr();
  const activeTasks = tasks.filter(t => !t.completed);
  const completedToday = tasks.filter(t => t.completed && t.completed_at && t.completed_at.startsWith(today));
  const recentNotes = (notes || []).slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Top Header with Goal & Quick Notes + Button */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{greeting} 👋</p>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="font-heading text-2xl font-extrabold text-foreground">
              {goal?.primary_goal || 'Stay focused'}
            </h1>
            <button
              onClick={() => setIsNotesModalOpen(true)}
              className="flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition-all active:scale-95 shadow-sm"
              title="Add Quick Note"
            >
              <Plus className="h-3.5 w-3.5" /> Notes +
            </button>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <MotivationalReel />

      <StreakCard streak={streak} longest={longestStreak} todayLevel={todayLog?.productivity_level || 'none'} />

      {/* Today's Tasks Summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-lg font-bold text-foreground">Today's Tasks</h2>
          <Link to="/tasks" className="flex items-center gap-0.5 text-sm font-semibold text-primary">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <Link to="/tasks" className="block">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/40 transition-colors">
            {activeTasks.length === 0 && completedToday.length === 0 ? (
              <div className="flex flex-col items-center py-4 text-center">
                <CheckSquare className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No tasks yet. Tap to add one!</p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active tasks</p>
                  <p className="text-2xl font-heading font-extrabold text-foreground">{activeTasks.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Done today</p>
                  <p className="text-2xl font-heading font-extrabold text-primary">{completedToday.length}</p>
                </div>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Recent Notes Preview */}
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

      <DistractionMonitor monitoredApps={goal?.monitored_apps || []} />

      <div>
        <h2 className="font-heading text-lg font-bold text-foreground mb-3">Sleep Schedule</h2>
        <SleepSchedule sleepTime={goal?.sleep_time || '23:00'} wakeTime={goal?.wake_time || '07:00'} />
      </div>

      <QuoteCard />

      <QuickNoteModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
      />
    </motion.div>
  );
}