import { Link, useLocation } from 'react-router-dom';
import { Home, CheckSquare, Timer, Calendar, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/focus', icon: Timer, label: 'Focus' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/extra', icon: Zap, label: 'Extra' },
];

export default function BottomNav() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pb-3">
      <div className="flex items-center justify-around rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-lg shadow-black/5 px-1 py-2">
        {items.map(({ to, icon: Icon, label }) => {
          const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-all',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-xl transition-all',
                active && 'bg-primary/10'
              )}>
                <Icon className={cn('h-4.5 w-4.5 transition-transform', active && 'scale-110')} />
              </div>
              <span className={cn('text-[10px] font-semibold', active && 'font-bold')}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}