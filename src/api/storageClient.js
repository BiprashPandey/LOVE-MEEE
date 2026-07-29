/**
 * Local Storage Client for LOVE MEEE
 * Provides zero-dependency persistent storage for Goals, Tasks, FocusSessions, DayLogs, Notes, and Instagram Reels.
 */

const STORAGE_KEYS = {
  GOALS: 'love_meee_goals',
  TASKS: 'love_meee_tasks',
  SESSIONS: 'love_meee_sessions',
  DAY_LOGS: 'love_meee_day_logs',
  NOTES: 'love_meee_notes',
  REELS: 'love_meee_reels',
  SETTINGS: 'love_meee_settings',
  USER: 'love_meee_user',
};

const DEFAULT_REELS = [
  { id: 'reel_1', url: 'https://www.instagram.com/reel/C3x9w4PL_Y7/', title: 'Never Give Up Motivation', author: 'Motivation Hub' },
  { id: 'reel_2', url: 'https://www.instagram.com/reel/C8XYZ123456/', title: 'Daily Focus & Discipline', author: 'Mindset Daily' },
  { id: 'reel_3', url: 'https://www.instagram.com/reel/C5ABC987654/', title: 'Build Your Legacy Today', author: 'Champion Mind' },
];

const getStorage = (key, defaultVal = []) => {
  try {
    const item = localStorage.getItem(key);
    if (!item && key === STORAGE_KEYS.REELS) {
      localStorage.setItem(key, JSON.stringify(DEFAULT_REELS));
      return DEFAULT_REELS;
    }
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultVal;
  }
};

const setStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('love_meee_storage_change', { detail: { key } }));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
};

const generateId = () => {
  return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

const sortItems = (items, sortField) => {
  if (!sortField) return items;
  const desc = sortField.startsWith('-');
  const field = desc ? sortField.substring(1) : sortField;
  
  return [...items].sort((a, b) => {
    let valA = a[field] ?? a.created_date ?? a.id;
    let valB = b[field] ?? b.created_date ?? b.id;
    if (valA < valB) return desc ? 1 : -1;
    if (valA > valB) return desc ? -1 : 1;
    return 0;
  });
};

function createEntityStore(storageKey, defaultData = []) {
  return {
    async list(sortField, limit) {
      let items = getStorage(storageKey, defaultData);
      if (sortField) {
        items = sortItems(items, sortField);
      }
      if (limit && limit > 0) {
        items = items.slice(0, limit);
      }
      return items;
    },

    async filter(criteria = {}) {
      const items = getStorage(storageKey, defaultData);
      return items.filter(item => {
        return Object.entries(criteria).every(([key, val]) => item[key] === val);
      });
    },

    async create(data) {
      const items = getStorage(storageKey, defaultData);
      const newItem = {
        id: generateId(),
        created_date: new Date().toISOString(),
        ...data,
      };
      items.unshift(newItem);
      setStorage(storageKey, items);
      return newItem;
    },

    async update(id, data) {
      const items = getStorage(storageKey, defaultData);
      const index = items.findIndex(item => item.id === id);
      if (index === -1) {
        throw new Error(`Item ${id} not found`);
      }
      items[index] = {
        ...items[index],
        ...data,
        updated_date: new Date().toISOString(),
      };
      setStorage(storageKey, items);
      return items[index];
    },

    async delete(id) {
      let items = getStorage(storageKey, defaultData);
      items = items.filter(item => item.id !== id);
      setStorage(storageKey, items);
      return true;
    },
  };
}

export const storageClient = {
  entities: {
    Goal: createEntityStore(STORAGE_KEYS.GOALS),
    Task: createEntityStore(STORAGE_KEYS.TASKS),
    FocusSession: createEntityStore(STORAGE_KEYS.SESSIONS),
    DayLog: createEntityStore(STORAGE_KEYS.DAY_LOGS),
    Note: createEntityStore(STORAGE_KEYS.NOTES),
    Reel: createEntityStore(STORAGE_KEYS.REELS, DEFAULT_REELS),
  },
  getUser: () => getStorage(STORAGE_KEYS.USER, { id: 'local_user', name: 'Champion', email: 'champion@lovemeee.app' }),
  setUser: (user) => setStorage(STORAGE_KEYS.USER, user),
};

export const base44 = storageClient;
