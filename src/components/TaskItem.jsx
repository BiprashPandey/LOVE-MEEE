import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, Edit2, Save, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

const priorityStyles = {
  high: 'border-l-rose-500',
  medium: 'border-l-amber-400',
  low: 'border-l-emerald-400',
};

export default function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState(task.priority || 'medium');

  const handleToggle = () => {
    if (!task.completed) {
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.7 },
        colors: ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3'],
        scalar: 0.7,
      });
    }
    onToggle(task);
  };

  const handleSave = () => {
    if (!editTitle.trim()) return;
    onEdit(task.id, editTitle.trim(), editPriority);
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-border border-l-4 bg-card p-3.5 shadow-sm',
        priorityStyles[task.priority] || priorityStyles.medium,
        task.completed && 'opacity-60'
      )}
    >
      <button
        onClick={handleToggle}
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all active:scale-90',
          task.completed
            ? 'border-primary bg-primary'
            : 'border-muted-foreground/30 hover:border-primary'
        )}
      >
        <AnimatePresence>
          {task.completed && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            className="flex-1 bg-muted px-2.5 py-1 text-sm rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />
          <select
            value={editPriority}
            onChange={e => setEditPriority(e.target.value)}
            className="bg-muted text-xs font-semibold px-2 py-1 rounded-lg text-foreground focus:outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Med</option>
            <option value="high">High</option>
          </select>
          <button onClick={handleSave} className="text-emerald-500 hover:text-emerald-600 p-1">
            <Save className="h-4 w-4" />
          </button>
          <button onClick={() => setIsEditing(false)} className="text-muted-foreground hover:text-foreground p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex-1 min-w-0 relative">
          <span className={cn('text-sm font-medium text-foreground block truncate', task.completed && 'text-muted-foreground')}>
            {task.title}
          </span>
          <motion.div
            className="absolute left-0 top-1/2 h-0.5 bg-foreground/40"
            initial={{ width: 0 }}
            animate={{ width: task.completed ? '100%' : '0%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      )}

      {!isEditing && (
        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="text-muted-foreground hover:text-primary p-1 active:scale-90"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="text-muted-foreground hover:text-destructive p-1 active:scale-90"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </motion.div>
  );
}