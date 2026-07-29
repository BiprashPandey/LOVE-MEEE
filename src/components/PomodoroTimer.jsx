import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Timer, Timer as Stopwatch, Check, Volume2, VolumeX } from 'lucide-react';
import { playCompletionChime, playTickSound, triggerHapticFeedback } from '@/lib/NotificationService';
import { cn } from '@/lib/utils';

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function PomodoroTimer({ workInterval = 25, breakInterval = 5, onSessionComplete }) {
  const [mode, setMode] = useState('pomodoro'); // 'pomodoro' | 'stopwatch'
  const [phase, setPhase] = useState('work'); // 'work' | 'break'
  const [secondsLeft, setSecondsLeft] = useState(workInterval * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef(null);

  const totalSeconds = phase === 'work' ? workInterval * 60 : breakInterval * 60;

  useEffect(() => {
    if (mode === 'pomodoro') {
      setSecondsLeft(phase === 'work' ? workInterval * 60 : breakInterval * 60);
      setIsRunning(false);
    }
  }, [mode, phase, workInterval, breakInterval]);

  // Update browser document title with timer status
  useEffect(() => {
    if (isRunning) {
      const timeStr = formatTime(mode === 'pomodoro' ? secondsLeft : stopwatchSeconds);
      document.title = `(${timeStr}) ${mode === 'pomodoro' ? (phase === 'work' ? 'Focus' : 'Break') : 'Stopwatch'} - LOVE MEEE`;
    } else {
      document.title = 'LOVE MEEE - Productivity & Motivation';
    }
  }, [isRunning, mode, phase, secondsLeft, stopwatchSeconds]);

  useEffect(() => {
    if (!isRunning) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      if (mode === 'pomodoro') {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            const completedPhase = phase;
            if (completedPhase === 'work') {
              if (soundEnabled) playCompletionChime();
              triggerHapticFeedback([300, 150, 300]);
              onSessionComplete?.('pomodoro', workInterval * 60);
            } else {
              if (soundEnabled) playCompletionChime();
              triggerHapticFeedback([200, 100, 200]);
            }

            const nextPhase = completedPhase === 'work' ? 'break' : 'work';
            setPhase(nextPhase);
            setIsRunning(false);
            return nextPhase === 'work' ? workInterval * 60 : breakInterval * 60;
          }
          if (soundEnabled && prev % 10 === 0) {
            playTickSound();
          }
          return prev - 1;
        });
      } else {
        setStopwatchSeconds(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode, phase, workInterval, breakInterval, soundEnabled, onSessionComplete]);

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'pomodoro') {
      setPhase('work');
      setSecondsLeft(workInterval * 60);
    } else {
      setStopwatchSeconds(0);
    }
  };

  const handleStopStopwatch = () => {
    if (stopwatchSeconds >= 10) {
      if (soundEnabled) playCompletionChime();
      triggerHapticFeedback();
      onSessionComplete?.('stopwatch', stopwatchSeconds);
    }
    setStopwatchSeconds(0);
    setIsRunning(false);
  };

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = mode === 'pomodoro' ? secondsLeft / totalSeconds : 1;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex gap-1.5 rounded-2xl bg-muted p-1">
          <button
            onClick={() => setMode('pomodoro')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all',
              mode === 'pomodoro' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
            )}
          >
            <Timer className="h-4 w-4" /> Pomodoro
          </button>
          <button
            onClick={() => setMode('stopwatch')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all',
              mode === 'stopwatch' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
            )}
          >
            <Stopwatch className="h-4 w-4" /> Stopwatch
          </button>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card transition-colors',
            soundEnabled ? 'text-primary' : 'text-muted-foreground/50'
          )}
          title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
      </div>

      <div className="relative">
        <svg className="h-72 w-72 -rotate-90" viewBox="0 0 280 280">
          <circle cx="140" cy="140" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted" />
          <motion.circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            className={phase === 'break' ? 'text-emerald-500' : 'text-primary'}
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {mode === 'pomodoro' && (
            <span className={cn(
              'mb-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider',
              phase === 'break' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'
            )}>
              {phase === 'work' ? 'Focus' : 'Break'}
            </span>
          )}
          <span className="font-heading text-5xl font-extrabold tabular-nums text-foreground">
            {formatTime(mode === 'pomodoro' ? secondsLeft : stopwatchSeconds)}
          </span>
          <span className="mt-2 text-xs font-medium text-muted-foreground">
            {mode === 'pomodoro'
              ? `${phase === 'work' ? workInterval : breakInterval} min ${phase === 'work' ? 'focus' : 'break'}`
              : 'elapsed time'}
          </span>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={handleReset}
          className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground transition-transform active:scale-90 hover:text-foreground"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="flex h-16 items-center gap-2 rounded-2xl bg-primary px-8 text-primary-foreground font-semibold shadow-lg shadow-primary/30 transition-transform active:scale-95 hover:brightness-110"
        >
          {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
          {isRunning ? 'Pause' : 'Start'}
        </button>
        {mode === 'stopwatch' && stopwatchSeconds > 0 && (
          <button
            onClick={handleStopStopwatch}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card text-emerald-500 transition-transform active:scale-90"
            title="Log Session"
          >
            <Check className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}