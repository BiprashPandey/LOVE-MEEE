import { useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { useApp } from '@/lib/AppContext';
import { NotificationService } from '@/lib/NotificationService';

export default function AppLayout() {
  const { goal, loading } = useApp();
  const navigate = useNavigate();
  const notificationInterval = useRef(null);

  useEffect(() => {
    if (!loading && !goal) {
      navigate('/onboarding', { replace: true });
    }
  }, [goal, loading, navigate]);

  // Background notifications & schedule checker loop
  useEffect(() => {
    if (!goal) return;

    // Check sleep/wake schedule every minute
    notificationInterval.current = setInterval(() => {
      if (goal.sleep_time && goal.wake_time) {
        NotificationService.checkSleepSchedule(goal.sleep_time, goal.wake_time);
      }
    }, 60000);

    return () => clearInterval(notificationInterval.current);
  }, [goal]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm font-heading font-bold text-primary tracking-widest animate-pulse">LOVE MEEE</p>
        </div>
      </div>
    );
  }

  if (!goal) return null;

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-md min-h-screen px-5 pt-6 pb-28">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}