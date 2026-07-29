import { Moon, Sun } from 'lucide-react';

export default function SleepSchedule({ sleepTime, wakeTime }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10">
          <Moon className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Sleep</p>
          <p className="text-lg font-heading font-bold text-foreground">{sleepTime}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
          <Sun className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Wake</p>
          <p className="text-lg font-heading font-bold text-foreground">{wakeTime}</p>
        </div>
      </div>
    </div>
  );
}