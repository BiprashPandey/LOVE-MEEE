import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ClipboardList } from 'lucide-react';
import TaskItem from '@/components/TaskItem';
import ThemeToggle from '@/components/ThemeToggle';
import { useApp } from '@/lib/AppContext';
import { cn } from '@/lib/utils';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'done', label: 'Done' },
];

const priorities = [
  { id: 'low', label: 'Low', dot: 'bg-emerald-400' },
  { id: 'medium', label: 'Med', dot: 'bg-amber-400' },
  { id: 'high', label: 'High', dot: 'bg-rose-500' },
];

export default function Tasks() {
  const { tasks, loading, addTask, toggleTask, editTask, deleteTask } = useApp();
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [filter, setFilter] = useState('all');

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    await addTask(newTitle, newPriority);
    setNewTitle('');
  };

  const filtered = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'done') return t.completed;
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold text-foreground">Tasks</h1>
        <ThemeToggle />
      </div>

      <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Add a new task..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none px-2 py-1"
          />
          <button
            onClick={handleAdd}
            disabled={!newTitle.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform active:scale-90 disabled:opacity-40 shadow-md shadow-primary/20"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          <span className="text-xs font-medium text-muted-foreground mr-1">Priority:</span>
          {priorities.map(p => (
            <button
              key={p.id}
              onClick={() => setNewPriority(p.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all',
                newPriority === p.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
              )}
            >
              <span className={cn('h-2 w-2 rounded-full', p.dot)} />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'flex-1 rounded-xl py-2 text-sm font-semibold transition-all',
              filter === f.id ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            {filter === 'done' ? 'No completed tasks yet' : filter === 'active' ? "No active tasks. You're all caught up!" : 'No tasks yet. Add one above!'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence>
            {filtered.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onEdit={editTask}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}