import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, addMonths, subMonths, isSameMonth, isToday as isDateToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import StreakCard from '@/components/StreakCard';
import DaySummaryModal from '@/components/DaySummaryModal';
import { useApp } from '@/lib/AppContext';
import { LEVEL_COLORS, getTodayStr } from '@/lib/dayLog';
import { cn } from '@/lib/utils';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const { dayLogs, streak, longestStreak, todayLog, loading } = useApp();
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const logMap = new Map();
  (dayLogs || []).forEach(l => logMap.set(l.log_date, l));

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const monthActiveDays = days.filter(d => {
    const str = format(d, 'yyyy-MM-dd');
    const log = logMap.get(str);
    return log && log.productivity_level !== 'none';
  }).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold text-foreground">Calendar</h1>
        <ThemeToggle />
      </div>

      <StreakCard streak={streak} longest={longestStreak} todayLevel={todayLog?.productivity_level || 'none'} />

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setMonth(m => subMonths(m, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="font-heading text-lg font-bold text-foreground">
            {format(month, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setMonth(m => addMonths(m, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-muted transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdays.map(d => (
            <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {days.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const log = logMap.get(dateStr);
              const level = log?.productivity_level || 'none';
              const inMonth = isSameMonth(day, month);
              const today_ = isDateToday(day);
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    'aspect-square flex items-center justify-center rounded-lg text-xs font-semibold transition-all relative active:scale-90 hover:ring-2 hover:ring-primary/50',
                    LEVEL_COLORS[level] || 'bg-muted',
                    !inMonth && 'opacity-30',
                    level === 'none' && inMonth && 'bg-muted/50 text-muted-foreground',
                    level !== 'none' && 'text-white',
                    today_ && 'ring-2 ring-primary ring-offset-1 ring-offset-card font-extrabold'
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-rose-500" />
              <span className="text-[10px] text-muted-foreground">High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-rose-400" />
              <span className="text-[10px] text-muted-foreground">Med</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-rose-300" />
              <span className="text-[10px] text-muted-foreground">Low</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">{monthActiveDays} active days</span>
        </div>
      </div>

      <DaySummaryModal
        isOpen={Boolean(selectedDate)}
        onClose={() => setSelectedDate(null)}
        dateStr={selectedDate}
      />
    </motion.div>
  );
}