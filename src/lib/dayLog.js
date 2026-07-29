import { storageClient } from '@/api/storageClient';

export function getTodayStr() {
  const d = new Date();
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d - tzOffset).toISOString().split('T')[0];
}

export function dateToStr(date) {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date - tzOffset).toISOString().split('T')[0];
}

export function computeLevel(tasksCompleted, focusMinutes) {
  const score = (tasksCompleted || 0) * 10 + (focusMinutes || 0) * 2;
  if (score >= 80) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 15) return 'low';
  return 'none';
}

export async function updateTodayLog({ tasksDelta = 0, focusDelta = 0 }) {
  const today = getTodayStr();
  try {
    const existing = await storageClient.entities.DayLog.filter({ log_date: today });
    if (existing.length > 0) {
      const log = existing[0];
      const newTasks = (log.tasks_completed || 0) + tasksDelta;
      const newFocus = (log.focus_minutes || 0) + focusDelta;
      await storageClient.entities.DayLog.update(log.id, {
        tasks_completed: newTasks,
        focus_minutes: newFocus,
        productivity_level: computeLevel(newTasks, newFocus),
      });
      return log.id;
    } else {
      const tasks = tasksDelta;
      const focus = focusDelta;
      const created = await storageClient.entities.DayLog.create({
        log_date: today,
        tasks_completed: tasks,
        focus_minutes: focus,
        productivity_level: computeLevel(tasks, focus),
      });
      return created.id;
    }
  } catch (e) {
    console.error('Failed to update day log', e);
  }
}

export function computeStreak(dayLogs) {
  const map = new Map();
  (dayLogs || []).forEach(l => {
    if (l.productivity_level && l.productivity_level !== 'none') {
      map.set(l.log_date, l);
    }
  });
  if (map.size === 0) return 0;

  const today = new Date();
  let cursor = new Date(today);
  const todayStr = getTodayStr();

  // If today has no activity yet, streak is still alive from yesterday
  if (!map.has(todayStr)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (true) {
    const dateStr = dateToStr(cursor);
    if (map.has(dateStr)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function getLongestStreak(dayLogs) {
  const dates = (dayLogs || [])
    .filter(l => l.productivity_level && l.productivity_level !== 'none')
    .map(l => l.log_date)
    .sort();
  if (dates.length === 0) return 0;

  let longest = 1;
  let current = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = Math.round((curr - prev) / 86400000);
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

export const LEVEL_COLORS = {
  high: 'bg-rose-500',
  medium: 'bg-rose-400',
  low: 'bg-rose-300 dark:bg-rose-900',
  none: 'bg-muted',
};