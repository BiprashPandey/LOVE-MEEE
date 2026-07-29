import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Plus, Calendar } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { getTodayStr } from '@/lib/dayLog';

export default function QuickNoteModal({ isOpen, onClose, defaultDate }) {
  const { addNote } = useApp();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dateStr, setDateStr] = useState(defaultDate || getTodayStr());

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;
    await addNote(title, content, dateStr);
    setTitle('');
    setContent('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="font-heading text-lg font-bold text-foreground">Quick Note</h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Note title (e.g. Breakthrough ideas)..."
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Content</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write your note, reflections, or reminders..."
                rows={4}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                value={dateStr}
                onChange={e => setDateStr(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border bg-card py-3 text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() && !content.trim()}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" /> Save Note
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
