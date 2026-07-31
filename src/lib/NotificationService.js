import { toast } from 'sonner';
import { getRandomQuote } from './quotes';

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
    const phrases = [
      "Get back to what matters. Your goals won't achieve themselves.",
      "Every minute on distractions is a minute NOT building your future.",
      "Is this moving you closer to your goal? Didn't think so.",
      "REFOCUS. Your future self is watching.",
    ];
    const msg = phrases[Math.floor(Math.random() * phrases.length)];
    playCompletionChime();
    this.sendNotification(`Stay Focused! (${appName} detected)`, msg, '⚡');
  }

  static checkSleepSchedule(sleepTime, wakeTime) {
    const now = new Date();
    const currentHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (currentHM === sleepTime) {
      this.sendNotification('Bedtime Reminder 🌙', 'Time to wind down for a restful sleep. Tomorrow is another step toward your goals!', '😴');
    } else if (currentHM === wakeTime) {
      this.sendNotification('Wake Up Champion! ☀️', 'Good morning! Start your day with focus and determination.', '🌅');
    }
  }

  /**
   * Send a goal countdown notification.
   * @param {string} goalTitle  - The user’s goal text
   * @param {string|null} deadline - ISO date string e.g. '2025-12-31'
   */
  static sendGoalCountdown(goalTitle, deadline) {
    if (!goalTitle) return;

    let message;
    if (deadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(deadline);
      end.setHours(0, 0, 0, 0);
      const daysLeft = Math.round((end - today) / 86400000);

      if (daysLeft < 0) {
        message = `Your deadline for "${goalTitle}" has passed. RESET and try again — failure is just a detour! 💪`;
      } else if (daysLeft === 0) {
        message = `TODAY is the day! You committed to: "${goalTitle}". MAKE IT HAPPEN. 🔥`;
      } else {
        const templates = [
          `Only ${daysLeft} DAYS left to ${goalTitle}. YOU CAN DO IT! 💪`,
          `${daysLeft} days remaining to ${goalTitle}. STAY THE COURSE! 🔥`,
          `Your goal: ${goalTitle} — ${daysLeft} days left. DON'T STOP NOW! 🚀`,
          `${daysLeft} days. One goal: ${goalTitle}. Every hour counts. GET MOVING! ⚡`,
          `The clock is ticking — ${daysLeft} days to ${goalTitle}. OUTWORK EVERYONE! 🏆`,
        ];
        message = templates[Math.floor(Math.random() * templates.length)];
      }
    } else {
      const phrases = [
        `Still committed to: "${goalTitle}"? PROVE IT today. 💪`,
        `Your goal: "${goalTitle}" — what are you doing TODAY to get there? 🔥`,
        `Every day you delay is a day you could have been working on: ${goalTitle}. START NOW! ⚡`,
      ];
      message = phrases[Math.floor(Math.random() * phrases.length)];
    }

    this.sendNotification('LOVE MEEE — Goal Check-In', message, '🎯');
    return message;
  }

  /**
   * Send countdown only once per day (checks localStorage gate).
   * Call this from AppContext after loading the goal.
   */
  static sendGoalCountdownIfNeeded(goal) {
    if (!goal?.title) return;
    const key = 'love_meee_last_countdown_date';
    const today = new Date().toISOString().split('T')[0];
    const last = localStorage.getItem(key);
    if (last === today) return; // already sent today
    localStorage.setItem(key, today);
    // Slight delay so app finishes loading first
    setTimeout(() => {
      this.sendGoalCountdown(goal.title, goal.deadline);
    }, 3000);
  }

  /**
   * Send a native notification about the daily reel.
   * Clicking it dispatches 'love-meee-play-reel' custom event so the reel
   * plays immediately if the app tab is open, or sets a sessionStorage flag
   * so it auto-plays on the next page load.
   * @param {string} reelTitle - title of the featured reel
   */
  static sendReelNotification(reelTitle = 'Your daily motivation') {
    const body = `"${reelTitle}" — tap to play your motivational reel! 🔥`;

    // Toast with play action (visible inside app)
    toast('🎬 Daily Reel Ready', {
      description: body,
      duration: 8000,
      action: {
        label: '▶ Play Now',
        onClick: () => window.dispatchEvent(new CustomEvent('love-meee-play-reel')),
      },
    });

    // Native OS notification (visible even when app is in background)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification('🎬 LOVE MEEE — Daily Reel', {
          body,
          icon: '/favicon.ico',
          tag: 'love-meee-reel',
        });
        notif.onclick = () => {
          // Bring tab to foreground
          window.focus();
          // If app is already mounted — fire event directly
          window.dispatchEvent(new CustomEvent('love-meee-play-reel'));
          // Also set sessionStorage flag in case the page isn't mounted yet
          sessionStorage.setItem('love_meee_autoplay_reel', '1');
        };
      } catch (e) {
        console.warn('Reel notification failed:', e);
      }
    }
  }

  /**
   * Send a daily reel notification once per day.
   * Call from AppContext after reels are loaded.
   * @param {string} reelTitle
   */
  static sendReelNotificationIfNeeded(reelTitle) {
    const key = 'love_meee_last_reel_notif';
    const today = new Date().toISOString().split('T')[0];
    if (localStorage.getItem(key) === today) return;
    localStorage.setItem(key, today);
    // Delay so the app finishes rendering first
    setTimeout(() => this.sendReelNotification(reelTitle), 6000);
  }
}
