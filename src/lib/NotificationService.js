import { toast } from 'sonner';
import { getRandomQuote, getRandomInterrupt } from './quotes';

// Audio Context Singleton for synthesized chimes & tick sounds (no external files needed)
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playCompletionChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Harmony notes: C5, E5, G5, C6 (Success Fanfare)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.12);
      
      gain.gain.setValueAtTime(0.3, now + index * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + index * 0.12);
      osc.stop(now + index * 0.12 + 0.6);
    });
  } catch (e) {
    console.error('Audio playback failed:', e);
  }
}

export function playTickSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.03);
  } catch (e) {}
}

export function triggerHapticFeedback(pattern = [200, 100, 200]) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }
}

export class NotificationService {
  static permissionGranted = false;

  static async requestPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
      return true;
    }
    if (Notification.permission !== 'denied') {
      const status = await Notification.requestPermission();
      this.permissionGranted = status === 'granted';
      return this.permissionGranted;
    }
    return false;
  }

  static sendNotification(title, body, icon = '🌟') {
    // 1. Trigger haptic & chime audio
    triggerHapticFeedback();
    
    // 2. Display Toast in app
    toast(title, {
      description: body,
      icon: icon,
      duration: 6000,
    });

    // 3. Display Native Web Notification if available and permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          vibrate: [200, 100, 200],
        });
      } catch (e) {
        console.warn('Native notification failed:', e);
      }
    }
  }

  static sendMotivationalPush() {
    const q = getRandomQuote();
    this.sendNotification("LOVE MEEE Motivation", `"${q.text}" — ${q.author}`, '🔥');
  }

  static sendDistractionAlert(appName = 'a monitored app') {
    const msg = getRandomInterrupt();
    playCompletionChime();
    this.sendNotification(`Distraction Alert (${appName})`, msg, '⚡');
  }

  static checkSleepSchedule(sleepTime, wakeTime) {
    const now = new Date();
    const currentHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (currentHM === sleepTime) {
      this.sendNotification("Bedtime Reminder 🌙", "Time to wind down for a restful sleep. Tomorrow is another step toward your goals!", "😴");
    } else if (currentHM === wakeTime) {
      this.sendNotification("Wake Up Champion! ☀️", "Good morning! Start your day with focus and determination.", "🌅");
    }
  }
}
