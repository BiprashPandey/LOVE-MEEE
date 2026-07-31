import { useState } from 'react';
import { Moon, Sun, Pencil, Check, X } from 'lucide-react';
import { useApp } from '@/lib/AppContext';

export default function SleepSchedule({ sleepTime: initialSleep, wakeTime: initialWake }) {
  const { goal, saveGoal } = useApp();
  const [editing, setEditing] = useState(false);
  const [sleep, setSleep] = useState(initialSleep || goal?.sleep_time || '22:30');
  const [wake, setWake] = useState(initialWake || goal?.wake_time || '06:30');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveGoal({ ...goal, sleep_time: sleep, wake_time: wake });
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-bold text-foreground">Sleep Schedule</h3>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <Pencil className="h-3 w-3" /> Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground disabled:opacity-50"
            >
              <Check className="h-3 w-3" /> {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Time cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10">
            <Moon className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Sleep</p>
            {editing ? (
              <input
                type="time"
                value={sleep}
                onChange={e => setSleep(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-border bg-background px-2 py-1 text-sm font-bold text-foreground focus:outline-none focus:border-primary"
              />
            ) : (
              <p className="text-lg font-heading font-bold text-foreground">{sleep}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
            <Sun className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Wake</p>
            {editing ? (
              <input
                type="time"
                value={wake}
                onChange={e => setWake(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-border bg-background px-2 py-1 text-sm font-bold text-foreground focus:outline-none focus:border-primary"
              />
            ) : (
              <p className="text-lg font-heading font-bold text-foreground">{wake}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}