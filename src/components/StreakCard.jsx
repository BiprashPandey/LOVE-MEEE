import { Flame, Trophy, Target } from 'lucide-react';

export default function StreakCard({ streak, longest, todayLevel }) {
  const levelLabels = { high: 'On Fire', medium: 'Solid', low: 'Getting Started', none: 'GRIND Day' };
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-4">
        <Flame className="h-6 w-6 text-primary mb-1" />
        <span className="text-2xl font-heading font-extrabold text-foreground">{streak}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Day Streak</span>
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-4">
        <Trophy className="h-6 w-6 text-amber-500 mb-1" />
        <span className="text-2xl font-heading font-extrabold text-foreground">{longest}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Best Streak</span>
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-4">
        <Target className="h-6 w-6 text-primary mb-1" />
        <span className="text-sm font-heading font-bold text-foreground leading-tight text-center">
          {levelLabels[todayLevel] || 'GRIND Day'}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Today</span>
      </div>
    </div>
  );
}