import { motion } from 'framer-motion';
import DistractionMonitor from '@/components/DistractionMonitor';
import SleepSchedule from '@/components/SleepSchedule';
import QuoteCard from '@/components/QuoteCard';
import ThemeToggle from '@/components/ThemeToggle';
import { useApp } from '@/lib/AppContext';

export default function Extra() {
  const { goal } = useApp();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold text-foreground">Extra</h1>
        <ThemeToggle />
      </div>

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
