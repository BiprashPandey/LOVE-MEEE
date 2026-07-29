import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/AppContext';
import { toast } from 'sonner';
import {
  Dumbbell, Briefcase, GraduationCap, Sparkles, Palette, HeartPulse, Wallet, Users,
  ArrowRight, ArrowLeft, Moon, Sun, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'career', label: 'Career', icon: Briefcase },
  { id: 'education', label: 'Learning', icon: GraduationCap },
  { id: 'mindfulness', label: 'Mindfulness', icon: Sparkles },
  { id: 'creativity', label: 'Creativity', icon: Palette },
  { id: 'health', label: 'Health', icon: HeartPulse },
  { id: 'finance', label: 'Finance', icon: Wallet },
  { id: 'social', label: 'Social', icon: Users },
];

const distractingApps = [
  'Instagram', 'TikTok', 'YouTube', 'Twitter/X', 'Facebook',
  'Snapchat', 'Reddit', 'Netflix', 'Discord', 'Games',
];

const steps = ['Welcome', 'Your Goal', 'Distracting Apps', 'Sleep Schedule'];

export default function Onboarding() {
  const { goal, saveGoal } = useApp();
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState('');
  const [goalText, setGoalText] = useState('');
  const [selectedApps, setSelectedApps] = useState([]);
  const [sleepTime, setSleepTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (goal) {
      setCategory(goal.goal_category || '');
      setGoalText(goal.primary_goal || '');
      setSelectedApps(goal.monitored_apps || []);
      setSleepTime(goal.sleep_time || '23:00');
      setWakeTime(goal.wake_time || '07:00');
    }
  }, [goal]);

  const toggleApp = (app) => {
    setSelectedApps(prev =>
      prev.includes(app) ? prev.filter(a => a !== app) : [...prev, app]
    );
  };

  const canProceed = () => {
    if (step === 1) return category !== '';
    if (step === 2) return selectedApps.length > 0;
    return true;
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await saveGoal({
        primary_goal: goalText.trim() || `Focus on ${categories.find(c => c.id === category)?.label || 'my goals'}`,
        goal_category: category || 'career',
        monitored_apps: selectedApps,
        sleep_time: sleepTime,
        wake_time: wakeTime,
        work_interval: 25,
        break_interval: 5,
      });
      toast.success("You're all set! Let's go! 🚀");
      navigate('/', { replace: true });
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col px-6">
        {step > 0 && (
          <div className="flex items-center gap-2 pt-6">
            {steps.slice(1).map((s, i) => (
              <div
                key={s}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  i < step ? 'bg-primary' : 'bg-muted'
                )}
              />
            ))}
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center py-8">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-rose-400 shadow-xl shadow-primary/30"
                >
                  <HeartPulse className="h-12 w-12 text-white" />
                </motion.div>
                <h1 className="font-heading text-4xl font-extrabold text-foreground tracking-tight">
                  LOVE MEEE
                </h1>
                <p className="mt-3 text-base text-muted-foreground max-w-xs">
                  Your personal productivity & motivation companion. Build streaks, crush goals, and become your best self.
                </p>
                <button
                  onClick={() => setStep(1)}
                  className="mt-10 flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-primary-foreground font-semibold shadow-lg shadow-primary/30 transition-transform active:scale-95"
                >
                  Get Started <ArrowRight className="h-5 w-5" />
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="goal"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                <h2 className="font-heading text-2xl font-bold text-foreground mb-1">What's your main goal?</h2>
                <p className="text-sm text-muted-foreground mb-6">Pick the area you want to focus on most.</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {categories.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setCategory(id)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-2xl border-2 p-5 transition-all active:scale-95',
                        category === id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/30'
                      )}
                    >
                      <Icon className="h-7 w-7" />
                      <span className="text-sm font-semibold">{label}</span>
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">Describe your goal (optional)</label>
                  <input
                    type="text"
                    value={goalText}
                    onChange={e => setGoalText(e.target.value)}
                    placeholder="e.g. Run a 5K, learn Spanish, write a book..."
                    className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="apps"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                <h2 className="font-heading text-2xl font-bold text-foreground mb-1">What distracts you?</h2>
                <p className="text-sm text-muted-foreground mb-6">Select apps you want to monitor. We'll send pattern-interrupt nudges when you use them too long.</p>
                <div className="flex flex-wrap gap-2">
                  {distractingApps.map(app => (
                    <button
                      key={app}
                      onClick={() => toggleApp(app)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-medium transition-all active:scale-90',
                        selectedApps.includes(app)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-muted-foreground hover:border-primary/30'
                      )}
                    >
                      {selectedApps.includes(app) && <Check className="h-3.5 w-3.5" />}
                      {app}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="sleep"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                <h2 className="font-heading text-2xl font-bold text-foreground mb-1">Sleep schedule</h2>
                <p className="text-sm text-muted-foreground mb-6">Set your sleep and wake times for routine reminders.</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10">
                      <Moon className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">Bedtime</p>
                      <p className="text-xs text-muted-foreground">Wind down & sleep</p>
                    </div>
                    <input
                      type="time"
                      value={sleepTime}
                      onChange={e => setSleepTime(e.target.value)}
                      className="rounded-xl border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                      <Sun className="h-6 w-6 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">Wake up</p>
                      <p className="text-xs text-muted-foreground">Start your day</p>
                    </div>
                    <input
                      type="time"
                      value={wakeTime}
                      onChange={e => setWakeTime(e.target.value)}
                      className="rounded-xl border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step > 0 && (
          <div className="flex items-center gap-3 pb-8">
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1.5 rounded-2xl border border-border bg-card px-5 py-3.5 text-sm font-semibold text-muted-foreground transition-transform active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              disabled={!canProceed() || saving}
              onClick={() => step === 3 ? handleFinish() : setStep(s => s + 1)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95 disabled:opacity-40"
            >
              {saving ? 'Saving...' : step === 3 ? 'Complete Setup' : 'Continue'}
              {step !== 3 && !saving && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}