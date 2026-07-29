import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storageClient } from '@/api/storageClient';
import { computeStreak, getLongestStreak, getTodayStr, computeLevel } from './dayLog';
import { NotificationService, playCompletionChime, triggerHapticFeedback } from './NotificationService';
import { toast } from 'sonner';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [goal, setGoal] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [dayLogs, setDayLogs] = useState([]);
  const [notes, setNotes] = useState([]);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAllData = useCallback(async () => {
    try {
      const [goals, allTasks, allSessions, logs, allNotes, allReels] = await Promise.all([
        storageClient.entities.Goal.list('-created_date', 1),
        storageClient.entities.Task.list('-created_date', 100),
        storageClient.entities.FocusSession.list('-created_date', 100),
        storageClient.entities.DayLog.list('-log_date', 400),
        storageClient.entities.Note.list('-created_date', 200),
        storageClient.entities.Reel.list('-created_date', 50),
      ]);

      setGoal(goals[0] || null);
      setTasks(allTasks || []);
      setSessions(allSessions || []);
      setDayLogs(logs || []);
      setNotes(allNotes || []);
      setReels(allReels || []);
    } catch (e) {
      console.error('Failed to load local data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();

    const handleStorageChange = () => {
      loadAllData();
    };
    window.addEventListener('love_meee_storage_change', handleStorageChange);
    return () => {
      window.removeEventListener('love_meee_storage_change', handleStorageChange);
    };
  }, [loadAllData]);

  useEffect(() => {
    NotificationService.requestPermission();
  }, []);

  const updateTodayLog = async ({ tasksDelta = 0, focusDelta = 0 }) => {
    const today = getTodayStr();
    const existing = await storageClient.entities.DayLog.filter({ log_date: today });
    
    if (existing.length > 0) {
      const log = existing[0];
      const newTasks = Math.max(0, (log.tasks_completed || 0) + tasksDelta);
      const newFocus = Math.max(0, (log.focus_minutes || 0) + focusDelta);
      const updated = await storageClient.entities.DayLog.update(log.id, {
        tasks_completed: newTasks,
        focus_minutes: newFocus,
        productivity_level: computeLevel(newTasks, newFocus),
      });
      setDayLogs(prev => prev.map(l => l.id === log.id ? updated : l));
      return updated;
    } else {
      const newTasks = Math.max(0, tasksDelta);
      const newFocus = Math.max(0, focusDelta);
      const created = await storageClient.entities.DayLog.create({
        log_date: today,
        tasks_completed: newTasks,
        focus_minutes: newFocus,
        productivity_level: computeLevel(newTasks, newFocus),
      });
      setDayLogs(prev => [created, ...prev]);
      return created;
    }
  };

  const saveGoal = async (goalData) => {
    try {
      const existing = await storageClient.entities.Goal.list('-created_date', 1);
      let updated;
      if (existing && existing.length > 0) {
        updated = await storageClient.entities.Goal.update(existing[0].id, goalData);
      } else {
        updated = await storageClient.entities.Goal.create(goalData);
      }
      setGoal(updated);
      return updated;
    } catch (e) {
      console.error('Failed to save goal:', e);
      throw e;
    }
  };

  const addTask = async (title, priority = 'medium') => {
    if (!title || !title.trim()) return;
    try {
      const newTask = await storageClient.entities.Task.create({
        title: title.trim(),
        priority,
        completed: false,
      });
      setTasks(prev => [newTask, ...prev]);
      toast.success('Task created! 🎯');
      return newTask;
    } catch (e) {
      toast.error('Failed to create task');
    }
  };

  const toggleTask = async (task) => {
    const isNowCompleted = !task.completed;
    try {
      const updated = await storageClient.entities.Task.update(task.id, {
        completed: isNowCompleted,
        completed_at: isNowCompleted ? new Date().toISOString() : null,
      });
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t));

      await updateTodayLog({ tasksDelta: isNowCompleted ? 1 : -1 });

      if (isNowCompleted) {
        playCompletionChime();
        triggerHapticFeedback();
        toast.success('Task completed! Great job! 🎉');
      }
      return updated;
    } catch (e) {
      toast.error('Failed to update task');
    }
  };

  const editTask = async (taskId, title, priority) => {
    try {
      const updated = await storageClient.entities.Task.update(taskId, {
        title,
        priority,
      });
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      toast.success('Task updated');
      return updated;
    } catch (e) {
      toast.error('Failed to edit task');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await storageClient.entities.Task.delete(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.info('Task deleted');
    } catch (e) {
      toast.error('Failed to delete task');
    }
  };

  const completeFocusSession = async (sessionType, durationSeconds) => {
    try {
      const today = getTodayStr();
      const newSession = await storageClient.entities.FocusSession.create({
        session_type: sessionType,
        duration_seconds: durationSeconds,
        session_date: today,
      });
      setSessions(prev => [newSession, ...prev]);

      const minutes = Math.round(durationSeconds / 60);
      if (minutes > 0) {
        await updateTodayLog({ focusDelta: minutes });
      }

      playCompletionChime();
      triggerHapticFeedback([300, 150, 300]);
      
      const title = sessionType === 'pomodoro' ? 'Pomodoro Completed! 🏆' : 'Focus Session Completed! ⏱️';
      NotificationService.sendNotification(
        title,
        `Awesome work! You logged ${minutes} minutes of dedicated focus.`,
        '🎯'
      );

      return newSession;
    } catch (e) {
      console.error('Failed to log session:', e);
      toast.error('Failed to log focus session');
    }
  };

  // Note operations
  const addNote = async (title, content, dateStr = getTodayStr()) => {
    if (!title.trim() && !content.trim()) return;
    try {
      const newNote = await storageClient.entities.Note.create({
        title: title.trim() || 'Untitled Note',
        content: content.trim(),
        log_date: dateStr,
      });
      setNotes(prev => [newNote, ...prev]);
      toast.success('Note saved! 📝');
      return newNote;
    } catch (e) {
      toast.error('Failed to save note');
    }
  };

  const deleteNote = async (noteId) => {
    try {
      await storageClient.entities.Note.delete(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
      toast.info('Note deleted');
    } catch (e) {
      toast.error('Failed to delete note');
    }
  };

  // Reel operations
  const addReel = async (url, title = 'Custom Reel') => {
    if (!url || !url.trim()) return;
    try {
      const newReel = await storageClient.entities.Reel.create({
        url: url.trim(),
        title: title.trim(),
      });
      setReels(prev => [newReel, ...prev]);
      toast.success('Reel added to your pool! 🎬');
      return newReel;
    } catch (e) {
      toast.error('Failed to add reel');
    }
  };

  const deleteReel = async (reelId) => {
    try {
      await storageClient.entities.Reel.delete(reelId);
      setReels(prev => prev.filter(r => r.id !== reelId));
      toast.info('Reel removed');
    } catch (e) {
      toast.error('Failed to remove reel');
    }
  };

  const streak = computeStreak(dayLogs);
  const longestStreak = getLongestStreak(dayLogs);
  const todayStr = getTodayStr();
  const todayLog = dayLogs.find(l => l.log_date === todayStr);

  return (
    <AppContext.Provider value={{
      goal,
      tasks,
      sessions,
      dayLogs,
      notes,
      reels,
      loading,
      streak,
      longestStreak,
      todayLog,
      saveGoal,
      addTask,
      toggleTask,
      editTask,
      deleteTask,
      completeFocusSession,
      addNote,
      deleteNote,
      addReel,
      deleteReel,
      refreshData: loadAllData,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
