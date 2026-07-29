import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, CheckCircle2, Clock, FileText, Plus, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { LEVEL_COLORS } from '@/lib/dayLog';
import { useApp } from '@/lib/AppContext';
import QuickNoteModal from './QuickNoteModal';
import { cn } from '@/lib/utils';

export default function DaySummaryModal({ isOpen, onClose, dateStr }) {
  const { tasks, dayLogs, notes, deleteNote } = useApp();
  const [isAddingNote, setIsAddingNote] = useState(false);

  if (!isOpen || !dateStr) return null;

  const log = dayLogs.find(l => l.log_date === dateStr);
  const dateObj = parseISO(dateStr);
  const formattedDate = format(dateObj, 'EEEE, MMMM d, yyyy');

  const level = log?.productivity_level || 'none';
  const completedTasksOnDate = tasks.filter(t => t.completed && t.completed_at && t.completed_at.startsWith(dateStr));
  const dateNotes = notes.filter(n => n.log_date === dateStr);

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading text-base font-bold text-foreground">{formattedDate}</h2>
                  <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white mt-0.5', LEVEL_COLORS[level])}>
                    {level === 'none' ? 'No Activity' : `${level} Productivity`}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-muted/40 p-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5 text-primary mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-semibold">Tasks Completed</span>
                </div>
                <p className="font-heading text-2xl font-extrabold text-foreground">{log?.tasks_completed || completedTasksOnDate.length || 0}</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/40 p-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5 text-primary mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-semibold">Focus Minutes</span>
                </div>
                <p className="font-heading text-2xl font-extrabold text-foreground">{log?.focus_minutes || 0}m</p>
              </div>
            </div>

            {/* Tasks Completed Section */}
            <div>
              <h3 className="font-heading text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Completed Tasks
              </h3>
              {completedTasksOnDate.length === 0 ? (
                <p className="text-xs text-muted-foreground italic bg-muted/30 p-3 rounded-xl">No tasks logged for this date.</p>
              ) : (
                <div className="space-y-2">
                  {completedTasksOnDate.map(t => (
                    <div key={t.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-xs">
                      <span className="font-semibold text-foreground line-through opacity-80">{t.title}</span>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase">{t.priority || 'med'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Day Notes ({dateNotes.length})
                </h3>
                <button
                  onClick={() => setIsAddingNote(true)}
                  className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Note
                </button>
              </div>

              {dateNotes.length === 0 ? (
                <p className="text-xs text-muted-foreground italic bg-muted/30 p-3 rounded-xl">No notes written for this date.</p>
              ) : (
                <div className="space-y-2">
                  {dateNotes.map(n => (
                    <div key={n.id} className="rounded-xl border border-border bg-card p-3 space-y-1 relative group">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-foreground">{n.title}</p>
                        <button
                          onClick={() => deleteNote(n.id)}
                          className="text-muted-foreground hover:text-rose-500 p-1 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {n.content && <p className="text-xs text-muted-foreground whitespace-pre-wrap">{n.content}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-xl bg-muted py-3 text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </motion.div>
        </div>
      </AnimatePresence>

      <QuickNoteModal
        isOpen={isAddingNote}
        onClose={() => setIsAddingNote(false)}
        defaultDate={dateStr}
      />
    </>
  );
}
