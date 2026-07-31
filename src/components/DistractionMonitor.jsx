import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, AlertTriangle, ShieldCheck, Play, Square, Sparkles, Pencil, Plus, X, Check } from 'lucide-react';
import { NotificationService, triggerHapticFeedback, playCompletionChime } from '@/lib/NotificationService';
import { getRandomInterrupt } from '@/lib/quotes';
import { useApp } from '@/lib/AppContext';
import { cn } from '@/lib/utils';

export default function DistractionMonitor({ monitoredApps = [] }) {
  const { goal, saveGoal } = useApp();
  const [activeApp, setActiveApp] = useState(null);
  const [usageSeconds, setUsageSeconds] = useState(0);
  const [interrupted, setInterrupted] = useState(false);
  const [interruptMsg, setInterruptMsg] = useState('');
  const timerRef = useRef(null);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editApps, setEditApps] = useState([]);
  const [newApp, setNewApp] = useState('');
  const [saving, setSaving] = useState(false);

  const defaultApps = ['Instagram', 'TikTok', 'YouTube', 'Twitter/X'];
  // Use live goal apps if available
  const liveApps = goal?.distracting_apps || goal?.monitored_apps || monitoredApps;
  const appsToDisplay = liveApps.length > 0 ? liveApps : defaultApps;

  const startEditing = () => {
    setEditApps([...appsToDisplay]);
    setEditing(true);
  };

  const removeApp = (app) => setEditApps(prev => prev.filter(a => a !== app));

  const addApp = () => {
    const trimmed = newApp.trim();
    if (trimmed && !editApps.includes(trimmed)) {
      setEditApps(prev => [...prev, trimmed]);
    }
    setNewApp('');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveGoal({ ...goal, distracting_apps: editApps });
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (activeApp) {
      timerRef.current = setInterval(() => {
        setUsageSeconds(prev => {
          const next = prev + 1;
          // Trigger intervention every 10 seconds of simulated usage
          if (next > 0 && next % 10 === 0) {
            triggerIntervention(activeApp);
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setUsageSeconds(0);
    }

    return () => clearInterval(timerRef.current);
  }, [activeApp]);

  const triggerIntervention = (appName) => {
    const msg = getRandomInterrupt();
    setInterruptMsg(msg);
    setInterrupted(true);
    playCompletionChime();
    triggerHapticFeedback([400, 200, 400, 200, 400]);
    NotificationService.sendDistractionAlert(appName);
  };

  const handleStopApp = () => {
    setActiveApp(null);
    setInterrupted(false);
    setUsageSeconds(0);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground">Distraction Shield</h3>
            <p className="text-xs text-muted-foreground">Simulate prolonged app usage &amp; pattern interrupt</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!editing && (
            <button onClick={startEditing}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              <Pencil className="h-3 w-3" /> Edit
            </button>
          )}
          {activeApp ? (
            <span className="flex items-center gap-1 text-xs font-bold text-rose-500 animate-pulse bg-rose-500/10 px-2.5 py-1 rounded-full">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span> Active
            </span>
          ) : (
            !editing && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5" /> Protected
              </span>
            )
          )}
        </div>
      </div>

      {/* Edit mode: manage app list */}
      {editing && (
        <div className="space-y-2 pt-1">
          <div className="flex flex-wrap gap-2">
            {editApps.map(app => (
              <span key={app}
                className="flex items-center gap-1 rounded-xl bg-muted px-3 py-1.5 text-xs font-semibold text-foreground">
                {app}
                <button onClick={() => removeApp(app)}
                  className="ml-1 text-muted-foreground hover:text-rose-500 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newApp}
              onChange={e => setNewApp(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addApp()}
              placeholder="Add app (e.g. Reddit)"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
            <button onClick={addApp}
              className="flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground disabled:opacity-50">
              <Check className="h-3 w-3" /> {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)}
              className="flex items-center gap-1 rounded-xl bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground">
              Cancel
            </button>
          </div>
        </div>
      )}

      {!activeApp ? (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Select an app to test pattern interrupt detection:</p>
          <div className="flex flex-wrap gap-2">
            {appsToDisplay.map(app => (
              <button
                key={app}
                onClick={() => setActiveApp(app)}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/50 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-primary/10 hover:border-primary/40 transition-all active:scale-95"
              >
                <Play className="h-3 w-3 text-primary fill-current" />
                {app}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Simulating active usage on</p>
              <p className="text-sm font-bold text-foreground">{activeApp}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="font-heading text-lg font-extrabold text-rose-500 tabular-nums">{usageSeconds}s</p>
            </div>
          </div>

          <button
            onClick={handleStopApp}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
          >
            <Square className="h-3.5 w-3.5 fill-current" /> Stop Simulation
          </button>
        </div>
      )}

      {/* Pattern Interrupt Modal Overlay */}
      <AnimatePresence>
        {interrupted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="rounded-2xl border-2 border-rose-500 bg-rose-500/10 p-4 text-center space-y-3 shadow-lg"
          >
            <div className="flex items-center justify-center gap-2 text-rose-500">
              <AlertTriangle className="h-6 w-6 animate-bounce" />
              <span className="font-heading text-base font-extrabold">PATTERN INTERRUPT!</span>
            </div>
            <p className="text-sm font-bold text-foreground leading-snug">{interruptMsg}</p>
            <p className="text-xs text-muted-foreground">
              You've been using <span className="font-semibold text-foreground">{activeApp}</span> for {usageSeconds} seconds. Step back and refocus on your core goals!
            </p>
            <button
              onClick={handleStopApp}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-500/30 transition-transform active:scale-95"
            >
              <Sparkles className="h-4 w-4" /> Break the Loop & Focus
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
