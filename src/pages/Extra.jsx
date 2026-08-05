import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DistractionMonitor from '@/components/DistractionMonitor';
import SleepSchedule from '@/components/SleepSchedule';
import QuoteCard from '@/components/QuoteCard';
import ThemeToggle from '@/components/ThemeToggle';
import { useApp } from '@/lib/AppContext';
import { Check, Upload, Shield, ShieldCheck, Clock, X, FileText, Mail, AlertCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';

// ── Theme Picker ─────────────────────────────────────────────────────────────
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

// ── Reel Upload & Review Section ─────────────────────────────────────────────
function ReelSubmissionSection() {
  const { addReel } = useApp();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [submissions, setSubmissions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('love_meee_submitted_reels') || '[]'); }
    catch { return []; }
  });
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    localStorage.setItem('love_meee_submitted_reels', JSON.stringify(submissions));
  }, [submissions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    if (!cleanUrl) return;

    const lower = cleanUrl.toLowerCase();
    const isYouTube = lower.includes('youtube.com/shorts/') || lower.includes('youtu.be/') || lower.includes('youtube.com/watch');

    if (!isYouTube) {
      toast.error('Only YouTube Shorts URLs are allowed! ❌', {
        description: 'Please enter a valid YouTube Shorts link (e.g. https://www.youtube.com/shorts/...). Instagram links are not accepted.',
      });
      return;
    }

    const newSubmission = {
      id: 'sub_' + Date.now(),
      url: cleanUrl,
      title: title.trim() || 'Motivational YouTube Short',
      status: 'pending_review',
      created_at: new Date().toISOString(),
    };
    setSubmissions(prev => [newSubmission, ...prev]);
    setUrl('');
    setTitle('');
    toast.info('YouTube Short submitted! Held for review ⏳', {
      description: 'Once approved by moderators, it will be visible to all viewers.',
    });
  };

  const handleApprove = async (sub) => {
    try {
      await addReel(sub.url, sub.title);
      setSubmissions(prev => prev.map(s => s.id === sub.id ? { ...s, status: 'approved' } : s));
      toast.success(`Short "${sub.title}" approved and added to main pool! 🎉`);
    } catch {
      toast.error('Failed to approve reel');
    }
  };

  const handleReject = (id) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'rejected' } : s));
    toast.info('Reel submission rejected');
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground">Upload YouTube Shorts</h3>
            <p className="text-xs text-muted-foreground">Submit YouTube Shorts links for community motivation</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdminPanel(!showAdminPanel)}
          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-border bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          {showAdminPanel ? 'User View' : 'Moderator Panel'}
        </button>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
            YouTube Shorts URL (YouTube only)
          </label>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/shorts/..."
            required
            className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Reel Title (e.g. Never Give Up)"
            className="flex-1 rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!url.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 disabled:opacity-40 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" /> Submit
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2.5">
        <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-500/90 leading-relaxed">
          Submissions are <strong>held for review</strong> to ensure content is strictly motivational. Approved reels become available to all viewers.
        </p>
      </div>

      {/* Submissions List */}
      {submissions.length > 0 && (
        <div className="pt-2 border-t border-border space-y-2">
          <h4 className="text-xs font-bold text-foreground">Your Submissions</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
            {submissions.map(sub => (
              <div key={sub.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-2.5">
                <div className="min-w-0 flex-1 mr-2">
                  <p className="text-xs font-bold text-foreground truncate">{sub.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{sub.url}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {sub.status === 'pending_review' && (
                    <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                      ⏳ Held for Review
                    </span>
                  )}
                  {sub.status === 'approved' && (
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                      ✓ Approved & Live
                    </span>
                  )}
                  {sub.status === 'rejected' && (
                    <span className="rounded-full bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-500">
                      ✕ Rejected
                    </span>
                  )}

                  {/* Moderator Actions */}
                  {showAdminPanel && sub.status === 'pending_review' && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleApprove(sub)}
                        className="rounded-lg bg-emerald-500 text-white px-2 py-1 text-[10px] font-bold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(sub.id)}
                        className="rounded-lg bg-rose-500 text-white px-2 py-1 text-[10px] font-bold"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Terms & Conditions Modal ──────────────────────────────────────────────────
function TermsAndConditionsModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="font-heading text-lg font-extrabold text-foreground">Terms & Copyright Policy</h2>
            </div>
            <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
            <section className="space-y-1">
              <h3 className="font-bold text-foreground text-sm">1. Terms of Service</h3>
              <p>
                By using <strong>LOVE MEEE</strong>, you agree to comply with our community guidelines. LOVE MEEE provides personal goal tracking, productivity tools, and curated motivational content designed for self-improvement.
              </p>
            </section>

            <section className="space-y-1">
              <h3 className="font-bold text-foreground text-sm">2. Content Submission & Moderation</h3>
              <p>
                All user-submitted reels are held for moderation review before being published. Content containing violence, explicit material, hate speech, or non-motivational media will be rejected.
              </p>
            </section>

            <section className="space-y-1.5 rounded-2xl border border-primary/20 bg-primary/5 p-3.5">
              <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
                <Mail className="h-4 w-4" />
                <span>3. Copyright Infringement & DMCA Takedowns</span>
              </div>
              <p className="text-foreground/90">
                LOVE MEEE respects intellectual property rights. If you believe any reel or content hosted on or accessible through our platform infringes your copyright, you may submit a takedown request.
              </p>
              <p className="font-semibold text-primary">
                Send all copyright claims and DMCA notices via email to: <a href="mailto:xyz@lovemeee.com" className="underline font-extrabold">xyz@lovemeee.com</a>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Please include: (a) Identification of copyrighted work, (b) URL of infringing content, and (c) Your contact details.
              </p>
            </section>

            <section className="space-y-1">
              <h3 className="font-bold text-foreground text-sm">4. Privacy Policy</h3>
              <p>
                Your goals, daily tasks, focus logs, and notes are stored locally on your device. We respect user privacy and do not sell your personal data.
              </p>
            </section>
          </div>

          <button
            onClick={onClose}
            className="w-full rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20"
          >
            I Agree & Understand
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function Extra() {
  const { goal } = useApp();
  const [showTerms, setShowTerms] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold text-foreground">Extra</h1>
        <ThemeToggle />
      </div>

      <ThemePicker />

      <ReelSubmissionSection />

      <QuoteCard />

      <DistractionMonitor monitoredApps={goal?.distracting_apps || goal?.monitored_apps || []} />

      <div>
        <h2 className="font-heading text-lg font-bold text-foreground mb-3">Sleep Schedule</h2>
        <SleepSchedule
          sleepTime={goal?.sleep_time || '23:00'}
          wakeTime={goal?.wake_time || '07:00'}
        />
      </div>

      {/* Terms & Copyright Button */}
      <div className="pt-2 border-t border-border text-center">
        <button
          onClick={() => setShowTerms(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors py-2"
        >
          <FileText className="h-3.5 w-3.5" /> Terms & Conditions & Copyright Policy
        </button>
      </div>

      <TermsAndConditionsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </motion.div>
  );
}
