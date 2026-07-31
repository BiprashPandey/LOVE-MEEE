import { motion } from 'framer-motion';
import DistractionMonitor from '@/components/DistractionMonitor';
import SleepSchedule from '@/components/SleepSchedule';
import QuoteCard from '@/components/QuoteCard';
import ThemeToggle from '@/components/ThemeToggle';
import { useApp } from '@/lib/AppContext';
import { Check } from 'lucide-react';

function ThemePicker() {
  const { appTheme, changeTheme, saveGoal, goal } = useApp();

  const themes = [
    { id: 'pink-red', name: 'Pink-Red', desc: 'Rose & Fuchsia', color: '#f43f5e' },
    { id: 'green', name: 'Green', desc: 'Emerald & Mint', color: '#10b981' },
    { id: 'golden', name: 'Golden', desc: 'Amber & Gold', color: '#f59e0b' },
  ];

  const handleSelect = (themeId) => {
    changeTheme(themeId);
    if (goal) {
      saveGoal({ ...goal, theme: themeId });
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
      <h3 className="font-heading text-sm font-bold text-foreground">Color Theme</h3>
      <div className="grid grid-cols-3 gap-2">
        {themes.map(t => {
          const active = appTheme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id)}
              className={`flex flex-col items-center justify-center rounded-xl border p-3 transition-all active:scale-95 ${
                active ? 'border-primary bg-primary/10 font-bold text-foreground shadow-sm' : 'border-border bg-muted/40 text-muted-foreground'
              }`}
            >
              <div className="h-5 w-5 rounded-full mb-1.5 flex items-center justify-center text-white" style={{ background: t.color }}>
                {active && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
              <span className="text-xs">{t.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Extra() {
  const { goal } = useApp();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold text-foreground">Extra</h1>
        <ThemeToggle />
      </div>

      <ThemePicker />

      <QuoteCard />

      <DistractionMonitor monitoredApps={goal?.distracting_apps || goal?.monitored_apps || []} />

      <div>
        <h2 className="font-heading text-lg font-bold text-foreground mb-3">Sleep Schedule</h2>
        <SleepSchedule
          sleepTime={goal?.sleep_time || '23:00'}
          wakeTime={goal?.wake_time || '07:00'}
        />
      </div>
    </motion.div>
  );
}
