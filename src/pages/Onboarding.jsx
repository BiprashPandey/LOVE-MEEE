import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/AppContext';
import {
  Sparkles, ArrowRight, ArrowLeft, Target, Moon, Sun,
  Check, AlertTriangle, Palette,
} from 'lucide-react';

// ── Step config ────────────────────────────────────────────────────────────
const STEPS = ['Your Name', 'App Theme', 'Your Goal', 'Distractions', 'Sleep Schedule'];

const EXAMPLES = [
  'earn $1,000,000', 'get an A grade in every exam', 'lose 20 pounds',
  'launch my own business', 'run a full marathon', 'read 24 books this year',
  'get into my dream university', 'save $10,000', 'learn to code fluently',
];

const DISTRACTION_APPS = [
  'Instagram', 'TikTok', 'YouTube', 'Twitter / X', 'Facebook',
  'Snapchat', 'Reddit', 'Netflix', 'Discord', 'Games',
];

const THEME_OPTIONS = [
  {
    id: 'pink-red',
    name: 'Pink-Red',
    desc: 'Rose & Fuchsia glow (Default)',
    previewBg: 'linear-gradient(135deg, #e11d48, #ec4899)',
    border: '#f43f5e',
  },
  {
    id: 'green',
    name: 'Green',
    desc: 'Emerald & Mint focus',
    previewBg: 'linear-gradient(135deg, #059669, #10b981)',
    border: '#10b981',
  },
  {
    id: 'golden',
    name: 'Golden',
    desc: 'Amber & Gold energy',
    previewBg: 'linear-gradient(135deg, #d97706, #f59e0b)',
    border: '#f59e0b',
  },
];

// ── Gradient text helper ───────────────────────────────────────────────────
const gradStyle = {
  background: 'linear-gradient(90deg, #e879f9, #f9a8d4, #fde68a)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

// ── Step indicator ─────────────────────────────────────────────────────────
function StepDots({ current }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300"
            style={{
              background: i <= current
                ? 'linear-gradient(135deg, #a855f7, #ec4899)'
                : 'rgba(255,255,255,0.08)',
              color: i <= current ? '#fff' : 'rgba(255,255,255,0.3)',
            }}
          >
            {i < current ? <Check className="h-3 w-3" /> : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div className="h-px w-4 rounded-full transition-all duration-300"
              style={{ background: i < current ? '#a855f7' : 'rgba(255,255,255,0.1)' }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Step 0: Name ────────────────────────────────────────────────
function NameStep({ name, setName, onNext }) {
  return (
    <motion.div key="name" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
      <div className="mb-6 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl text-xl">👋</span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Step 1</p>
          <h2 className="text-base font-bold text-white">What's your name?</h2>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-sm text-white/50 mb-4 leading-relaxed">
            We'll use your name to personalize your daily experience — greeting you every morning and keeping you accountable.
          </p>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Alex, Jordan, Sam…"
            autoFocus
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-lg font-bold text-white placeholder-white/20 focus:outline-none focus:border-fuchsia-500 transition-colors"
          />
        </div>

        <button
          onClick={onNext}
          disabled={!name.trim()}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black text-white disabled:opacity-30 transition-all"
          style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', boxShadow: name ? '0 8px 32px rgba(168,85,247,0.4)' : undefined }}
        >
          Let's go <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Step 1: Theme ──────────────────────────────────────────────────────────
function ThemeStep({ selectedTheme, setSelectedTheme, onNext, onBack }) {
  const { changeTheme } = useApp();

  const handleSelect = (id) => {
    setSelectedTheme(id);
    changeTheme?.(id);
  };

  return (
    <motion.div key="theme" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
      <div className="mb-6 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
          <Palette className="h-5 w-5 text-white" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Step 2</p>
          <h2 className="text-base font-bold text-white">Choose your app theme</h2>
        </div>
      </div>

      <p className="text-sm text-white/50 mb-5 leading-relaxed">
        Select the theme for your app interface. You can change this anytime later in Extra settings.
      </p>

      <div className="space-y-3 mb-6">
        {THEME_OPTIONS.map(opt => {
          const isSelected = selectedTheme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.id)}
              className="w-full flex items-center justify-between rounded-2xl border p-4 transition-all active:scale-98"
              style={{
                borderColor: isSelected ? opt.border : 'rgba(255,255,255,0.1)',
                background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                boxShadow: isSelected ? `0 0 20px ${opt.border}33` : undefined,
              }}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="h-8 w-8 rounded-xl flex-shrink-0 shadow-md"
                  style={{ background: opt.previewBg }}
                />
                <div className="text-left">
                  <p className="text-sm font-bold text-white">{opt.name}</p>
                  <p className="text-xs text-white/40">{opt.desc}</p>
                </div>
              </div>
              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-white bg-white text-black' : 'border-white/20'}`}>
                {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
          Next <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Step 2: Goal ───────────────────────────────────────────────────────────
function GoalStep({ goalText, setGoalText, deadline, setDeadline, onNext, onBack }) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <motion.div key="goal" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
      <div className="mb-6 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
          <Target className="h-5 w-5 text-white" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Step 3</p>
          <h2 className="text-base font-bold text-white">Set your commitment</h2>
        </div>
      </div>

      <div className="space-y-6">
        {/* Fill-in-blank */}
        <div className="space-y-4">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xl font-black text-white/70 whitespace-nowrap">I will</span>
            <div className="flex-1 min-w-[160px]">
              <input
                type="text"
                value={goalText}
                onChange={e => setGoalText(e.target.value)}
                placeholder="earn $1M · get an A grade · run a marathon"
                autoFocus
                className="w-full rounded-xl border-0 border-b-2 bg-transparent pb-1 text-lg font-bold text-white placeholder-white/20 focus:outline-none transition-colors"
                style={{ borderBottomColor: goalText ? '#a855f7' : 'rgba(255,255,255,0.15)' }}
              />
            </div>
          </div>

          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xl font-black text-white/70 whitespace-nowrap">by</span>
            <div className="relative flex-1 min-w-[150px]">
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                min={today}
                className="w-full rounded-xl border-0 border-b-2 bg-transparent pb-1 text-lg font-bold text-white focus:outline-none transition-colors"
                style={{
                  borderBottomColor: deadline ? '#ec4899' : 'rgba(255,255,255,0.15)',
                  colorScheme: 'dark',
                }}
              />
              {!deadline && (
                <span className="pointer-events-none absolute left-0 top-0 text-lg font-bold text-white/20">
                  [optional date]
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Specificity warning */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <p className="text-xs font-semibold text-amber-400/90 leading-relaxed">
            ⚡ Be <span className="uppercase font-black">specific</span>. Not "be successful" —
            what <em>exactly</em> will you achieve?
          </p>
        </div>

        {/* Example chips */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">Tap an example</p>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map(ex => (
              <button key={ex} type="button" onClick={() => setGoalText(ex)}
                className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold text-white/40 hover:border-fuchsia-500/50 hover:text-fuchsia-300 transition-all active:scale-95">
                {ex}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onBack}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={onNext}
            disabled={!goalText.trim()}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black text-white disabled:opacity-30 transition-all"
            style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', boxShadow: goalText ? '0 8px 32px rgba(168,85,247,0.4)' : undefined }}
          >
            Next <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Step 3: Distractions ───────────────────────────────────────────────────
function DistractionsStep({ selected, setSelected, onNext, onBack }) {
  const toggle = (app) =>
    setSelected(prev => prev.includes(app) ? prev.filter(a => a !== app) : [...prev, app]);

  return (
    <motion.div key="dist" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
      <div className="mb-6 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
          <AlertTriangle className="h-5 w-5 text-white" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Step 4</p>
          <h2 className="text-base font-bold text-white">Your distractions</h2>
        </div>
      </div>

      <p className="text-sm text-white/50 mb-5 leading-relaxed">
        Which apps pull you away from your goal? We'll remind you to refocus when you're distracted.
      </p>

      <div className="grid grid-cols-2 gap-2 mb-6">
        {DISTRACTION_APPS.map(app => {
          const on = selected.includes(app);
          return (
            <button key={app} onClick={() => toggle(app)}
              className="flex items-center gap-2 rounded-xl border p-3 text-left text-xs font-semibold transition-all active:scale-95"
              style={{
                borderColor: on ? '#a855f7' : 'rgba(255,255,255,0.08)',
                background: on ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.03)',
                color: on ? '#e879f9' : 'rgba(255,255,255,0.5)',
              }}>
              {on && <Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#e879f9' }} />}
              <span className={on ? '' : 'ml-5'}>{app}</span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
          Next <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Step 4: Sleep schedule ─────────────────────────────────────────────────
function SleepStep({ sleepTime, setSleepTime, wakeTime, setWakeTime, onFinish, onBack, saving }) {
  return (
    <motion.div key="sleep" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
      <div className="mb-6 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <Moon className="h-5 w-5 text-white" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Step 5</p>
          <h2 className="text-base font-bold text-white">Sleep schedule</h2>
        </div>
      </div>

      <p className="text-sm text-white/50 mb-6 leading-relaxed">
        We'll send you a bedtime reminder and a morning boost notification. Both are optional.
      </p>

      <div className="space-y-4 mb-7">
        {/* Bedtime */}
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Moon className="h-4 w-4 text-indigo-400" />
            <p className="text-xs font-bold text-white/70">Bedtime reminder</p>
          </div>
          <input
            type="time"
            value={sleepTime}
            onChange={e => setSleepTime(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-indigo-500 transition-colors"
            style={{ colorScheme: 'dark' }}
          />
        </div>

        {/* Wake time */}
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sun className="h-4 w-4 text-amber-400" />
            <p className="text-xs font-bold text-white/70">Morning wake-up boost</p>
          </div>
          <input
            type="time"
            value={wakeTime}
            onChange={e => setWakeTime(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-amber-500 transition-colors"
            style={{ colorScheme: 'dark' }}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button onClick={onFinish} disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-white shadow-2xl transition-all disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
            boxShadow: '0 8px 32px rgba(168,85,247,0.4)',
          }}>
          {saving ? 'Setting up…' : (<>Start LOVE MEEE <Sparkles className="h-4 w-4" /></>)}
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Onboarding ────────────────────────────────────────────────────────
export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveGoal, changeTheme, appTheme } = useApp();

  const [step, setStep] = useState(0);
  const [name, setName] = useState(() => user?.name || '');
  const [selectedTheme, setSelectedTheme] = useState(appTheme || 'pink-red');
  const [goalText, setGoalText] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedApps, setSelectedApps] = useState([]);
  const [sleepTime, setSleepTime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);
    try {
      if (name.trim()) localStorage.setItem('love_meee_user_name', name.trim());
      changeTheme?.(selectedTheme);
      await saveGoal({
        title: goalText.trim(),
        deadline: deadline || null,
        distracting_apps: selectedApps,
        sleep_time: sleepTime,
        wake_time: wakeTime,
        user_name: name.trim(),
        theme: selectedTheme,
        created_date: new Date().toISOString(),
      });
      navigate('/');
    } catch {
      setSaving(false);
    }
  };

  const handleSkip = () => navigate('/');

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #09090b 0%, #18051a 55%, #09090b 100%)' }}
    >
      {/* Glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
            <Sparkles className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-black tracking-tight" style={gradStyle}>LOVE MEEE</h1>
          <p className="mt-1 text-xs text-white/40">Let's set up your productivity companion</p>
        </div>

        {/* Step dots */}
        <StepDots current={step} />

        {/* Card */}
        <div className="rounded-3xl border border-white/8 p-6 shadow-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)' }}>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <NameStep name={name} setName={setName} onNext={() => setStep(1)} />
            )}
            {step === 1 && (
              <ThemeStep
                selectedTheme={selectedTheme} setSelectedTheme={setSelectedTheme}
                onNext={() => setStep(2)} onBack={() => setStep(0)}
              />
            )}
            {step === 2 && (
              <GoalStep
                goalText={goalText} setGoalText={setGoalText}
                deadline={deadline} setDeadline={setDeadline}
                onNext={() => setStep(3)} onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <DistractionsStep
                selected={selectedApps} setSelected={setSelectedApps}
                onNext={() => setStep(4)} onBack={() => setStep(2)}
              />
            )}
            {step === 4 && (
              <SleepStep
                sleepTime={sleepTime} setSleepTime={setSleepTime}
                wakeTime={wakeTime} setWakeTime={setWakeTime}
                onFinish={handleFinish} onBack={() => setStep(3)}
                saving={saving}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Skip */}
        <button onClick={handleSkip}
          className="mt-5 w-full text-center text-xs text-white/20 hover:text-white/40 transition-colors py-2">
          Skip setup — I'll configure later
        </button>
      </motion.div>
    </div>
  );
}